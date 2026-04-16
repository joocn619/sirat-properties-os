import { requireDashboardSession } from '@/lib/dashboard'
import { redirect } from 'next/navigation'
import { NotificationsClient } from '@/components/notifications/NotificationsClient'

export default async function BuyerNotificationsPage() {
  const { supabase, userId } = await requireDashboardSession('buyer')
  const user = { id: userId }
  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, title, body, type, is_read, created_at, reference_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return <NotificationsClient initialNotifications={notifications ?? []} />
}
