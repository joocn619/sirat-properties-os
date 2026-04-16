import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  // Verify the user is authenticated
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit: 3 KYC uploads per 10 minutes
  const { success } = rateLimit(`kyc:${user.id}`, { max: 3, windowMs: 10 * 60_000 })
  if (!success) return NextResponse.json({ error: 'Too many uploads. Please wait.' }, { status: 429 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const docType = formData.get('docType') as string | null

  if (!file || !docType) {
    return NextResponse.json({ error: 'Missing file or docType' }, { status: 400 })
  }

  // Use service role client for private bucket upload
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const ext = file.name.split('.').pop()
  const filePath = `${user.id}/${docType}-${Date.now()}.${ext}`
  const arrayBuffer = await file.arrayBuffer()

  const { error: uploadError } = await adminSupabase.storage
    .from('kyc-docs')
    .upload(filePath, arrayBuffer, { contentType: file.type })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  // Store the document as pending — admin must review and approve
  const { error: dbError } = await adminSupabase.from('kyc_documents').insert({
    user_id: user.id,
    doc_type: docType,
    doc_url: filePath,
    status: 'pending',
  })

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  // Notify admins about new KYC submission (best-effort, ignore errors)
  try {
    await adminSupabase.from('notifications').insert({
      user_id: user.id,
      type: 'kyc_submitted',
      title: 'KYC document submitted',
      message: `A new ${docType} document has been submitted for review.`,
      data: { doc_type: docType },
    })
  } catch {
    // non-critical — don't block the response
  }

  // Return user role so frontend can redirect to profile setup
  const { data: userData } = await adminSupabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ success: true, role: userData?.role })
}
