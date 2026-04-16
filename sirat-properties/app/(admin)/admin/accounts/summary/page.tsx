import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function MonthlySummaryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!dbUser || !['admin', 'super_admin', 'accounts_admin'].includes(dbUser.role)) redirect('/admin/dashboard')

  const thisMonth = new Date().toISOString().slice(0, 7)
  const from = `${thisMonth}-01`
  const to = `${thisMonth}-31`

  const [bookings, expenses, commissions, newUsers, properties] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, total_amount, status, created_at, properties(title)')
      .gte('created_at', from)
      .lte('created_at', to + 'T23:59:59')
      .order('created_at', { ascending: false }),
    supabase
      .from('expenses')
      .select('id, category, amount, description, expense_date')
      .gte('expense_date', from)
      .lte('expense_date', to),
    supabase
      .from('commission_deals')
      .select('id, commission_type, commission_value, status')
      .eq('status', 'released')
      .gte('created_at', from)
      .lte('created_at', to + 'T23:59:59'),
    supabase
      .from('users')
      .select('id, role, created_at')
      .gte('created_at', from)
      .lte('created_at', to + 'T23:59:59'),
    supabase
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', from)
      .lte('created_at', to + 'T23:59:59'),
  ])

  const bookingList = bookings.data ?? []
  const expenseList = expenses.data ?? []
  const commissionList = commissions.data ?? []
  const userList = newUsers.data ?? []

  const totalBookingValue = bookingList
    .filter((b: any) => b.status !== 'cancelled')
    .reduce((s: number, b: any) => s + Number(b.total_amount ?? 0), 0)
  const totalExpenses = expenseList.reduce((s: number, e: any) => s + Number(e.amount ?? 0), 0)
  const totalCommissions = commissionList.reduce((s: number, c: any) => s + Number(c.commission_value ?? 0), 0)

  const monthLabel = new Date(from).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long' })

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Monthly Summary</h1>
        <p className="text-sm text-gray-500 mt-1">{monthLabel}-এর সামগ্রিক রিপোর্ট</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Booking Value', value: `৳${totalBookingValue.toLocaleString()}`, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
          { label: 'Expenses', value: `৳${totalExpenses.toLocaleString()}`, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
          { label: 'Commissions Released', value: `৳${totalCommissions.toLocaleString()}`, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
          { label: 'New Users', value: userList.length.toString(), color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
        ].map(item => (
          <div key={item.label} className={`border rounded-xl p-5 text-center ${item.bg}`}>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Bookings ({bookingList.length})</h2>
          <div className="space-y-2">
            {bookingList.slice(0, 5).map((b: any) => (
              <div key={b.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 truncate mr-2">{(b.properties as any)?.title ?? '—'}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400">{b.status}</span>
                  <span className="font-medium text-gray-900">৳{Number(b.total_amount).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {!bookingList.length && <p className="text-sm text-gray-400">কোনো booking নেই</p>}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Expense Breakdown</h2>
          {(() => {
            const byCat: Record<string, number> = {}
            expenseList.forEach((e: any) => {
              byCat[e.category] = (byCat[e.category] ?? 0) + Number(e.amount)
            })
            const sorted = Object.entries(byCat).sort(([, a], [, b]) => b - a)
            const max = sorted[0]?.[1] ?? 1
            return sorted.length > 0 ? (
              <div className="space-y-2">
                {sorted.map(([cat, amt]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                      <span>{cat}</span>
                      <span>৳{amt.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: `${(amt / max) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400">কোনো expense নেই</p>
          })()}
        </div>

        {/* New Users */}
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">New Users ({userList.length})</h2>
          {(() => {
            const byRole: Record<string, number> = {}
            userList.forEach((u: any) => { byRole[u.role] = (byRole[u.role] ?? 0) + 1 })
            return (
              <div className="space-y-1">
                {Object.entries(byRole).map(([role, count]) => (
                  <div key={role} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{role}</span>
                    <span className="font-medium text-gray-900">{count} জন</span>
                  </div>
                ))}
                {!userList.length && <p className="text-sm text-gray-400">কোনো নতুন user নেই</p>}
              </div>
            )
          })()}
        </div>

        {/* Net Position */}
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Net Position</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Booking Revenue</span>
              <span className="text-green-600 font-medium">+৳{totalBookingValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Expenses</span>
              <span className="text-red-600 font-medium">-৳{totalExpenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Commissions Paid</span>
              <span className="text-red-600 font-medium">-৳{totalCommissions.toLocaleString()}</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-semibold text-gray-900">Net</span>
              {(() => {
                const net = totalBookingValue - totalExpenses - totalCommissions
                return (
                  <span className={`font-bold text-lg ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {net >= 0 ? '+' : ''}৳{net.toLocaleString()}
                  </span>
                )
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
