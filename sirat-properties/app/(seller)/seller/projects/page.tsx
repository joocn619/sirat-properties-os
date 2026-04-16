import { requireDashboardSession } from '@/lib/dashboard'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_STYLE: Record<string, string> = {
  upcoming:  'bg-gray-100 text-gray-600',
  ongoing:   'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

export default async function SellerProjectsPage() {
  const { supabase, userId } = await requireDashboardSession('seller')
  const user = { id: userId }
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id, name, slug, current_progress, status, created_at,
      properties(title, location),
      project_updates(id),
      landing_pages(is_published, custom_slug)
    `)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1 text-sm">Property project তৈরি করুন এবং update post করুন</p>
        </div>
        <Link href="/seller/projects/new"
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700">
          + New Project
        </Link>
      </div>

      {!projects?.length ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl text-gray-400">
          <p className="text-4xl mb-3">🏗️</p>
          <p>এখনো কোনো project নেই</p>
          <Link href="/seller/projects/new" className="mt-3 inline-block text-sm text-blue-600 underline">
            প্রথম project তৈরি করুন →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((proj: any) => {
            const lp = proj.landing_pages?.[0]
            const updateCount = proj.project_updates?.length ?? 0

            return (
              <div key={proj.id} className="bg-white border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-semibold text-gray-900">{proj.name}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[proj.status]}`}>
                        {proj.status}
                      </span>
                      {lp?.is_published && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          Published ✓
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{proj.properties?.title} • {proj.properties?.location}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {/* Progress bar */}
                      <div className="flex-1 max-w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${proj.current_progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{proj.current_progress}% done</span>
                      <span className="text-xs text-gray-400">{updateCount} updates</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Link href={`/seller/projects/${proj.id}/updates`}
                      className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-center">
                      + Update
                    </Link>
                    <Link href={`/seller/projects/${proj.id}/landing`}
                      className="px-3 py-1.5 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-center">
                      Landing Page
                    </Link>
                    {lp?.custom_slug && (
                      <Link href={`/projects/${lp.custom_slug}`} target="_blank"
                        className="px-3 py-1.5 text-xs bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 text-center">
                        View Public ↗
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
