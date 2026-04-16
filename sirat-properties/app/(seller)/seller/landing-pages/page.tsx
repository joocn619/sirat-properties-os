import Link from 'next/link'
import { ExternalLink, LayoutTemplate, Plus, Sparkles } from 'lucide-react'

import { DashboardPageHeader } from '@/components/layout/DashboardPageHeader'
import { DashboardPanel } from '@/components/ui/DashboardPanel'
import { requireDashboardSession } from '@/lib/dashboard'

export const metadata = { title: 'Landing Pages' }

export default async function LandingPagesPage() {
  const session = await requireDashboardSession('seller')
  const { supabase, userId } = session

  // Get all projects owned by seller with their landing page status
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, slug, status, created_at, landing_pages(id, is_published, updated_at)')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })

  const rows = (projects ?? []) as any[]

  return (
    <>
      <DashboardPageHeader
        eyebrow="Content studio"
        title="Landing Pages"
        description="Build custom project landing pages with drag & drop sections and 15 ready-made templates. Share a link — no code needed."
        action={
          <Link
            href="/seller/projects/new"
            className="dashboard-primary-button flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
          >
            <Plus className="size-4" />
            New project
          </Link>
        }
      />

      {rows.length === 0 ? (
        <DashboardPanel className="flex flex-col items-center gap-5 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-3xl bg-[rgba(201,169,110,0.1)]">
            <LayoutTemplate className="size-8 text-[var(--color-accent)]" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-[var(--text-primary)]">No projects yet</p>
            <p className="max-w-sm text-sm leading-6 text-[var(--text-secondary)]">
              Create a project first, then use the Landing Page Builder to publish a beautiful page for it.
            </p>
          </div>
          <Link
            href="/seller/projects/new"
            className="dashboard-primary-button px-6 py-3 text-xs font-semibold uppercase tracking-widest"
          >
            Create first project
          </Link>
        </DashboardPanel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((project) => {
            const lp = Array.isArray(project.landing_pages) ? project.landing_pages[0] : project.landing_pages
            const hasPage = !!lp
            const isPublished = lp?.is_published ?? false
            const lastUpdated = lp?.updated_at ? new Date(lp.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null

            return (
              <div
                key={project.id}
                className="group relative flex flex-col gap-5 rounded-[1.75rem] border border-white/[0.06] bg-white/[0.02] p-6 transition hover:border-[rgba(201,169,110,0.18)] hover:bg-white/[0.04]"
              >
                {/* Status badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-[rgba(201,169,110,0.1)]">
                    <LayoutTemplate className="size-6 text-[var(--color-accent)]" />
                  </div>
                  <span
                    className="dashboard-badge"
                    data-tone={isPublished ? 'emerald' : hasPage ? 'gold' : 'blue'}
                  >
                    {isPublished ? 'Published' : hasPage ? 'Draft' : 'Not built'}
                  </span>
                </div>

                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-[var(--text-primary)]">{project.title}</p>
                  {lastUpdated && (
                    <p className="text-xs text-[var(--text-tertiary)]">Last edited {lastUpdated}</p>
                  )}
                  {isPublished && project.slug && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <Sparkles className="size-3 text-[var(--color-accent)]" />
                      <span className="text-xs text-[var(--color-accent)]">/projects/{project.slug}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/seller/projects/${project.id}/landing`}
                    className="flex-1 rounded-xl bg-[rgba(201,169,110,0.08)] py-2.5 text-center text-xs font-semibold text-[var(--color-accent)] ring-1 ring-[rgba(201,169,110,0.15)] transition hover:bg-[rgba(201,169,110,0.14)]"
                  >
                    {hasPage ? 'Edit builder' : 'Open builder'}
                  </Link>
                  {isPublished && project.slug && (
                    <Link
                      href={`/projects/${project.slug}`}
                      target="_blank"
                      className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-xs font-semibold text-[var(--text-secondary)] transition hover:border-[rgba(201,169,110,0.2)] hover:text-[var(--color-accent)]"
                    >
                      <ExternalLink className="size-3" />
                      View
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
