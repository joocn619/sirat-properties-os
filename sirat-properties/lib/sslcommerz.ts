/**
 * SSLCommerz Payment Gateway Integration
 * Docs: https://developer.sslcommerz.com/doc/v4/
 */

const STORE_ID = process.env.SSLCOMMERZ_STORE_ID ?? ''
const STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD ?? ''
const IS_SANDBOX = process.env.SSLCOMMERZ_SANDBOX !== 'false'

const BASE_URL = IS_SANDBOX
  ? 'https://sandbox.sslcommerz.com'
  : 'https://securepay.sslcommerz.com'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

interface InitPaymentParams {
  transactionId: string
  amount: number
  customerName: string
  customerEmail: string
  customerPhone?: string
  productName: string
  productCategory: 'subscription' | 'featured_listing' | 'agent_premium'
}

interface SSLCommerzInitResponse {
  status: string
  GatewayPageURL?: string
  sessionkey?: string
  faession?: string
}

export async function initPayment(params: InitPaymentParams): Promise<{ url: string; sessionKey: string } | null> {
  if (!STORE_ID || !STORE_PASSWORD) {
    console.warn('[sslcommerz] Store credentials not configured')
    return null
  }

  const body = new URLSearchParams({
    store_id: STORE_ID,
    store_passwd: STORE_PASSWORD,
    total_amount: params.amount.toString(),
    currency: 'BDT',
    tran_id: params.transactionId,
    success_url: `${SITE_URL}/api/payments/callback?status=success`,
    fail_url: `${SITE_URL}/api/payments/callback?status=fail`,
    cancel_url: `${SITE_URL}/api/payments/callback?status=cancel`,
    ipn_url: `${SITE_URL}/api/payments/ipn`,
    cus_name: params.customerName,
    cus_email: params.customerEmail,
    cus_phone: params.customerPhone ?? '01700000000',
    cus_add1: 'Dhaka',
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    shipping_method: 'NO',
    product_name: params.productName,
    product_category: params.productCategory,
    product_profile: 'non-physical-goods',
  })

  try {
    const res = await fetch(`${BASE_URL}/gwprocess/v4`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    const data: SSLCommerzInitResponse = await res.json()

    if (data.status === 'SUCCESS' && data.GatewayPageURL) {
      return { url: data.GatewayPageURL, sessionKey: data.sessionkey ?? '' }
    }

    console.error('[sslcommerz] Init failed:', data)
    return null
  } catch (err) {
    console.error('[sslcommerz] Error:', err)
    return null
  }
}

export async function validateTransaction(valId: string): Promise<boolean> {
  if (!STORE_ID || !STORE_PASSWORD) return false

  try {
    const res = await fetch(
      `${BASE_URL}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${STORE_ID}&store_passwd=${STORE_PASSWORD}&format=json`,
    )
    const data = await res.json()
    return data.status === 'VALID' || data.status === 'VALIDATED'
  } catch {
    return false
  }
}
