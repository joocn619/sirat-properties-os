import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LedgerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!dbUser || !['admin', 'super_admin', 'accounts_admin'].includes(dbUser.role)) redirect('/admin/dashboard')

  const { data: entries } = await supabase
    .from('ledger')
    .select('*')
    .order('transaction_date', { ascending: false })
    .limit(200)

  const all = entries ?? []
  const totalIncome = all.filter((e: any) => e.type === 'income').reduce((s: number, e: any) => s + Number(e.amount), 0)
  const totalExpense = all.filter((e: any) => e.type === 'expense').reduce((s: number, e: any) => s + Number(e.amount), 0)
  const balance = totalIncome - totalExpense

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ledger</h1>
        <p className="text-sm text-gray-500 mt-1">Income ও Expense-এর সমন্বিত হিসাব</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-5 text-center">
          <p className="text-2xl font-bold text-green-600">৳{totalIncome.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">মোট আয়</p>
        </div>
        <div className="bg-white border rounded-xl p-5 text-center">
          <p className="text-2xl font-bold text-red-600">৳{totalExpense.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">মোট ব্যয়</p>
        </div>
        <div className={`border rounded-xl p-5 text-center ${balance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {balance >= 0 ? '+' : ''}৳{balance.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">ব্যালেন্স</p>
        </div>
      </div>

      {/* Entries table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {all.map((e: any) => (
              <tr key={e.id}>
                <td className="px-4 py-3 text-xs text-gray-500">{e.transaction_date}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    e.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {e.type === 'income' ? '↑ Income' : '↓ Expense'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{e.description}</td>
                <td className={`px-4 py-3 text-right font-medium ${
                  e.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {e.type === 'income' ? '+' : '-'}৳{Number(e.amount).toLocaleString()}
                </td>
              </tr>
            ))}
            {!all.length && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">কোনো entry নেই</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
