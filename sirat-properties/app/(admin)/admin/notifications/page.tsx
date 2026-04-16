import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NotificationsClient } from '@/components/notifications/NotificationsClient'

export default async function AdminNotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, title, body, type, is_read, created_at, reference_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return <NotificationsClient initialNotifications={notifications ?? []} />
}
