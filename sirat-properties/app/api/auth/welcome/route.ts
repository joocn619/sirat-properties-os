import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { sendEmail, emailTemplates } from '@/lib/email'

/** POST — send welcome email after profile setup */
export async function POST() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: dbUser }, { data: profile }] = await Promise.all([
    supabase.from('users').select('role, email').eq('id', user.id).single(),
    supabase.from('profiles').select('full_name').eq('user_id', user.id).single(),
  ])

  if (!dbUser?.email) return NextResponse.json({ ok: true })

  sendEmail({
    to: dbUser.email,
    subject: 'Welcome to Sirat Properties',
    html: emailTemplates.welcome(profile?.full_name ?? 'there', dbUser.role),
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
