import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { LandingPageBuilder } from '@/components/project/LandingPageBuilder'
import { requireDashboardSession } from '@/lib/dashboard'

export default async function LandingBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { supabase, userId } = await requireDashboardSession('seller')

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, slug, properties(title)')
    .eq('id', id)
    .eq('seller_id', userId)
    .single()

  const { data: landingPage } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('project_id', id)
    .single()

  const projectName = (project as any)?.title ?? (project as any)?.name ?? 'Project'
  const projectSlug = (project as any)?.slug ?? id
  const propertyTitle = (project as any)?.properties?.title ?? ''

  return (
    <div className="dashboard-theme min-h-screen bg-[var(--bg-base)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/seller/landing-pages"
            className="flex size-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-[var(--text-tertiary)] transition hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            {propertyTitle && (
              <p className="text-xs text-[var(--text-tertiary)]">{propertyTitle}</p>
            )}
            <h1 className="font-display text-xl font-medium text-[var(--text-primary)]">
              {projectName} — Landing Page Builder
            </h1>
          </div>
        </div>

        <LandingPageBuilder
          projectId={id}
          projectSlug={projectSlug}
          projectName={projectName}
          initialSections={(landingPage as any)?.sections ?? []}
          initialSlug={(landingPage as any)?.custom_slug ?? ''}
          isPublished={(landingPage as any)?.is_published ?? false}
        />
      </div>
    </div>
  )
}
