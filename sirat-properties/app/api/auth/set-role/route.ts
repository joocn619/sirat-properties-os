import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Verify user is authenticated
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { role } = await request.json()
  const validRoles = ['buyer', 'seller', 'agent']
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // Use service role key — bypasses RLS
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Same email দিয়ে আগের ghost row থাকলে delete করো
  await adminSupabase.from('users').delete()
    .eq('email', user.email)
    .neq('id', user.id)

  // Now upsert with correct Auth user id
  const { error } = await adminSupabase.from('users').upsert(
    { id: user.id, email: user.email, role },
    { onConflict: 'id' }
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Ensure profile row exists
  await adminSupabase.from('profiles').upsert(
    { user_id: user.id },
    { onConflict: 'user_id' }
  )

  return NextResponse.json({ success: true, role })
}
