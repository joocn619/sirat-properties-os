import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

/** POST — toggle save/unsave a property */
export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { success } = rateLimit(`save:${user.id}`, { max: 30, windowMs: 60_000 })
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const body = await request.json().catch(() => null)
  if (!body?.propertyId) return NextResponse.json({ error: 'propertyId required' }, { status: 400 })

  // Check if already saved
  const { data: existing } = await supabase
    .from('saved_properties')
    .select('id')
    .eq('user_id', user.id)
    .eq('property_id', body.propertyId)
    .single()

  if (existing) {
    // Unsave
    await supabase.from('saved_properties').delete().eq('id', existing.id)
    return NextResponse.json({ saved: false })
  }

  // Save
  const { error } = await supabase
    .from('saved_properties')
    .insert({ user_id: user.id, property_id: body.propertyId })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ saved: true })
}

/** GET — list saved property IDs for current user */
export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('saved_properties')
    .select('property_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ ids: (data ?? []).map((d: any) => d.property_id) })
}
