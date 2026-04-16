import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PayrollClient } from '@/components/admin/PayrollClient'

export default async function PayrollPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!dbUser || !['admin', 'super_admin', 'hr_admin'].includes(dbUser.role)) redirect('/admin/dashboard')

  const [{ data: payroll }, { data: employees }] = await Promise.all([
    supabase
      .from('payroll')
      .select('*, employees(employee_id, designation, users(profiles(full_name)))')
      .order('month', { ascending: false })
      .limit(50),
    supabase
      .from('employees')
      .select('id, employee_id, designation, base_salary, users(profiles(full_name))')
      .eq('status', 'active'),
  ])

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
        <p className="text-sm text-gray-500 mt-1">মাসিক বেতন হিসাব ও ইতিহাস</p>
      </div>
      <PayrollClient
        initialPayroll={(payroll ?? []) as any}
        employees={(employees ?? []) as any}
      />
    </div>
  )
}
