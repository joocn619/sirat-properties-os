import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ExpensesClient } from '@/components/admin/ExpensesClient'

export default async function ExpensesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!dbUser || !['admin', 'super_admin', 'accounts_admin'].includes(dbUser.role)) redirect('/admin/dashboard')

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*, users(profiles(full_name))')
    .order('expense_date', { ascending: false })
    .limit(100)

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
        <p className="text-sm text-gray-500 mt-1">সব খরচ ট্র্যাক করুন</p>
      </div>
      <ExpensesClient initialExpenses={(expenses ?? []) as any} currentUserId={user.id} />
    </div>
  )
}
