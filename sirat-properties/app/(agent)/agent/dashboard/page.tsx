import Link from 'next/link'
import { Bell, BriefcaseBusiness, CircleDollarSign, MessageSquare, ShieldCheck, Star } from 'lucide-react'

import { DashboardPageHeader } from '@/components/layout/DashboardPageHeader'
import { DashboardPanel } from '@/components/ui/DashboardPanel'
import { StatCard } from '@/components/ui/StatCard'
import { requireDashboardSession } from '@/lib/dashboard'

export default async function AgentDashboard() {
  const session = await requireDashboardSession('agent')
  const { supabase, userId } = session

  const [{ data: kyc }, { count: approvedListings }, { count: activeDealsCount }, { data: walletTransactions }, { data: recentDeals }, { data: recentChats }] =
    await Promise.all([
      supabase.from('kyc_documents').select('status').eq('user_id', userId).maybeSingle(),
      supabase.from('agent_listings').select('id', { count: 'exact', head: true }).eq('agent_id', userId).eq('status', 'approved'),
      supabase
        .from('commission_deals')
        .select('id', { count: 'exact', head: true })
        .eq('agent_id', userId)
        .in('status', ['pending', 'countered', 'accepted']),
      supabase.from('wallet_transactions').select('amount, type').eq('agent_id', userId),
      supabase
        .from('commission_deals')
        .select(`
          id, status, commission_type, commission_value, deadline, created_at,
          properties(id, title, location, district),
          seller:users!seller_id(email, profiles(full_name))
        `)
        .eq('agent_id', userId)
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('chats')
        .select(`
          id, created_at,
          properties(title, location),
          buyer:users!buyer_id(id, profiles(full_name)),
          messages(id, content, is_read, sender_id, created_at)
        `)
        .eq('agent_id', userId)
        .order('created_at', { ascending: false })
        .limit(4),
    ])

  const balance = (walletTransactions ?? []).reduce((sum: number, transaction: any) => {
    return transaction.type === 'credit' ? sum + Number(transaction.amount) : sum - Number(transaction.amount)
  }, 0)

  const chatList = (recentChats ?? []).map((chat: any) => {
    const messages: any[] = chat.messages ?? []
    const lastMessage = messages.sort(
      (first: any, second: any) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime(),
    )[0]
    const unread = messages.filter((message: any) => !message.is_read && message.sender_id !== userId).length
    return { ...chat, lastMessage, unread }
  })

  return (
    <>
      <DashboardPageHeader
        eyebrow="Agent command center"
        title="Keep listings, deals, and chat moving in one place"
        description="The redesigned agent workspace highlights commission flow, live conversations, and wallet visibility while keeping KYC status close to the surface."
        action={
          <>
            <Link
              href="/agent/listings"
              className="dashboard-primary-button px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
            >
              Browse listings
            </Link>
            <Link
              href="/agent/commissions"
              className="dashboard-secondary-button px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
            >
              Review deals
            </Link>
          </>
        }
      />

      {kyc?.status !== 'approved' ? (
        <DashboardPanel className="border-[rgba(201,169,110,0.18)] bg-[linear-gradient(180deg,rgba(201,169,110,0.12),rgba(17,17,24,0.96))]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="dashboard-label text-[var(--color-accent)]">Verification required</p>
              <h2 className="font-display text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)]">
                KYC is still {kyc?.status ?? 'pending'}
              </h2>
              <p className="text-sm leading-7 text-[var(--text-secondary)]">
                Listings and deals become fully actionable once verification clears. Upload an updated file if the
                current status does not reflect your latest submission.
              </p>
            </div>
            <Link
              href="/auth/kyc"
              className="dashboard-primary-button px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
            >
              Update KYC
            </Link>
          </div>
        </DashboardPanel>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Approved listings"
          value={approvedListings ?? 0}
          hint="Properties you can actively represent right now."
          accent="gold"
          icon={<BriefcaseBusiness className="size-5" />}
        />
        <StatCard
          label="Active deals"
          value={activeDealsCount ?? 0}
          hint="Pending, countered, or accepted commission conversations."
          accent="blue"
          icon={<CircleDollarSign className="size-5" />}
        />
        <StatCard
          label="Wallet balance"
          value={`BDT ${balance.toLocaleString('en-US')}`}
          hint="Credits minus withdrawals already recorded in the wallet."
          accent="emerald"
          icon={<ShieldCheck className="size-5" />}
        />
        <StatCard
          label="Unread alerts"
          value={session.unreadNotifications}
          hint="Notifications across approvals, deal changes, and platform updates."
          accent="rose"
          icon={<Bell className="size-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardPanel className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="dashboard-label">Commission pipeline</p>
              <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)]">
                Deals that need attention
              </h2>
            </div>
            <Link href="/agent/commissions" className="text-sm font-medium text-[var(--color-accent)]">
              Open all deals
            </Link>
          </div>

          {(recentDeals?.length ?? 0) > 0 ? (
            <div className="space-y-3">
              {recentDeals?.map((deal: any) => (
                <Link
                  key={deal.id}
                  href="/agent/commissions"
                  className="block rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4 transition hover:border-[rgba(201,169,110,0.22)] hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{deal.properties?.title ?? 'Commission deal'}</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {deal.seller?.profiles?.full_name ?? deal.seller?.email ?? 'Seller account'}
                      </p>
                    </div>
                    <span className="dashboard-badge" data-tone={deal.status === 'accepted' ? 'emerald' : deal.status === 'countered' ? 'blue' : 'gold'}>
                      {deal.status}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--text-tertiary)]">
                    <span>{deal.commission_type ?? 'Commission'}</span>
                    <span>{deal.commission_value ? `${deal.commission_value}` : 'Open value'}</span>
                    <span>{deal.deadline ? new Date(deal.deadline).toLocaleDateString('en-US') : 'No deadline'}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty rounded-[1.75rem] px-5 py-10 text-sm">
              No commission deals yet. New offers and counters will show up here as they arrive.
            </div>
          )}
        </DashboardPanel>

        <div className="grid gap-6">
          <DashboardPanel className="space-y-5">
            <div>
              <p className="dashboard-label">Recent chat activity</p>
              <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)]">
                Buyer conversations
              </h2>
            </div>

            {(chatList.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {chatList.map((chat: any) => {
                  const buyerName = chat.buyer?.profiles?.full_name ?? 'Buyer'
                  return (
                    <Link
                      key={chat.id}
                      href={`/agent/chat/${chat.id}`}
                      className="block rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4 transition hover:border-[rgba(201,169,110,0.22)] hover:bg-white/[0.05]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{buyerName}</p>
                          <p className="text-sm text-[var(--text-secondary)]">{chat.properties?.title ?? 'Property conversation'}</p>
                        </div>
                        {chat.unread > 0 ? (
                          <span className="dashboard-badge" data-tone="blue">
                            {chat.unread} new
                          </span>
                        ) : (
                          <MessageSquare className="size-5 text-[var(--text-tertiary)]" />
                        )}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                        {chat.lastMessage?.content ?? 'No messages yet.'}
                      </p>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="dashboard-empty rounded-[1.75rem] px-5 py-10 text-sm">
                When buyers start chatting with you, this panel will keep the latest conversations visible.
              </div>
            )}
          </DashboardPanel>

          <DashboardPanel className="space-y-4">
            <p className="dashboard-label">Performance snapshot</p>
            <h2 className="font-display text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)]">Credibility signals</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <CredibilityCard title="Verification" value={kyc?.status ?? 'pending'} icon={ShieldCheck} />
              <CredibilityCard title="Workspace" value="Agent" icon={Star} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Shortcut href="/agent/wallet" label="Open wallet" />
              <Shortcut href="/agent/chat" label="Open inbox" />
            </div>
          </DashboardPanel>
        </div>
      </div>
    </>
  )
}

function CredibilityCard({
  icon: Icon,
  title,
  value,
}: {
  icon: typeof ShieldCheck
  title: string
  value: string
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-[rgba(201,169,110,0.14)] text-[var(--color-accent)]">
        <Icon className="size-5" />
      </div>
      <p className="mt-4 text-sm font-semibold text-[var(--text-primary)]">{title}</p>
      <p className="mt-2 text-sm capitalize text-[var(--text-secondary)]">{value}</p>
    </div>
  )
}

function Shortcut({
  href,
  label,
}: {
  href: string
  label: string
}) {
  return (
    <Link
      href={href}
      className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[rgba(201,169,110,0.22)] hover:text-[var(--color-accent)]"
    >
      {label}
    </Link>
  )
}
