'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Expense {
  id: string
  category: string
  amount: number
  description: string
  expense_date: string
  created_at: string
  users: { profiles: { full_name: string | null } | null } | null
}

const CATEGORIES = ['Office', 'Marketing', 'Travel', 'Utilities', 'Salary', 'Maintenance', 'Legal', 'Other']

export function ExpensesClient({ initialExpenses, currentUserId }: { initialExpenses: Expense[]; currentUserId: string }) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterCat, setFilterCat] = useState('')
  const [form, setForm] = useState({
    category: 'Office', amount: '', description: '', expense_date: new Date().toISOString().split('T')[0],
  })
  const supabase = createClient()

  const filtered = filterCat ? expenses.filter(e => e.category === filterCat) : expenses
  const total = filtered.reduce((sum, e) => sum + Number(e.amount), 0)

  async function submit(evt: React.FormEvent) {
    evt.preventDefault()
    setSaving(true)
    const { data } = await supabase
      .from('expenses')
      .insert({
        recorded_by: currentUserId,
        category: form.category,
        amount: Number(form.amount),
        description: form.description,
        expense_date: form.expense_date,
      })
      .select('*, users(profiles(full_name))')
      .single()

    if (data) {
      setExpenses(prev => [data as any, ...prev])
      setShowForm(false)
      setForm({ category: 'Office', amount: '', description: '', expense_date: new Date().toISOString().split('T')[0] })
    }
    setSaving(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm">
            <option value="">সব Category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="text-sm text-gray-600 font-medium">মোট: ৳{total.toLocaleString()}</span>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700">
          + নতুন Expense
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white border rounded-xl p-5 mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Amount (৳)</label>
            <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="5000" />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-600 block mb-1">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Date</label>
            <input type="date" value={form.expense_date} onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))}
              required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Add Expense'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(e => (
              <tr key={e.id}>
                <td className="px-4 py-3 text-xs text-gray-500">{e.expense_date}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{e.category}</span>
                </td>
                <td className="px-4 py-3 text-gray-700">{e.description}</td>
                <td className="px-4 py-3 text-right font-medium text-red-600">৳{Number(e.amount).toLocaleString()}</td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">কোনো expense নেই</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
