import { NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { sendEmail, emailTemplates } from '@/lib/email'

const BOOKING_TYPES = new Set(['full_payment', 'installment', 'rent'])
const INSTALLMENT_INTERVALS = new Set([30, 60, 90])

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

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return jsonError('Unauthorized', 401)
  }

  // Rate limit: 5 bookings per minute per user
  const { success } = rateLimit(`booking:${user.id}`, { max: 5, windowMs: 60_000 })
  if (!success) {
    return jsonError('Too many requests. Please wait a moment.', 429)
  }

  const payload = await request.json().catch(() => null)
  if (!payload) {
    return jsonError('Invalid booking payload')
  }

  const propertyId = typeof payload.propertyId === 'string' ? payload.propertyId : ''
  const unitId = typeof payload.unitId === 'string' && payload.unitId ? payload.unitId : null
  const bookingType = typeof payload.bookingType === 'string' ? payload.bookingType : ''
  const totalAmount = Number(payload.totalAmount)
  const advanceAmount = payload.advanceAmount === '' || payload.advanceAmount === null || payload.advanceAmount === undefined
    ? null
    : Number(payload.advanceAmount)
  const installmentCount = payload.installmentCount === '' || payload.installmentCount === null || payload.installmentCount === undefined
    ? null
    : Number(payload.installmentCount)
  const intervalDays = payload.intervalDays === '' || payload.intervalDays === null || payload.intervalDays === undefined
    ? null
    : Number(payload.intervalDays)
  const notes = typeof payload.notes === 'string' && payload.notes.trim() ? payload.notes.trim() : null

  if (!propertyId) {
    return jsonError('Property is required')
  }

  if (!BOOKING_TYPES.has(bookingType)) {
    return jsonError('Invalid booking type')
  }

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    return jsonError('Enter a valid total amount')
  }

  if (advanceAmount !== null && (!Number.isFinite(advanceAmount) || advanceAmount < 0)) {
    return jsonError('Enter a valid advance amount')
  }

  if (bookingType === 'installment') {
    if (!installmentCount || installmentCount < 2) {
      return jsonError('Installment bookings need at least 2 installments')
    }

    if (!intervalDays || !INSTALLMENT_INTERVALS.has(intervalDays)) {
      return jsonError('Choose a valid installment interval')
    }

    if (advanceAmount === null) {
      return jsonError('Installment bookings require an advance amount')
    }

    if (advanceAmount >= totalAmount) {
      return jsonError('Advance amount must stay below the total amount')
    }
  }

  const adminSupabase = createAdminClient()

  const [{ data: dbUser }, { data: property }] = await Promise.all([
    adminSupabase.from('users').select('role, email').eq('id', user.id).single(),
    adminSupabase
      .from('properties')
      .select('id, title, seller_id, status, is_published, property_units(id, unit_number, status, price)')
      .eq('id', propertyId)
      .single(),
  ])

  if (!dbUser || dbUser.role !== 'buyer') {
    return jsonError('Only buyers can create bookings', 403)
  }

  if (!property || !property.is_published) {
    return jsonError('Property not found', 404)
  }

  const propertyUnits = property.property_units ?? []

  if (!propertyUnits.length && property.status !== 'available') {
    return jsonError('This property is not currently available', 409)
  }

  const selectedUnit = unitId ? propertyUnits.find((unit: { id: string }) => unit.id === unitId) : null

  if (propertyUnits.length > 0 && !selectedUnit) {
    return jsonError('Please choose an available unit for this property')
  }

  if (unitId && !selectedUnit) {
    return jsonError('Selected unit was not found', 404)
  }

  if (selectedUnit && selectedUnit.status !== 'available') {
    return jsonError('Selected unit is no longer available', 409)
  }

  let duplicateQuery = adminSupabase
    .from('bookings')
    .select('id')
    .eq('buyer_id', user.id)
    .eq('property_id', propertyId)
    .in('status', ['pending', 'confirmed'])

  duplicateQuery = unitId ? duplicateQuery.eq('unit_id', unitId) : duplicateQuery.is('unit_id', null)

  const { data: duplicateBooking } = await duplicateQuery.limit(1).maybeSingle()
  if (duplicateBooking) {
    return jsonError('You already have an active booking for this property', 409)
  }

  const { data: booking, error: bookingError } = await adminSupabase
    .from('bookings')
    .insert({
      buyer_id: user.id,
      property_id: propertyId,
      unit_id: unitId,
      booking_type: bookingType,
      total_amount: totalAmount,
      advance_amount: advanceAmount,
      status: 'pending',
      notes,
    })
    .select('id')
    .single()

  if (bookingError || !booking) {
    return jsonError(bookingError?.message ?? 'Booking could not be created', 500)
  }

  if (bookingType === 'installment' && installmentCount && intervalDays) {
    const remainingAmount = totalAmount - (advanceAmount ?? 0)
    const standardAmount = Math.floor(remainingAmount / installmentCount)
    const installments = Array.from({ length: installmentCount }, (_, index) => {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + intervalDays * (index + 1))

      return {
        booking_id: booking.id,
        installment_number: index + 1,
        due_date: dueDate.toISOString().slice(0, 10),
        amount: index === installmentCount - 1
          ? remainingAmount - standardAmount * (installmentCount - 1)
          : standardAmount,
        status: 'pending',
      }
    })

    const { error: installmentError } = await adminSupabase.from('installments').insert(installments)
    if (installmentError) {
      await adminSupabase.from('bookings').delete().eq('id', booking.id)
      return jsonError(installmentError.message, 500)
    }
  }

  await Promise.all([
    createNotification(
      adminSupabase,
      property.seller_id,
      'New booking request',
      `${property.title} has a new ${bookingType.replace('_', ' ')} request waiting for review.`,
      'booking',
      booking.id,
    ),
    createNotification(
      adminSupabase,
      user.id,
      'Booking request submitted',
      `Your request for ${property.title} has been sent to the seller.`,
      'booking',
      booking.id,
    ),
  ])

  // Send emails (best-effort, non-blocking)
  const amountStr = `৳${totalAmount.toLocaleString()}`
  const typeStr = bookingType.replace('_', ' ')

  // Get names for email templates
  const [{ data: buyerProfile }, { data: sellerData }] = await Promise.all([
    adminSupabase.from('profiles').select('full_name').eq('user_id', user.id).single(),
    adminSupabase.from('users').select('email, profiles(full_name)').eq('id', property.seller_id).single(),
  ])

  const buyerName = buyerProfile?.full_name ?? 'Buyer'
  const sellerName = (sellerData as any)?.profiles?.full_name ?? 'Seller'
  const sellerEmail = sellerData?.email

  // Send to buyer
  sendEmail({
    to: dbUser.email,
    subject: `Booking Request Sent — ${property.title}`,
    html: emailTemplates.bookingCreated(buyerName, property.title, typeStr, amountStr),
  }).catch(() => {})

  // Send to seller
  if (sellerEmail) {
    sendEmail({
      to: sellerEmail,
      subject: `New Booking Request — ${property.title}`,
      html: emailTemplates.sellerNewBooking(sellerName, buyerName, property.title, amountStr),
    }).catch(() => {})
  }

  return NextResponse.json({
    success: true,
    bookingId: booking.id,
    redirectTo: `/buyer/bookings/${booking.id}`,
  })
}
