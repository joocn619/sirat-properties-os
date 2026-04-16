import { requireDashboardSession } from '@/lib/dashboard'
import { redirect, notFound } from 'next/navigation'
import { ProjectUpdatesManager } from '@/components/project/ProjectUpdatesManager'

export default async function ProjectUpdatesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { supabase, userId } = await requireDashboardSession('seller')
  const user = { id: userId }
  const { data: project } = await supabase
    .from('projects')
    .select(`
      id, name, slug, current_progress, status, expected_end_date,
      properties(title)
    `)
    .eq('id', id)
    .eq('seller_id', user.id)
    .single()

  if (!project) notFound()

  const { data: updates } = await supabase
    .from('project_updates')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">
          {(project.properties as any)?.title}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>

        {/* Progress */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${project.current_progress}%` }} />
          </div>
          <span className="text-sm font-medium text-gray-700">{project.current_progress}%</span>
        </div>
      </div>

      <ProjectUpdatesManager
        projectId={id}
        updates={(updates as any) ?? []}
        currentProgress={project.current_progress}
        sellerId={user.id}
      />
    </div>
  )
}
