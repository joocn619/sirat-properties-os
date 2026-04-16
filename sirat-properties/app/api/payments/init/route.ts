import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { initPayment } from '@/lib/sslcommerz'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { success } = rateLimit(`payment:${user.id}`, { max: 5, windowMs: 60_000 })
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const body = await request.json().catch(() => null)
  if (!body?.type) return NextResponse.json({ error: 'Payment type required' }, { status: 400 })

  const adminSupabase = createAdminClient()

  const [{ data: dbUser }, { data: profile }] = await Promise.all([
    adminSupabase.from('users').select('email, role').eq('id', user.id).single(),
    adminSupabase.from('profiles').select('full_name').eq('user_id', user.id).single(),
  ])

  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  let amount = 0
  let productName = ''
  let paymentType: 'subscription' | 'featured_listing' | 'agent_premium' = 'subscription'
  let metadata: Record<string, any> = {}

  if (body.type === 'subscription') {
    const planId = body.planId as string
    const cycle = (body.cycle ?? 'monthly') as 'monthly' | 'yearly'

    const { data: plan } = await adminSupabase
      .from('subscription_plans').select('*').eq('id', planId).single()

    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    if (plan.id === 'free') return NextResponse.json({ error: 'Free plan needs no payment' }, { status: 400 })

    amount = cycle === 'yearly' ? plan.price_yearly : plan.price_monthly
    productName = `${plan.name} Plan (${cycle})`
    paymentType = 'subscription'
    metadata = { planId, cycle }
  } else if (body.type === 'featured_listing') {
    amount = body.amount ?? 500
    productName = 'Featured Listing Boost'
    paymentType = 'featured_listing'
    metadata = { propertyId: body.propertyId, days: body.days ?? 30 }
  } else if (body.type === 'agent_premium') {
    amount = body.amount ?? 499
    productName = 'Agent Premium Account'
    paymentType = 'agent_premium'
    metadata = { months: body.months ?? 1 }
  } else {
    return NextResponse.json({ error: 'Invalid payment type' }, { status: 400 })
  }

  // Create payment record
  const { data: payment, error: paymentError } = await adminSupabase
    .from('payments')
    .insert({
      user_id: user.id,
      amount,
      payment_type: paymentType,
      status: 'pending',
      metadata,
    })
    .select('id')
    .single()

  if (paymentError || !payment) {
    return NextResponse.json({ error: 'Could not create payment record' }, { status: 500 })
  }

  // Init SSLCommerz
  const result = await initPayment({
    transactionId: payment.id,
    amount,
    customerName: profile?.full_name ?? 'Customer',
    customerEmail: dbUser.email ?? '',
    productName,
    productCategory: paymentType,
  })

  if (!result) {
    await adminSupabase.from('payments').update({ status: 'failed' }).eq('id', payment.id)
    return NextResponse.json({ error: 'Payment gateway initialization failed' }, { status: 502 })
  }

  return NextResponse.json({ url: result.url, paymentId: payment.id })
}
