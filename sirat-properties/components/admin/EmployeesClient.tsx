'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Employee {
  id: string
  employee_id: string
  department: string
  designation: string
  join_date: string
  base_salary: number
  status: string
  users: { email: string; profiles: { full_name: string | null } | null } | null
}

export function EmployeesClient({ initialEmployees }: { initialEmployees: Employee[] }) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    employee_id: '', department: '', designation: '',
    join_date: '', base_salary: '',
  })
  const supabase = createClient()
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data } = await supabase
      .from('employees')
      .insert({
        ...form,
        base_salary: Number(form.base_salary),
      })
      .select('*, users(email, profiles(full_name))')
      .single()
    if (data) {
      setEmployees(prev => [data as any, ...prev])
      setShowForm(false)
      setForm({ employee_id: '', department: '', designation: '', join_date: '', base_salary: '' })
    }
    setSaving(false)
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('employees').update({ status }).eq('id', id)
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status } : e))
  }

  const statusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    resigned: 'bg-gray-100 text-gray-600',
    terminated: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{employees.length} জন employee</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700"
        >
          + নতুন Employee
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white border rounded-xl p-5 mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Employee ID</label>
            <input value={form.employee_id} onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
              required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="EMP-001" />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Department</label>
            <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
              required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Sales" />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Designation</label>
            <input value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
              required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Sales Executive" />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Join Date</label>
            <input type="date" value={form.join_date} onChange={e => setForm(f => ({ ...f, join_date: e.target.value }))}
              required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Base Salary (৳)</label>
            <input type="number" value={form.base_salary} onChange={e => setForm(f => ({ ...f, base_salary: e.target.value }))}
              required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="30000" />
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Add Employee'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Salary</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {employees.map(emp => (
              <tr key={emp.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">
                    {emp.users?.profiles?.full_name ?? emp.employee_id}
                  </p>
                  <p className="text-xs text-gray-500">{emp.employee_id} • {emp.designation}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{emp.department}</td>
                <td className="px-4 py-3 font-medium">৳{Number(emp.base_salary).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[emp.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {emp.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/hr/employees/${emp.id}/letter`}
                      className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                      Letter
                    </Link>
                    {emp.status === 'active' && (
                      <button onClick={() => updateStatus(emp.id, 'terminated')}
                        className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                        Terminate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!employees.length && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400 text-sm">কোনো employee নেই</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
