import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EmployeesClient } from '@/components/admin/EmployeesClient'

export default async function EmployeesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!dbUser || !['admin', 'super_admin', 'hr_admin'].includes(dbUser.role)) redirect('/admin/dashboard')

  const { data: employees } = await supabase
    .from('employees')
    .select('*, users(email, profiles(full_name, avatar_url))')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
        <p className="text-sm text-gray-500 mt-1">সব employee দেখুন ও নতুন যোগ করুন</p>
      </div>
      <EmployeesClient initialEmployees={(employees ?? []) as any} />
    </div>
  )
}
