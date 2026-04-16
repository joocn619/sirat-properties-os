'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const TYPE_CONFIG = {
  progress:     { label: 'Progress',     icon: '📊', color: 'bg-blue-100 text-blue-700' },
  announcement: { label: 'Announcement', icon: '📢', color: 'bg-amber-100 text-amber-700' },
  milestone:    { label: 'Milestone',    icon: '🏆', color: 'bg-green-100 text-green-700' },
}

export function ProjectUpdatesManager({ projectId, updates, currentProgress, sellerId }: {
  projectId: string
  updates: any[]
  currentProgress: number
  sellerId: string
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    update_type: 'progress' as 'progress' | 'announcement' | 'milestone',
  })
  const [progress, setProgress] = useState(currentProgress)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.description) return setError('Title ও description দিন')

    setLoading(true)
    setError('')

    // Update progress
    await supabase.from('projects').update({ current_progress: progress }).eq('id', projectId)

    // Post update
    const { error: err } = await supabase.from('project_updates').insert({
      project_id: projectId,
      posted_by: sellerId,
      title: form.title,
      description: form.description,
      update_type: form.update_type,
      media_urls: [],
    })

    if (err) setError(err.message)
    else {
      setForm({ title: '', description: '', update_type: 'progress' })
      router.refresh()
    }
    setLoading(false)
  }

  async function deleteUpdate(updateId: string) {
    setDeleting(updateId)
    await supabase.from('project_updates').delete().eq('id', updateId)
    setDeleting(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Post form */}
      <form onSubmit={submit} className="bg-white border rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">নতুন Update Post করুন</h2>

        <div>
          <label className="text-xs text-gray-600 mb-1 block">Update Type</label>
          <div className="flex gap-2">
            {(Object.entries(TYPE_CONFIG) as [string, typeof TYPE_CONFIG['progress']][]).map(([k, v]) => (
              <button
                key={k} type="button"
                onClick={() => setForm({ ...form, update_type: k as any })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  form.update_type === k ? v.color + ' font-medium' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {v.icon} {v.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-600 mb-1 block">Title *</label>
          <input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="e.g. ৩য় তলার ছাদ ঢালাই সম্পন্ন"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 mb-1 block">Description *</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3} className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
            placeholder="বিস্তারিত লিখুন..."
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 mb-1 block">Overall Progress: {progress}%</label>
          <input
            type="range" min={0} max={100} value={progress}
            onChange={e => setProgress(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 disabled:opacity-50">
          {loading ? 'Posting...' : 'Post করুন'}
        </button>
      </form>

      {/* Updates list */}
      <div className="space-y-3">
        {!updates.length && (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-xl">
            <p className="text-3xl mb-2">📊</p>
            <p className="text-sm">এখনো কোনো update নেই</p>
          </div>
        )}
        {updates.map((u: any) => {
          const cfg = TYPE_CONFIG[u.update_type as keyof typeof TYPE_CONFIG]
          return (
            <div key={u.id} className="bg-white border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0">{cfg?.icon}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-gray-900 text-sm">{u.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${cfg?.color}`}>{cfg?.label}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{u.description}</p>
                    <p className="text-xs text-gray-400 mt-1.5">
                      {new Date(u.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <button
                  disabled={deleting === u.id}
                  onClick={() => deleteUpdate(u.id)}
                  className="text-xs text-red-400 hover:text-red-600 shrink-0"
                >
                  {deleting === u.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
