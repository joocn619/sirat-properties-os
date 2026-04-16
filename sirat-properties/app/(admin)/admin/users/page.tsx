import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserListClient } from '@/components/admin/UserListClient'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!dbUser || !['admin', 'super_admin'].includes(dbUser.role)) redirect('/admin/dashboard')

  const { data: users } = await supabase
    .from('users')
    .select('id, email, role, is_verified, is_blocked, created_at, profiles(full_name)')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">সব registered user দেখুন ও manage করুন</p>
      </div>
      <UserListClient initialUsers={(users ?? []) as any} />
    </div>
  )
}
