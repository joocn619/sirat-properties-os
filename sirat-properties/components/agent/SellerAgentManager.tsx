'use client'

import { useState } from 'react'
import { BriefcaseBusiness, Handshake, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

const STATUS_STYLE: Record<string, { label: string; tone: 'gold' | 'emerald' | 'rose' | 'blue' }> = {
  pending: { label: 'Pending', tone: 'gold' },
  approved: { label: 'Approved', tone: 'emerald' },
  rejected: { label: 'Rejected', tone: 'rose' },
  accepted: { label: 'Accepted', tone: 'emerald' },
  countered: { label: 'Countered', tone: 'blue' },
}

export function SellerAgentManager({
  applications,
  deals,
  sellerId,
}: {
  applications: any[]
  deals: any[]
  sellerId: string
}) {
  const [tab, setTab] = useState<'applications' | 'deals'>('applications')
  const [loading, setLoading] = useState<string | null>(null)
  const [showDealForm, setShowDealForm] = useState<string | null>(null)
  const [dealForm, setDealForm] = useState({
    commission_type: 'percentage',
    commission_value: 3,
    deadline_days: 90,
  })
  const supabase = createClient()
  const router = useRouter()

  async function reviewApp(appId: string, action: 'approved' | 'rejected') {
    setLoading(appId)
    const { error } = await supabase.from('agent_listings').update({ status: action }).eq('id', appId)

    if (error) {
      toast.error('Agent review failed')
      setLoading(null)
      return
    }

    toast.success(`Application ${action}`)
    setLoading(null)
    router.refresh()
  }

  async function createDeal(app: any) {
    setLoading('deal')
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + dealForm.deadline_days)

    const { error } = await supabase.from('commission_deals').insert({
      property_id: app.properties.id,
      agent_listing_id: app.id,
      seller_id: sellerId,
      agent_id: app.agents.id,
      commission_type: dealForm.commission_type,
      commission_value: dealForm.commission_value,
      deadline: deadline.toISOString().split('T')[0],
      status: 'pending',
    })

    if (error) {
      toast.error('Deal offer could not be created')
      setLoading(null)
      return
    }

    setShowDealForm(null)
    setLoading(null)
    toast.success('Commission deal offered')
    router.refresh()
  }

  const pending = applications.filter((application) => application.status === 'pending')
  const reviewed = applications.filter((application) => application.status !== 'pending')

  return (
    <div className="space-y-6">
      <div className="inline-flex flex-wrap gap-2 rounded-full border border-white/8 bg-white/[0.03] p-1.5">
        {(['applications', 'deals'] as const).map((currentTab) => {
          const active = tab === currentTab

          return (
            <button
              key={currentTab}
              onClick={() => setTab(currentTab)}
              className={`rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                active
                  ? 'bg-[linear-gradient(135deg,#C9A96E_0%,#E2C99A_50%,#A87B3F_100%)] text-[var(--text-inverse)] shadow-[0_14px_34px_rgba(201,169,110,0.2)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {currentTab === 'applications' ? `Applications (${applications.length})` : `Deals (${deals.length})`}
            </button>
          )
        })}
      </div>

      {tab === 'applications' ? (
        <div className="space-y-6">
          {pending.length ? (
            <section className="space-y-4">
              <div className="space-y-2">
                <p className="dashboard-label text-[var(--color-accent)]">Priority review</p>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                  Pending applications ({pending.length})
                </h2>
                <p className="text-sm leading-7 text-[var(--text-secondary)]">
                  Review fresh agent interest first, then promote approved matches into commission deals.
                </p>
              </div>

              <div className="space-y-4">
                {pending.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    app={application}
                    loading={loading}
                    showDealForm={showDealForm}
                    dealForm={dealForm}
                    onReview={reviewApp}
                    onShowDeal={() => setShowDealForm(application.id)}
                    onHideDeal={() => setShowDealForm(null)}
                    onDealFormChange={setDealForm}
                    onCreateDeal={() => createDeal(application)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {reviewed.length ? (
            <section className="space-y-4">
              <div className="space-y-2">
                <p className="dashboard-label">Reviewed pipeline</p>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">Approved and rejected applications</h2>
                <p className="text-sm leading-7 text-[var(--text-secondary)]">
                  Keep a record of who is already approved, rejected, or ready for the next commercial step.
                </p>
              </div>

              <div className="space-y-4">
                {reviewed.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    app={application}
                    loading={loading}
                    showDealForm={showDealForm}
                    dealForm={dealForm}
                    onReview={reviewApp}
                    onShowDeal={() => setShowDealForm(application.id)}
                    onHideDeal={() => setShowDealForm(null)}
                    onDealFormChange={setDealForm}
                    onCreateDeal={() => createDeal(application)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {!applications.length ? (
            <EmptyState
              icon={<UserRound className="size-7" />}
              title="No agent applications yet"
              description="As soon as agents apply to your published properties, you will review them from this pipeline."
            />
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          {!deals.length ? (
            <EmptyState
              icon={<Handshake className="size-7" />}
              title="No commission deals yet"
              description="Create an offer for any approved agent and it will appear here with status and counter-offer details."
            />
          ) : null}

          {deals.map((deal) => {
            const agent = deal.agent?.profiles

            return (
              <article key={deal.id} className="dashboard-panel rounded-[1.75rem] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-[var(--text-primary)]">{deal.properties?.title}</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Agent: {agent?.full_name ?? deal.agent?.email}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="dashboard-badge" data-tone={STATUS_STYLE[deal.status]?.tone ?? 'gold'}>
                        {STATUS_STYLE[deal.status]?.label ?? deal.status}
                      </span>
                      <span className="dashboard-badge" data-tone="blue">
                        {deal.commission_type === 'percentage'
                          ? `${deal.commission_value}%`
                          : `৳${Number(deal.commission_value).toLocaleString()}`}
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <DealInfo
                        label="Deadline"
                        value={new Date(deal.deadline).toLocaleDateString('bn-BD', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      />
                      <DealInfo
                        label="Counter offer"
                        value={deal.status === 'countered'
                          ? deal.counter_type === 'percentage'
                            ? `${deal.counter_value}%`
                            : `৳${Number(deal.counter_value).toLocaleString()}`
                          : 'No counter yet'}
                      />
                    </div>
                  </div>

                  <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-4">
                    <p className="dashboard-label">Commercial view</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                      {deal.status === 'countered'
                        ? 'The agent has proposed a new commission structure. Review the deal thread from the agent workspace.'
                        : 'Offer is live in the pipeline and will update when the agent accepts or responds.'}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ApplicationCard({
  app,
  loading,
  showDealForm,
  dealForm,
  onReview,
  onShowDeal,
  onHideDeal,
  onDealFormChange,
  onCreateDeal,
}: {
  app: any
  dealForm: { commission_type: string; commission_value: number; deadline_days: number }
  loading: string | null
  onCreateDeal: () => void
  onDealFormChange: (form: any) => void
  onHideDeal: () => void
  onReview: (id: string, action: 'approved' | 'rejected') => void
  onShowDeal: () => void
  showDealForm: string | null
}) {
  const agent = app.agents
  const profile = agent?.profiles
  const kycStatus = agent?.kyc_documents?.[0]?.status

  return (
    <article className="dashboard-panel rounded-[1.75rem] p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="size-12 rounded-full object-cover ring-1 ring-white/10" />
          ) : (
            <div className="flex size-12 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-sm text-[var(--text-secondary)]">
              {profile?.full_name?.slice(0, 1) ?? 'A'}
            </div>
          )}

          <div className="min-w-0 space-y-3">
            <div className="space-y-1">
              <p className="text-base font-semibold text-[var(--text-primary)]">{profile?.full_name ?? agent?.email}</p>
              <p className="text-sm text-[var(--text-secondary)]">{agent?.email}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-tertiary)]">{app.properties?.title}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="dashboard-badge" data-tone={STATUS_STYLE[app.status]?.tone ?? 'gold'}>
                {STATUS_STYLE[app.status]?.label ?? app.status}
              </span>
              <span className="dashboard-badge" data-tone={kycStatus === 'approved' ? 'emerald' : 'gold'}>
                <ShieldCheck className="size-3" />
                KYC {kycStatus ?? 'pending'}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DealInfo label="WhatsApp" value={profile?.whatsapp_number ?? 'Not provided'} />
              <DealInfo
                label="Applied on"
                value={new Date(app.created_at).toLocaleDateString('bn-BD', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          {app.status === 'pending' ? (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={loading === app.id}
                onClick={() => onReview(app.id, 'rejected')}
                className="rounded-full border-[rgba(244,63,94,0.2)] bg-[rgba(244,63,94,0.08)] px-4 text-[var(--color-rose)] hover:bg-[rgba(244,63,94,0.14)]"
              >
                Reject
              </Button>
              <Button
                size="sm"
                disabled={loading === app.id}
                onClick={() => onReview(app.id, 'approved')}
                className="rounded-full bg-[linear-gradient(135deg,#10B981_0%,#34D399_100%)] px-4 text-[#03140f] hover:brightness-105"
              >
                {loading === app.id ? 'Approving...' : 'Approve'}
              </Button>
            </div>
          ) : (
            <div className="rounded-[1.15rem] border border-white/8 bg-white/[0.03] px-4 py-3">
              <p className="dashboard-label">Review state</p>
              <p className="mt-2 text-sm text-[var(--text-primary)]">{STATUS_STYLE[app.status]?.label ?? app.status}</p>
            </div>
          )}

          {app.status === 'approved' && showDealForm !== app.id ? (
            <button
              onClick={onShowDeal}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(59,130,246,0.2)] bg-[rgba(59,130,246,0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-blue)] transition hover:bg-[rgba(59,130,246,0.14)]"
            >
              <Sparkles className="size-3.5" />
              Offer commission deal
            </button>
          ) : null}
        </div>
      </div>

      {showDealForm === app.id ? (
        <div className="mt-5 space-y-4 rounded-[1.5rem] border border-[rgba(59,130,246,0.18)] bg-[rgba(59,130,246,0.08)] p-4">
          <div className="space-y-2">
            <p className="dashboard-label text-[var(--color-blue)]">Commission proposal</p>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Craft the commercial offer</h3>
            <p className="text-sm leading-7 text-[var(--text-secondary)]">
              Set the commission model, value, and validity window before sending the deal to the approved agent.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <label className="space-y-2">
              <span className="dashboard-label">Type</span>
              <select
                value={dealForm.commission_type}
                onChange={(event) => onDealFormChange({ ...dealForm, commission_type: event.target.value })}
                className="dashboard-select px-4 py-3 text-sm"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount (৳)</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="dashboard-label">
                {dealForm.commission_type === 'percentage' ? 'Percentage' : 'Amount'}
              </span>
              <input
                type="number"
                value={dealForm.commission_value}
                onChange={(event) => onDealFormChange({ ...dealForm, commission_value: Number(event.target.value) })}
                className="dashboard-input px-4 py-3 text-sm"
                min={0}
              />
            </label>

            <label className="space-y-2">
              <span className="dashboard-label">Deadline (days)</span>
              <input
                type="number"
                value={dealForm.deadline_days}
                onChange={(event) => onDealFormChange({ ...dealForm, deadline_days: Number(event.target.value) })}
                className="dashboard-input px-4 py-3 text-sm"
                min={1}
              />
            </label>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onHideDeal}
              className="rounded-full border-white/10 bg-white/[0.03] px-5 text-[var(--text-primary)] hover:border-white/16 hover:bg-white/[0.05]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onCreateDeal}
              disabled={loading === 'deal'}
              className="rounded-full bg-[linear-gradient(135deg,#3B82F6_0%,#60A5FA_100%)] px-5 text-white hover:brightness-105"
            >
              {loading === 'deal' ? 'Offering...' : 'Send offer'}
            </Button>
          </div>
        </div>
      ) : null}
    </article>
  )
}

function DealInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-white/8 bg-white/[0.03] px-4 py-3">
      <p className="dashboard-label">{label}</p>
      <p className="mt-2 text-sm text-[var(--text-primary)]">{value}</p>
    </div>
  )
}

function EmptyState({
  description,
  icon,
  title,
}: {
  description: string
  icon: React.ReactNode
  title: string
}) {
  return (
    <div className="dashboard-empty flex flex-col items-center rounded-[2rem] px-6 py-16 text-center">
      <div className="flex size-18 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-[var(--color-accent)]">
        {icon}
      </div>
      <h3 className="mt-6 text-2xl font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">{description}</p>
    </div>
  )
}
