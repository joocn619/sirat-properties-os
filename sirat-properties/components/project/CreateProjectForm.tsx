'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FolderKanban, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export function CreateProjectForm({
  properties,
  sellerId,
}: {
  properties: { id: string; title: string; location: string }[]
  sellerId: string
}) {
  const [form, setForm] = useState({
    property_id: properties[0]?.id ?? '',
    name: '',
    slug: '',
    description: '',
    start_date: '',
    expected_end_date: '',
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function toSlug(s: string) {
    return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.slug) {
      toast.error('Project name and slug are required')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const { data: existing } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', form.slug)
        .single()

      if (existing) {
        toast.error('This slug is already taken — try another')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          seller_id: sellerId,
          property_id: form.property_id || null,
          title: form.name,
          slug: form.slug,
          description: form.description || null,
          start_date: form.start_date || null,
          expected_end_date: form.expected_end_date || null,
          status: 'active',
        })
        .select('id')
        .single()

      if (error) throw error

      toast.success('Project created!')
      const projectId = data?.id ?? 'dev-preview'
      router.push(`/seller/projects/${projectId}/landing`)
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to create project')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Property link */}
      <div className="space-y-2">
        <label className="dashboard-label">Linked property</label>
        {properties.length > 0 ? (
          <select
            value={form.property_id}
            onChange={(e) => setForm({ ...form, property_id: e.target.value })}
            className="dashboard-select w-full px-4 py-3 text-sm"
          >
            <option value="">No property linked</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} — {p.location}
              </option>
            ))}
          </select>
        ) : (
          <div className="rounded-2xl border border-[rgba(201,169,110,0.15)] bg-[rgba(201,169,110,0.05)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            No published properties yet — you can still create a project without linking one.
          </div>
        )}
      </div>

      {/* Project name */}
      <div className="space-y-2">
        <label className="dashboard-label">
          Project name <span className="text-[var(--color-rose)]">*</span>
        </label>
        <input
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value, slug: toSlug(e.target.value) })
          }
          placeholder="e.g. Gulshan Skyline Tower"
          className="dashboard-input w-full px-4 py-3 text-sm"
          required
        />
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <label className="dashboard-label">
          URL slug <span className="text-[var(--color-rose)]">*</span>
          <span className="ml-2 font-normal text-[var(--text-tertiary)]">— public page address</span>
        </label>
        <div className="flex items-center overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
          <span className="border-r border-white/[0.08] px-4 py-3 text-sm text-[var(--text-tertiary)]">
            /projects/
          </span>
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: toSlug(e.target.value) })}
            placeholder="gulshan-skyline-tower"
            className="flex-1 bg-transparent px-4 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="dashboard-label">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          placeholder="Brief overview of the project..."
          className="dashboard-textarea w-full resize-none px-4 py-3 text-sm"
        />
      </div>

      {/* Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="dashboard-label">Start date</label>
          <input
            type="date"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            className="dashboard-input w-full px-4 py-3 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="dashboard-label">Expected completion</label>
          <input
            type="date"
            value={form.expected_end_date}
            onChange={(e) => setForm({ ...form, expected_end_date: e.target.value })}
            className="dashboard-input w-full px-4 py-3 text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="dashboard-primary-button flex w-full items-center justify-center gap-2 py-3.5 text-sm font-semibold uppercase tracking-widest disabled:opacity-50"
      >
        <FolderKanban className="size-4" />
        {loading ? 'Creating…' : 'Create & open builder'}
        {!loading && <ArrowRight className="size-4" />}
      </button>
    </form>
  )
}
