import { requireDashboardSession } from '@/lib/dashboard'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  progress:     { label: 'Progress',     icon: '📊', color: 'bg-blue-100 text-blue-700' },
  announcement: { label: 'Announcement', icon: '📢', color: 'bg-amber-100 text-amber-700' },
  milestone:    { label: 'Milestone',    icon: '🏆', color: 'bg-green-100 text-green-700' },
}

export default async function BuyerProjectsPage() {
  const { supabase, userId } = await requireDashboardSession('buyer')
  const user = { id: userId }
  // Get confirmed/completed bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('property_id')
    .eq('buyer_id', user.id)
    .in('status', ['confirmed', 'completed'])

  const propertyIds = (bookings ?? []).map((b: any) => b.property_id).filter(Boolean)

  const projects = propertyIds.length
    ? await supabase
        .from('projects')
        .select(`
          id, name, slug, current_progress, status,
          properties(title, location, property_images(url, is_primary)),
          project_updates(id, title, description, update_type, created_at),
          landing_pages(custom_slug, is_published)
        `)
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  const projectList = projects.data ?? []

  // Flatten all updates sorted by date for the feed
  const allUpdates = projectList
    .flatMap((proj: any) =>
      (proj.project_updates ?? []).map((u: any) => ({ ...u, project: proj }))
    )
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
        <p className="text-gray-500 mt-1 text-sm">আপনার invest করা property-র project updates</p>
      </div>

      {!projectList.length && (
        <div className="text-center py-16 border-2 border-dashed rounded-xl text-gray-400">
          <p className="text-4xl mb-3">🏗️</p>
          <p>কোনো active project নেই</p>
          <p className="text-sm mt-1">Confirmed booking থাকলে project updates এখানে দেখাবে</p>
          <Link href="/buyer/search" className="mt-3 inline-block text-sm text-blue-600 underline">
            Property খুঁজুন →
          </Link>
        </div>
      )}

      {projectList.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects sidebar */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase">Projects</h2>
            {projectList.map((proj: any) => {
              const lp = proj.landing_pages?.[0]
              const img = proj.properties?.property_images?.find((i: any) => i.is_primary)?.url
                ?? proj.properties?.property_images?.[0]?.url

              return (
                <div key={proj.id} className="bg-white border rounded-xl overflow-hidden">
                  {img && <img src={img} alt="" className="w-full h-24 object-cover" />}
                  <div className="p-3">
                    <p className="font-semibold text-sm text-gray-900">{proj.name}</p>
                    <p className="text-xs text-gray-500">{proj.properties?.location}</p>
                    {/* Progress */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${proj.current_progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{proj.current_progress}%</span>
                    </div>
                    {lp?.is_published && (
                      <Link href={`/projects/${lp.custom_slug}`} target="_blank"
                        className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                        View Landing Page ↗
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Updates feed */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Recent Updates</h2>
            {!allUpdates.length ? (
              <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-xl">
                <p>এখনো কোনো update নেই</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allUpdates.map((u: any) => {
                  const cfg = TYPE_CONFIG[u.update_type] ?? TYPE_CONFIG.progress
                  return (
                    <div key={u.id} className="bg-white border rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xl shrink-0">{cfg.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <p className="font-semibold text-gray-900 text-sm">{u.title}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{u.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-400">
                              {u.project?.name} • {new Date(u.created_at).toLocaleDateString('bn-BD')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
