import Link from 'next/link'
import { ArrowLeft, ShieldAlert } from 'lucide-react'

import { DashboardPageHeader } from '@/components/layout/DashboardPageHeader'
import { PropertyForm } from '@/components/property/PropertyForm'
import { DashboardPanel } from '@/components/ui/DashboardPanel'
import { Button } from '@/components/ui/button'
import { requireDashboardSession } from '@/lib/dashboard'

export default async function NewListingPage() {
  const { supabase, userId } = await requireDashboardSession('seller')

  const { data: dbUser } = await supabase
    .from('users')
    .select('is_verified')
    .eq('id', userId)
    .single()

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <DashboardPageHeader
        eyebrow="New listing"
        title="Launch a property with premium presentation"
        description="Use the guided workflow to shape the listing story, add inventory and media, then save a confident draft or publish instantly once KYC is approved."
        action={(
          <Link href="/seller/listings">
            <Button
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.03] px-5 text-[var(--text-primary)] hover:border-white/16 hover:bg-white/[0.05]"
            >
              <ArrowLeft className="size-4" />
              Back to listings
            </Button>
          </Link>
        )}
      />

      {!dbUser?.is_verified ? (
        <div className="rounded-[1.75rem] border border-[rgba(201,169,110,0.24)] bg-[rgba(201,169,110,0.08)] px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--color-accent-glow)] text-[var(--color-accent)]">
              <ShieldAlert className="size-5" />
            </div>
            <div className="space-y-2">
              <p className="dashboard-label text-[var(--color-accent)]">Verification pending</p>
              <p className="text-base font-semibold text-[var(--text-primary)]">Drafts can be saved, but publishing stays locked until KYC approval.</p>
              <p className="text-sm leading-7 text-[var(--text-secondary)]">
                Finish the listing now so you can publish immediately after the verification status updates.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <DashboardPanel className="p-4 sm:p-6">
        <PropertyForm userId={userId} isVerified={Boolean(dbUser?.is_verified)} />
      </DashboardPanel>
    </div>
  )
}
