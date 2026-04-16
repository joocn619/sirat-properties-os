import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateTransaction } from '@/lib/sslcommerz'
import { sendEmail, emailTemplates } from '@/lib/email'

/**
 * SSLCommerz redirects here after payment (success/fail/cancel).
 * This is a POST from SSLCommerz with form data.
 */
export async function POST(request: Request) {
  const url = new URL(request.url)
  const status = url.searchParams.get('status') ?? ''
  const formData = await request.formData()

  const tranId = formData.get('tran_id') as string | null
  const valId = formData.get('val_id') as string | null
  const amount = formData.get('amount') as string | null

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  if (!tranId) {
    return NextResponse.redirect(`${siteUrl}/seller/billing?error=missing_transaction`)
  }

  const adminSupabase = createAdminClient()

  // Get payment record
  const { data: payment } = await adminSupabase
    .from('payments')
    .select('*, users(email, role)')
    .eq('id', tranId)
    .single()

  if (!payment) {
    return NextResponse.redirect(`${siteUrl}/seller/billing?error=payment_not_found`)
  }

  if (status === 'success' && valId) {
    // Validate with SSLCommerz
    const isValid = await validateTransaction(valId)

    if (isValid) {
      // Mark payment as completed
      await adminSupabase.from('payments').update({
        status: 'completed',
        gateway_transaction_id: valId,
        gateway_response: Object.fromEntries(formData),
        updated_at: new Date().toISOString(),
      }).eq('id', tranId)

      // Process based on payment type
      const meta = (payment.metadata ?? {}) as Record<string, any>

      if (payment.payment_type === 'subscription') {
        const cycle = meta.cycle ?? 'monthly'
        const periodEnd = new Date()
        periodEnd.setDate(periodEnd.getDate() + (cycle === 'yearly' ? 365 : 30))

        // Deactivate old subscriptions
        await adminSupabase.from('subscriptions')
          .update({ status: 'expired', updated_at: new Date().toISOString() })
          .eq('user_id', payment.user_id)
          .eq('status', 'active')

        // Create new subscription
        await adminSupabase.from('subscriptions').insert({
          user_id: payment.user_id,
          plan_id: meta.planId,
          status: 'active',
          billing_cycle: cycle,
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
        })
      } else if (payment.payment_type === 'featured_listing' && meta.propertyId) {
        const days = meta.days ?? 30
        const until = new Date()
        until.setDate(until.getDate() + days)

        await adminSupabase.from('properties').update({
          is_featured: true,
          featured_until: until.toISOString(),
        }).eq('id', meta.propertyId)
      } else if (payment.payment_type === 'agent_premium') {
        const months = meta.months ?? 1
        const until = new Date()
        until.setMonth(until.getMonth() + months)

        await adminSupabase.from('users').update({
          is_premium: true,
          premium_until: until.toISOString(),
        }).eq('id', payment.user_id)
      }

      return NextResponse.redirect(`${siteUrl}/seller/billing?success=true`)
    }

    // Validation failed
    await adminSupabase.from('payments').update({
      status: 'failed',
      gateway_response: Object.fromEntries(formData),
      updated_at: new Date().toISOString(),
    }).eq('id', tranId)

    return NextResponse.redirect(`${siteUrl}/seller/billing?error=validation_failed`)
  }

  // Failed or cancelled
  await adminSupabase.from('payments').update({
    status: 'failed',
    gateway_response: Object.fromEntries(formData),
    updated_at: new Date().toISOString(),
  }).eq('id', tranId)

  return NextResponse.redirect(`${siteUrl}/seller/billing?error=${status}`)
}
