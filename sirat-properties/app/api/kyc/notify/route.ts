import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { sendEmail, emailTemplates } from '@/lib/email'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only admins can trigger this
  const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!dbUser || !['admin', 'super_admin'].includes(dbUser.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  if (!body?.email || !body?.status) return NextResponse.json({ ok: true })

  const { email, status, userName } = body

  if (status === 'approved') {
    sendEmail({
      to: email,
      subject: 'KYC Verification Approved',
      html: emailTemplates.kycApproved(userName ?? 'User'),
    }).catch(() => {})
  } else {
    sendEmail({
      to: email,
      subject: 'KYC Verification Update',
      html: emailTemplates.kycRejected(userName ?? 'User'),
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
