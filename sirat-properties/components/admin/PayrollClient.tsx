'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PayrollEntry {
  id: string
  month: string
  base_salary: number
  bonus: number
  deductions: number
  net_salary: number
  status: string
  employees: {
    employee_id: string
    designation: string
    users: { profiles: { full_name: string | null } | null } | null
  } | null
}

interface Employee {
  id: string
  employee_id: string
  designation: string
  base_salary: number
  users: { profiles: { full_name: string | null } | null } | null
}

export function PayrollClient({
  initialPayroll,
  employees,
}: {
  initialPayroll: PayrollEntry[]
  employees: Employee[]
}) {
  const [payroll, setPayroll] = useState<PayrollEntry[]>(initialPayroll)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    employee_id: '', month: '', bonus: '0', deductions: '0',
  })
  const supabase = createClient()

  const selectedEmp = employees.find(e => e.id === form.employee_id)
  const baseSalary = selectedEmp?.base_salary ?? 0
  const net = baseSalary + Number(form.bonus || 0) - Number(form.deductions || 0)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedEmp) return
    setSaving(true)

    const { data } = await supabase
      .from('payroll')
      .insert({
        employee_id: form.employee_id,
        month: form.month + '-01',
        base_salary: baseSalary,
        bonus: Number(form.bonus || 0),
        deductions: Number(form.deductions || 0),
        net_salary: net,
      })
      .select('*, employees(employee_id, designation, users(profiles(full_name)))')
      .single()

    if (data) {
      setPayroll(prev => [data as any, ...prev])
      setShowForm(false)
      setForm({ employee_id: '', month: '', bonus: '0', deductions: '0' })
    }
    setSaving(false)
  }

  async function markPaid(id: string) {
    setMarkingId(id)
    await supabase
      .from('payroll')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', id)
    setPayroll(prev => prev.map(p => p.id === id ? { ...p, status: 'paid' } : p))
    setMarkingId(null)
  }

  const thisMonth = new Date().toISOString().slice(0, 7)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{payroll.length}টি payroll entry</p>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700">
          + নতুন Payroll
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white border rounded-xl p-5 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Employee</label>
              <select value={form.employee_id} onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
                required className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Select employee...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.users?.profiles?.full_name ?? emp.employee_id} ({emp.designation})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Month</label>
              <input type="month" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                required className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Bonus (৳)</label>
              <input type="number" value={form.bonus} onChange={e => setForm(f => ({ ...f, bonus: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Deductions (৳)</label>
              <input type="number" value={form.deductions} onChange={e => setForm(f => ({ ...f, deductions: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          {selectedEmp && (
            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              <p className="text-gray-500">Base: <span className="font-medium text-gray-900">৳{baseSalary.toLocaleString()}</span></p>
              <p className="text-gray-500 mt-1">Net Salary: <span className="font-bold text-green-700 text-base">৳{net.toLocaleString()}</span></p>
            </div>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Payroll তৈরি করুন'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {payroll.map(p => (
          <div key={p.id} className="bg-white border rounded-xl p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">
                {(p.employees as any)?.users?.profiles?.full_name ?? (p.employees as any)?.employee_id ?? '—'}
              </p>
              <p className="text-xs text-gray-500">
                {(p.employees as any)?.designation} • {new Date(p.month).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long' })}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">৳{Number(p.net_salary).toLocaleString()}</p>
              <p className="text-xs text-gray-400">
                Base {Number(p.base_salary).toLocaleString()} + {Number(p.bonus).toLocaleString()} - {Number(p.deductions).toLocaleString()}
              </p>
            </div>
            <div>
              {p.status === 'paid' ? (
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">✓ Paid</span>
              ) : (
                <button onClick={() => markPaid(p.id)} disabled={markingId === p.id}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 disabled:opacity-50">
                  {markingId === p.id ? '...' : 'Mark Paid'}
                </button>
              )}
            </div>
          </div>
        ))}
        {!payroll.length && (
          <div className="text-center py-12 border-2 border-dashed rounded-xl text-gray-400">
            <p>কোনো payroll entry নেই</p>
          </div>
        )}
      </div>
    </div>
  )
}
