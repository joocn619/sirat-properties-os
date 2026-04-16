import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { DashboardPageHeader } from '@/components/layout/DashboardPageHeader'
import { DashboardPanel } from '@/components/ui/DashboardPanel'
import { CreateProjectForm } from '@/components/project/CreateProjectForm'
import { requireDashboardSession } from '@/lib/dashboard'

export const metadata = { title: 'New Project' }

export default async function NewProjectPage() {
  const { supabase, userId } = await requireDashboardSession('seller')

  const { data: properties } = await supabase
    .from('properties')
    .select('id, title, location')
    .eq('seller_id', userId)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  return (
    <>
      <DashboardPageHeader
        eyebrow="Content studio"
        title="Create a new project"
        description="Link a property, set a slug, and open the Landing Page Builder to publish a premium page for it."
        action={
          <Link
            href="/seller/landing-pages"
            className="dashboard-secondary-button flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
        }
      />
      <DashboardPanel className="mx-auto w-full max-w-2xl p-6 sm:p-8">
        <CreateProjectForm properties={(properties as any) ?? []} sellerId={userId} />
      </DashboardPanel>
    </>
  )
}
