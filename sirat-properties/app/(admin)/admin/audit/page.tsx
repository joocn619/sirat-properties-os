import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AuditLogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!dbUser || !['admin', 'super_admin'].includes(dbUser.role)) redirect('/admin/dashboard')

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*, users(email, profiles(full_name))')
    .order('created_at', { ascending: false })
    .limit(100)

  const ACTION_COLOR: Record<string, string> = {
    insert: 'bg-green-100 text-green-700',
    update: 'bg-blue-100 text-blue-700',
    delete: 'bg-red-100 text-red-700',
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-sm text-gray-500 mt-1">সিস্টেমের সব গুরুত্বপূর্ণ activity</p>
      </div>

      {(!logs || logs.length === 0) && (
        <div className="text-center py-16 border-2 border-dashed rounded-xl text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p>কোনো audit log নেই</p>
          <p className="text-sm mt-1">Database triggers দিয়ে audit logs populate হবে</p>
        </div>
      )}

      {logs && logs.length > 0 && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Time</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Table</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log: any) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(log.created_at).toLocaleString('bn-BD')}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900">{log.users?.profiles?.full_name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{log.users?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ACTION_COLOR[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-600">{log.table_name}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{log.ip_address ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
