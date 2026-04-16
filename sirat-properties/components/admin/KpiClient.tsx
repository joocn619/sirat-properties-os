'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface KpiRecord {
  id: string
  user_id: string
  month: string
  leads_generated: number
  sales_closed: number
  tasks_completed: number
  score: number
  notes: string | null
  users: { email: string; profiles: { full_name: string | null } | null } | null
}

interface User {
  id: string
  email: string
  profiles: { full_name: string | null } | null
}

export function KpiClient({ initialKpi, users }: { initialKpi: KpiRecord[]; users: User[] }) {
  const thisMonth = new Date().toISOString().slice(0, 7)
  const [records, setRecords] = useState<KpiRecord[]>(initialKpi)
  const [month, setMonth] = useState(thisMonth)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    user_id: '', leads_generated: '0', sales_closed: '0', tasks_completed: '0', score: '0', notes: '',
  })
  const supabase = createClient()

  const filtered = records.filter(r => r.month?.startsWith(month))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data } = await supabase
      .from('kpi_records')
      .upsert({
        user_id: form.user_id,
        month: month + '-01',
        leads_generated: Number(form.leads_generated),
        sales_closed: Number(form.sales_closed),
        tasks_completed: Number(form.tasks_completed),
        score: Number(form.score),
        notes: form.notes || null,
      }, { onConflict: 'user_id,month' })
      .select('*, users(email, profiles(full_name))')
      .single()

    if (data) {
      setRecords(prev => {
        const existing = prev.findIndex(r => r.user_id === form.user_id && r.month?.startsWith(month))
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = data as any
          return updated
        }
        return [data as any, ...prev]
      })
      setShowForm(false)
      setForm({ user_id: '', leads_generated: '0', sales_closed: '0', tasks_completed: '0', score: '0', notes: '' })
    }
    setSaving(false)
  }

  const maxScore = Math.max(...filtered.map(r => r.score), 1)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm" />
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700">
          + KPI Enter করুন
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white border rounded-xl p-5 mb-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs text-gray-600 block mb-1">Employee</label>
            <select value={form.user_id} onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}
              required className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Select employee...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.profiles?.full_name ?? u.email}
                </option>
              ))}
            </select>
          </div>
          {[
            { key: 'leads_generated', label: 'Leads Generated' },
            { key: 'sales_closed', label: 'Sales Closed' },
            { key: 'tasks_completed', label: 'Tasks Completed' },
            { key: 'score', label: 'Score (0–100)' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs text-gray-600 block mb-1">{label}</label>
              <input type="number" value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" min="0" />
            </div>
          ))}
          <div className="col-span-2">
            <label className="text-xs text-gray-600 block mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" />
          </div>
          <div className="col-span-2 flex gap-2">
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save KPI'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {/* KPI Dashboard — CSS bar chart */}
      {filtered.length > 0 && (
        <div className="bg-white border rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Score Leaderboard</h3>
          <div className="space-y-3">
            {[...filtered].sort((a, b) => b.score - a.score).map(r => (
              <div key={r.id} className="flex items-center gap-3">
                <div className="w-32 shrink-0 text-sm text-gray-700 truncate">
                  {r.users?.profiles?.full_name ?? r.users?.email ?? '—'}
                </div>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all flex items-center justify-end pr-2"
                    style={{ width: `${(r.score / maxScore) * 100}%` }}
                  >
                    <span className="text-white text-xs font-bold">{r.score}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 shrink-0">
                  {r.leads_generated}L • {r.sales_closed}S • {r.tasks_completed}T
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Leads</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Sales</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tasks</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(r => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {r.users?.profiles?.full_name ?? r.users?.email ?? '—'}
                </td>
                <td className="px-4 py-3 text-center text-blue-600">{r.leads_generated}</td>
                <td className="px-4 py-3 text-center text-green-600">{r.sales_closed}</td>
                <td className="px-4 py-3 text-center text-orange-600">{r.tasks_completed}</td>
                <td className="px-4 py-3 text-center font-bold text-gray-900">{r.score}</td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">এই মাসে কোনো KPI নেই</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
