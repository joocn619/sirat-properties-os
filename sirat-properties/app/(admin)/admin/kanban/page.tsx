import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
const KanbanBoard = dynamic(() => import('@/components/kanban/KanbanBoard').then(m => m.KanbanBoard), {
  loading: () => <div className="h-96 animate-pulse rounded-2xl bg-white/[0.04]" />,
})

export default async function KanbanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!dbUser || !['admin', 'super_admin', 'hr_admin'].includes(dbUser.role)) redirect('/auth/login')

  // Fetch tasks with assignee + project info
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      assignee:users!assigned_to(profiles(full_name)),
      projects(name)
    `)
    .order('created_at', { ascending: false })

  // All users that can be assigned (agents, hr, accounts admins, etc.)
  const { data: assignableUsers } = await supabase
    .from('users')
    .select('id, profiles(full_name)')
    .in('role', ['agent', 'admin', 'super_admin', 'hr_admin', 'accounts_admin'])

  // Get super admin id for completion notification
  const { data: superAdmin } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'super_admin')
    .limit(1)
    .single()

  const employees = (assignableUsers ?? []).map((u: any) => ({
    id: u.id,
    profiles: u.profiles,
  }))

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
        <p className="text-sm text-gray-500 mt-1">Task drag করে column-এ move করুন অথবা button ব্যবহার করুন</p>
      </div>

      <KanbanBoard
        initialTasks={(tasks ?? []) as any}
        employees={employees as any}
        currentUserId={user.id}
        superAdminId={superAdmin?.id ?? null}
      />
    </div>
  )
}
