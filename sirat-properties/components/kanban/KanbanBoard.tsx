'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Status = 'todo' | 'in_progress' | 'completed'
type Priority = 'low' | 'medium' | 'high'

interface Task {
  id: string
  title: string
  description: string | null
  status: Status
  priority: Priority
  due_date: string | null
  project_id: string | null
  assigned_to: string | null
  assigned_by: string | null
  completed_at: string | null
  created_at: string
  assignee: { profiles: { full_name: string | null } | null } | null
  projects: { name: string } | null
}

interface Employee {
  id: string
  profiles: { full_name: string | null } | null
}

interface Props {
  initialTasks: Task[]
  employees: Employee[]
  currentUserId: string
  superAdminId: string | null
}

const COLUMNS: { id: Status; label: string; color: string; bg: string }[] = [
  { id: 'todo',        label: 'To Do',       color: 'text-gray-600',  bg: 'bg-gray-50' },
  { id: 'in_progress', label: 'In Progress', color: 'text-blue-600',  bg: 'bg-blue-50' },
  { id: 'completed',   label: 'Completed',   color: 'text-green-600', bg: 'bg-green-50' },
]

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  low:    { label: 'Low',    color: 'bg-gray-100 text-gray-500' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  high:   { label: 'High',   color: 'bg-red-100 text-red-600' },
}

export function KanbanBoard({ initialTasks, employees, currentUserId, superAdminId }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium' as Priority,
    due_date: '', assigned_to: '',
  })
  const supabase = createClient()

  // ── Drag & Drop (native HTML5) ────────────────────────────────

  function handleDragStart(e: React.DragEvent, taskId: string) {
    e.dataTransfer.setData('taskId', taskId)
    setDraggingId(taskId)
  }

  function handleDragEnd() { setDraggingId(null) }

  function handleDragOver(e: React.DragEvent) { e.preventDefault() }

  async function handleDrop(e: React.DragEvent, targetStatus: Status) {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (!taskId) return

    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === targetStatus) { setDraggingId(null); return }

    const updates: Record<string, unknown> = { status: targetStatus }
    if (targetStatus === 'completed') {
      updates.completed_at = new Date().toISOString()
    } else {
      updates.completed_at = null
    }

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId
      ? { ...t, status: targetStatus, completed_at: updates.completed_at as string | null }
      : t
    ))

    await supabase.from('tasks').update(updates).eq('id', taskId)

    // Notify super admin on completion
    if (targetStatus === 'completed' && superAdminId) {
      await supabase.from('notifications').insert({
        user_id: superAdminId,
        title: 'Task Completed ✅',
        body: `"${task.title}" সম্পন্ন হয়েছে।`,
        type: 'task',
        reference_id: taskId,
      })
    }

    setDraggingId(null)
  }

  // ── Create Task ────────────────────────────────────────────────

  async function submitTask(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data } = await supabase
      .from('tasks')
      .insert({
        title: form.title,
        description: form.description || null,
        priority: form.priority,
        due_date: form.due_date || null,
        assigned_to: form.assigned_to || null,
        assigned_by: currentUserId,
        status: 'todo',
      })
      .select(`
        *,
        assignee:users!assigned_to(profiles(full_name)),
        projects(name)
      `)
      .single()

    if (data) {
      setTasks(prev => [data as any, ...prev])
      setShowForm(false)
      setForm({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' })
    }
    setSaving(false)
  }

  // ── Status change via button (fallback) ───────────────────────

  async function moveTask(taskId: string, newStatus: Status) {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const updates: Record<string, unknown> = { status: newStatus }
    if (newStatus === 'completed') updates.completed_at = new Date().toISOString()
    else updates.completed_at = null

    setTasks(prev => prev.map(t => t.id === taskId
      ? { ...t, status: newStatus, completed_at: updates.completed_at as string | null }
      : t
    ))
    await supabase.from('tasks').update(updates).eq('id', taskId)

    if (newStatus === 'completed' && superAdminId) {
      await supabase.from('notifications').insert({
        user_id: superAdminId,
        title: 'Task Completed ✅',
        body: `"${task.title}" সম্পন্ন হয়েছে।`,
        type: 'task',
        reference_id: taskId,
      })
    }
  }

  async function deleteTask(taskId: string) {
    if (!confirm('এই task delete করবেন?')) return
    await supabase.from('tasks').delete().eq('id', taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  const byStatus = (status: Status) => tasks.filter(t => t.status === status)

  const isOverdue = (due: string | null) =>
    due && new Date(due) < new Date() ? true : false

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">{tasks.length}টি task মোট</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700"
        >
          + নতুন Task
        </button>
      </div>

      {/* Create task form */}
      {showForm && (
        <form onSubmit={submitTask}
          className="bg-white border rounded-xl p-5 mb-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs text-gray-600 block mb-1">Task Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Task-এর বিষয়..." />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-600 block mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
              placeholder="বিস্তারিত..." />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Priority</label>
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Due Date</label>
            <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-600 block mb-1">Assign To</label>
            <select value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Unassigned</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.profiles?.full_name ?? emp.id}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2 flex gap-2">
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Creating...' : 'Task তৈরি করুন'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {/* Kanban board */}
      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map(col => {
          const colTasks = byStatus(col.id)
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, col.id)}
              className={`rounded-2xl p-3 min-h-[500px] transition-colors ${col.bg} ${
                draggingId ? 'ring-2 ring-blue-200 ring-offset-1' : ''
              }`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm ${col.color}`}>{col.label}</span>
                  <span className="text-xs bg-white border rounded-full px-2 py-0.5 text-gray-600 font-medium">
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Task cards */}
              <div className="space-y-3">
                {colTasks.map(task => {
                  const p = PRIORITY_CONFIG[task.priority]
                  const overdue = isOverdue(task.due_date) && task.status !== 'completed'
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={e => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white rounded-xl p-3 shadow-sm border cursor-grab active:cursor-grabbing transition-opacity ${
                        draggingId === task.id ? 'opacity-40' : ''
                      }`}
                    >
                      {/* Priority badge */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.color}`}>
                          {p.label}
                        </span>
                        {task.projects && (
                          <span className="text-xs text-gray-400 truncate max-w-[80px]">{task.projects.name}</span>
                        )}
                      </div>

                      {/* Title */}
                      <p className="font-semibold text-gray-900 text-sm leading-snug mb-1">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">{task.description}</p>
                      )}

                      {/* Due date */}
                      {task.due_date && (
                        <p className={`text-xs mb-2 ${overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                          {overdue ? '⚠️ ' : '📅 '}{task.due_date}
                        </p>
                      )}

                      {/* Assignee */}
                      {task.assignee?.profiles?.full_name && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                            {task.assignee.profiles.full_name[0]}
                          </div>
                          <span className="text-xs text-gray-500">{task.assignee.profiles.full_name}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
                        {col.id !== 'todo' && (
                          <button onClick={() => moveTask(task.id, 'todo')}
                            className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                            ← Todo
                          </button>
                        )}
                        {col.id !== 'in_progress' && (
                          <button onClick={() => moveTask(task.id, 'in_progress')}
                            className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                            {col.id === 'todo' ? 'Start →' : '← In Progress'}
                          </button>
                        )}
                        {col.id !== 'completed' && (
                          <button onClick={() => moveTask(task.id, 'completed')}
                            className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded hover:bg-green-100">
                            Done ✓
                          </button>
                        )}
                        <button onClick={() => deleteTask(task.id)}
                          className="ml-auto text-xs px-2 py-0.5 bg-red-50 text-red-400 rounded hover:bg-red-100">
                          ✕
                        </button>
                      </div>
                    </div>
                  )
                })}

                {/* Empty state */}
                {colTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-300 text-xs border-2 border-dashed border-gray-200 rounded-xl">
                    <p>এখানে drop করুন</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
