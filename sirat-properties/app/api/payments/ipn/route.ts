import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateTransaction } from '@/lib/sslcommerz'

/**
 * SSLCommerz IPN (Instant Payment Notification)
 * Server-to-server callback — more reliable than browser redirect.
 */
export async function POST(request: Request) {
  const formData = await request.formData()
  const tranId = formData.get('tran_id') as string | null
  const valId = formData.get('val_id') as string | null
  const status = formData.get('status') as string | null

  if (!tranId || !valId) {
    return NextResponse.json({ error: 'Missing transaction data' }, { status: 400 })
  }

  const adminSupabase = createAdminClient()

  const { data: payment } = await adminSupabase
    .from('payments')
    .select('id, status')
    .eq('id', tranId)
    .single()

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  // Already processed
  if (payment.status === 'completed') {
    return NextResponse.json({ ok: true })
  }

  if (status === 'VALID' || status === 'VALIDATED') {
    const isValid = await validateTransaction(valId)
    if (isValid) {
      await adminSupabase.from('payments').update({
        status: 'completed',
        gateway_transaction_id: valId,
        gateway_response: Object.fromEntries(formData),
        updated_at: new Date().toISOString(),
      }).eq('id', tranId)
    }
  }

  return NextResponse.json({ ok: true })
}
