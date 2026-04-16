import { NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { sendEmail, emailTemplates } from '@/lib/email'

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

async function createNotification(adminSupabase: ReturnType<typeof createAdminClient>, userId: string | null | undefined, title: string, body: string, type: string, referenceId: string) {
  if (!userId) {
    return
  }

  await adminSupabase.from('notifications').insert({
    user_id: userId,
    title,
    body,
    type,
    reference_id: referenceId,
  })
}

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return jsonError('Unauthorized', 401)
  }

  const adminSupabase = createAdminClient()

  const { data: installment } = await adminSupabase
    .from('installments')
    .select('id, booking_id, installment_number, amount, status, paid_at')
    .eq('id', id)
    .single()

  if (!installment) {
    return jsonError('Installment not found', 404)
  }

  const { data: booking } = await adminSupabase
    .from('bookings')
    .select('id, status, buyer_id, unit_id, property_id, properties(id, title, seller_id)')
    .eq('id', installment.booking_id)
    .single()

  if (!booking) {
    return jsonError('Booking not found', 404)
  }

  const sellerId = (booking.properties as { seller_id?: string } | null)?.seller_id ?? null
  const propertyTitle = (booking.properties as { title?: string } | null)?.title ?? 'this property'

  if (booking.buyer_id !== user.id && sellerId !== user.id) {
    return jsonError('Unauthorized', 403)
  }

  if (installment.status === 'paid') {
    return NextResponse.json({ success: true, installment, bookingCompleted: booking.status === 'completed' })
  }

  const paidAt = new Date().toISOString()
  const { data: updatedInstallment, error: updateError } = await adminSupabase
    .from('installments')
    .update({ status: 'paid', paid_at: paidAt })
    .eq('id', installment.id)
    .select('id, booking_id, installment_number, amount, status, paid_at')
    .single()

  if (updateError || !updatedInstallment) {
    return jsonError(updateError?.message ?? 'Installment payment could not be saved', 500)
  }

  const { data: remainingInstallments } = await adminSupabase
    .from('installments')
    .select('id, status')
    .eq('booking_id', booking.id)

  const allPaid = (remainingInstallments ?? []).every((entry: { status: string }) => entry.status === 'paid')

  if (allPaid && booking.status === 'confirmed') {
    await adminSupabase.from('bookings').update({ status: 'completed' }).eq('id', booking.id)

    if (booking.unit_id) {
      await adminSupabase
        .from('property_units')
        .update({ status: 'sold', booked_by: booking.buyer_id })
        .eq('id', booking.unit_id)
    } else {
      await adminSupabase.from('properties').update({ status: 'sold' }).eq('id', booking.property_id)
    }
  }

  await Promise.all([
    createNotification(
      adminSupabase,
      booking.buyer_id,
      'Installment recorded',
      `Installment ${updatedInstallment.installment_number} for ${propertyTitle} has been marked as paid.`,
      'installment',
      booking.id,
    ),
    createNotification(
      adminSupabase,
      sellerId,
      'Installment payment received',
      `Installment ${updatedInstallment.installment_number} for ${propertyTitle} is now paid.`,
      'installment',
      booking.id,
    ),
  ])

  // Send email to buyer (best-effort)
  try {
    const [{ data: buyerUser }, { data: buyerProfile }] = await Promise.all([
      adminSupabase.from('users').select('email').eq('id', booking.buyer_id).single(),
      adminSupabase.from('profiles').select('full_name').eq('user_id', booking.buyer_id).single(),
    ])
    if (buyerUser?.email) {
      sendEmail({
        to: buyerUser.email,
        subject: `Payment Recorded — Installment #${updatedInstallment.installment_number}`,
        html: emailTemplates.installmentPaid(
          buyerProfile?.full_name ?? 'Buyer',
          propertyTitle,
          updatedInstallment.installment_number,
          `৳${Number(updatedInstallment.amount).toLocaleString()}`,
        ),
      }).catch(() => {})
    }
  } catch { /* non-critical */ }

  return NextResponse.json({
    success: true,
    installment: updatedInstallment,
    bookingCompleted: allPaid && booking.status === 'confirmed',
  })
}
