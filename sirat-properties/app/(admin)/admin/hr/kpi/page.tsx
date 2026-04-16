import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KpiClient } from '@/components/admin/KpiClient'

export default async function KpiPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!dbUser || !['admin', 'super_admin', 'hr_admin'].includes(dbUser.role)) redirect('/admin/dashboard')

  const [{ data: kpi }, { data: users }] = await Promise.all([
    supabase
      .from('kpi_records')
      .select('*, users(email, profiles(full_name))')
      .order('month', { ascending: false })
      .limit(100),
    supabase
      .from('users')
      .select('id, email, profiles(full_name)')
      .in('role', ['agent', 'admin', 'hr_admin', 'accounts_admin']),
  ])

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">KPI Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">কর্মী পারফরম্যান্স মূল্যায়ন</p>
      </div>
      <KpiClient initialKpi={(kpi ?? []) as any} users={(users ?? []) as any} />
    </div>
  )
}
