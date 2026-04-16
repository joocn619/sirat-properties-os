'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  role: string
  is_verified: boolean
  is_blocked: boolean
  created_at: string
  profiles: { full_name: string | null } | null
}

const ROLE_COLOR: Record<string, string> = {
  buyer:          'bg-blue-100 text-blue-700',
  seller:         'bg-green-100 text-green-700',
  agent:          'bg-purple-100 text-purple-700',
  admin:          'bg-red-100 text-red-700',
  super_admin:    'bg-red-200 text-red-800',
  hr_admin:       'bg-orange-100 text-orange-700',
  accounts_admin: 'bg-yellow-100 text-yellow-700',
}

export function UserListClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return (
      u.email?.toLowerCase().includes(q) ||
      u.profiles?.full_name?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    )
  })

  async function toggleBlock(u: User) {
    setLoading(u.id)
    await supabase
      .from('users')
      .update({ is_blocked: !u.is_blocked })
      .eq('id', u.id)
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_blocked: !x.is_blocked } : x))
    setLoading(null)
  }

  async function deleteUser(id: string) {
    if (!confirm('এই user-কে delete করবেন? এটি পূর্বাবস্থায় ফেরানো যাবে না।')) return
    setLoading(id)
    await supabase.from('users').delete().eq('id', id)
    setUsers(prev => prev.filter(u => u.id !== id))
    setLoading(null)
  }

  return (
    <div>
      <div className="mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="নাম বা email দিয়ে search করুন..."
          className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name / Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(u => (
              <tr key={u.id} className={u.is_blocked ? 'bg-red-50' : ''}>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{u.profiles?.full_name ?? '—'}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLOR[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {u.is_verified ? (
                      <span className="text-xs text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-xs text-gray-400">Unverified</span>
                    )}
                    {u.is_blocked && (
                      <span className="text-xs text-red-600 font-medium">Blocked</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(u.created_at).toLocaleDateString('bn-BD')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => toggleBlock(u)}
                      disabled={loading === u.id}
                      className={`text-xs px-3 py-1 rounded-lg ${
                        u.is_blocked
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                      } disabled:opacity-50`}
                    >
                      {loading === u.id ? '...' : u.is_blocked ? 'Unblock' : 'Block'}
                    </button>
                    <button
                      onClick={() => deleteUser(u.id)}
                      disabled={loading === u.id}
                      className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400 text-sm">
                  কোনো user পাওয়া যায়নি
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-2">{filtered.length} জন user</p>
    </div>
  )
}
