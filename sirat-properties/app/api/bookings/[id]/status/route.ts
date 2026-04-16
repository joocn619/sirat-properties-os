import { NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { sendEmail, emailTemplates } from '@/lib/email'

const SELLER_STATUSES = new Set(['confirmed', 'cancelled', 'completed'])

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

async function setAssetState(
  adminSupabase: ReturnType<typeof createAdminClient>,
  booking: { property_id: string | null; unit_id: string | null; buyer_id: string | null },
  state: 'available' | 'booked' | 'sold',
) {
  if (booking.unit_id) {
    const payload = state === 'available'
      ? { status: state, booked_by: null }
      : { status: state, booked_by: booking.buyer_id }

    await adminSupabase.from('property_units').update(payload).eq('id', booking.unit_id)
    return
  }

  await adminSupabase.from('properties').update({ status: state }).eq('id', booking.property_id)
}

async function releaseAssetIfNeeded(
  adminSupabase: ReturnType<typeof createAdminClient>,
  booking: { id: string; property_id: string | null; unit_id: string | null; buyer_id: string | null },
) {
  let conflictQuery = adminSupabase
    .from('bookings')
    .select('id')
    .neq('id', booking.id)
    .eq('property_id', booking.property_id)
    .in('status', ['confirmed', 'completed'])

  conflictQuery = booking.unit_id ? conflictQuery.eq('unit_id', booking.unit_id) : conflictQuery.is('unit_id', null)

  const { data: conflict } = await conflictQuery.limit(1).maybeSingle()
  if (!conflict) {
    await setAssetState(adminSupabase, booking, 'available')
  }
}

export async function PATCH(
  request: Request,
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

  const payload = await request.json().catch(() => null)
  const newStatus = typeof payload?.status === 'string' ? payload.status : ''

  if (!newStatus) {
    return jsonError('Status is required')
  }

  const adminSupabase = createAdminClient()

  const [{ data: dbUser }, { data: booking }] = await Promise.all([
    adminSupabase.from('users').select('role').eq('id', user.id).single(),
    adminSupabase
      .from('bookings')
      .select(`
        id,
        status,
        booking_type,
        buyer_id,
        property_id,
        unit_id,
        total_amount,
        properties(id, title, seller_id),
        installments(id, status)
      `)
      .eq('id', id)
      .single(),
  ])

  if (!booking) {
    return jsonError('Booking not found', 404)
  }

  if (!dbUser) {
    return jsonError('Unauthorized', 403)
  }

  const sellerId = (booking.properties as { seller_id?: string } | null)?.seller_id ?? null
  const propertyTitle = (booking.properties as { title?: string } | null)?.title ?? 'this property'

  const isBuyer = booking.buyer_id === user.id
  const isSeller = sellerId === user.id

  if (dbUser.role === 'buyer') {
    if (!isBuyer) {
      return jsonError('Unauthorized', 403)
    }

    if (newStatus !== 'cancelled') {
      return jsonError('Buyers can only cancel a booking', 403)
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      return jsonError('This booking can no longer be cancelled', 409)
    }
  } else if (dbUser.role === 'seller') {
    if (!isSeller) {
      return jsonError('Unauthorized', 403)
    }

    if (!SELLER_STATUSES.has(newStatus)) {
      return jsonError('Invalid booking status', 403)
    }

    if (newStatus === 'confirmed' && booking.status !== 'pending') {
      return jsonError('Only pending bookings can be confirmed', 409)
    }

    if (newStatus === 'cancelled' && !['pending', 'confirmed'].includes(booking.status)) {
      return jsonError('This booking cannot be cancelled now', 409)
    }

    if (newStatus === 'completed') {
      if (booking.status !== 'confirmed') {
        return jsonError('Only confirmed bookings can be completed', 409)
      }

      const hasPendingInstallments = (booking.installments ?? []).some((installment: { status: string }) => installment.status !== 'paid')
      if (hasPendingInstallments) {
        return jsonError('All installments must be paid before completion', 409)
      }
    }
  } else {
    return jsonError('Unauthorized', 403)
  }

  if (newStatus === 'confirmed') {
    let conflictQuery = adminSupabase
      .from('bookings')
      .select('id')
      .neq('id', booking.id)
      .eq('property_id', booking.property_id)
      .in('status', ['confirmed', 'completed'])

    conflictQuery = booking.unit_id ? conflictQuery.eq('unit_id', booking.unit_id) : conflictQuery.is('unit_id', null)

    const { data: conflict } = await conflictQuery.limit(1).maybeSingle()
    if (conflict) {
      return jsonError('Another confirmed booking already exists for this inventory', 409)
    }
  }

  const { error: updateError } = await adminSupabase.from('bookings').update({ status: newStatus }).eq('id', booking.id)
  if (updateError) {
    return jsonError(updateError.message, 500)
  }

  if (newStatus === 'confirmed') {
    await setAssetState(adminSupabase, booking, 'booked')
  } else if (newStatus === 'cancelled') {
    if (booking.status === 'confirmed') {
      await releaseAssetIfNeeded(adminSupabase, booking)
    }
  } else if (newStatus === 'completed') {
    await setAssetState(adminSupabase, booking, 'sold')
  }

  const actorLabel = dbUser.role === 'seller' ? 'Seller' : 'Buyer'
  const buyerMessage = newStatus === 'confirmed'
    ? `${propertyTitle} has been confirmed by the seller.`
    : newStatus === 'completed'
      ? `${propertyTitle} is now marked as completed.`
      : `${actorLabel} updated the booking for ${propertyTitle} to cancelled.`

  await Promise.all([
    createNotification(
      adminSupabase,
      booking.buyer_id,
      `Booking ${newStatus}`,
      buyerMessage,
      'booking',
      booking.id,
    ),
    dbUser.role === 'buyer'
      ? createNotification(
          adminSupabase,
          sellerId,
          'Booking cancelled by buyer',
          `The buyer cancelled the booking request for ${propertyTitle}.`,
          'booking',
          booking.id,
        )
      : Promise.resolve(),
  ])

  // Send email to buyer about status change (best-effort)
  try {
    const [{ data: buyerUser }, { data: buyerProfile }] = await Promise.all([
      adminSupabase.from('users').select('email').eq('id', booking.buyer_id).single(),
      adminSupabase.from('profiles').select('full_name').eq('user_id', booking.buyer_id).single(),
    ])
    if (buyerUser?.email) {
      sendEmail({
        to: buyerUser.email,
        subject: `Booking ${newStatus} — ${propertyTitle}`,
        html: emailTemplates.bookingStatusChanged(
          buyerProfile?.full_name ?? 'Buyer',
          propertyTitle,
          newStatus,
        ),
      }).catch(() => {})
    }
  } catch { /* non-critical */ }

  return NextResponse.json({ success: true, status: newStatus })
}
