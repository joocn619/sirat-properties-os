import Link from 'next/link'
import {
  Bell,
  ChartColumnBig,
  CreditCard,
  FolderKanban,
  ReceiptText,
  ShieldCheck,
  Users,
  UserSquare2,
} from 'lucide-react'

import { DashboardPageHeader } from '@/components/layout/DashboardPageHeader'
import { DashboardPanel } from '@/components/ui/DashboardPanel'
import { AreaTrendChart, BarTrendChart } from '@/components/ui/DashboardCharts'
import { StatCard } from '@/components/ui/StatCard'
import { buildMonthlyCountSeries, buildMonthlyValueSeries, requireDashboardSession } from '@/lib/dashboard'

export default async function AdminDashboard() {
  const session = await requireDashboardSession('admin')
  const { supabase } = session

  const [
    { count: pendingKyc },
    { count: totalUsers },
    { count: totalProperties },
    { count: totalBookings },
    { count: pendingCommissions },
    { count: pendingWithdrawals },
    { data: recentUsers },
    { data: recentAuditLogs },
    { data: userGrowthRows },
    { data: revenueRows },
  ] = await Promise.all([
    supabase.from('kyc_documents').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('properties').select('id', { count: 'exact', head: true }),
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
    supabase.from('commission_deals').select('id', { count: 'exact', head: true }).eq('status', 'accepted'),
    supabase.from('withdraw_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('users').select('id, email, role, is_verified, is_blocked, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('audit_logs').select('id, action, created_at, target_table, target_id').order('created_at', { ascending: false }).limit(6),
    supabase.from('users').select('created_at'),
    supabase.from('bookings').select('created_at, total_amount, status').in('status', ['confirmed', 'completed']),
  ])

  const userGrowth = buildMonthlyCountSeries(userGrowthRows ?? [], (user: { created_at: string }) => user.created_at)
  const revenueFlow = buildMonthlyValueSeries(
    revenueRows ?? [],
    (booking: any) => booking.created_at,
    (booking: any) => Number(booking.total_amount ?? 0),
  )

  return (
    <>
      <DashboardPageHeader
        eyebrow="Admin command center"
        title="Run the operating system from one premium surface"
        description="The admin redesign prioritizes fast visibility into users, compliance queues, money movement, and recent activity while keeping every internal area within the same shell."
        action={
          <>
            <Link
              href="/admin/kyc"
              className="dashboard-primary-button px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
            >
              Review KYC
            </Link>
            <Link
              href="/admin/users"
              className="dashboard-secondary-button px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
            >
              Open users
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pending KYC"
          value={pendingKyc ?? 0}
          hint="Identity reviews waiting for approval or rejection."
          accent="gold"
          icon={<ShieldCheck className="size-5" />}
        />
        <StatCard
          label="Total users"
          value={totalUsers ?? 0}
          hint="All registered accounts across the platform."
          accent="blue"
          icon={<Users className="size-5" />}
        />
        <StatCard
          label="Properties"
          value={totalProperties ?? 0}
          hint="Published and draft listings tracked in the system."
          accent="emerald"
          icon={<UserSquare2 className="size-5" />}
        />
        <StatCard
          label="Bookings"
          value={totalBookings ?? 0}
          hint="End-to-end booking records across buyers and sellers."
          accent="rose"
          icon={<ReceiptText className="size-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-6">
          <DashboardPanel className="space-y-5">
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="dashboard-label">User growth</p>
                    <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)]">
                      New accounts
                    </h2>
                  </div>
                  <span className="dashboard-badge" data-tone="blue">
                    6 months
                  </span>
                </div>
                <BarTrendChart
                  data={userGrowth}
                  emptyLabel="New user registrations will appear here once account growth begins."
                  label="Users added"
                  tone="blue"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="dashboard-label">Revenue flow</p>
                    <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)]">
                      Confirmed booking value
                    </h2>
                  </div>
                  <span className="dashboard-badge" data-tone="emerald">
                    Finance
                  </span>
                </div>
                <AreaTrendChart
                  data={revenueFlow}
                  emptyLabel="Confirmed booking revenue will chart here as transactions complete."
                  formatter={(value) => `BDT ${value.toLocaleString('en-US')}`}
                  label="Revenue"
                />
              </div>
            </div>
          </DashboardPanel>

          <DashboardPanel className="space-y-5">
            <div>
              <p className="dashboard-label">Quick actions</p>
              <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)]">
                Core control surfaces
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminAction href="/admin/notifications" icon={Bell} label="Notifications" body="Broadcasts, alerts, and system-level updates." />
              <AdminAction href="/admin/withdrawals" icon={CreditCard} label="Withdrawals" body="Handle queued payouts for agent wallets." />
              <AdminAction href="/admin/accounts/summary" icon={ChartColumnBig} label="Summary" body="Finance snapshots and monthly operating totals." />
              <AdminAction href="/admin/kanban" icon={FolderKanban} label="Kanban" body="Track work moving through internal operations." />
            </div>
          </DashboardPanel>

          <DashboardPanel className="space-y-4">
            <p className="dashboard-label">System health</p>
            <h2 className="font-display text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)]">Queues to clear</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <HealthCard title="KYC queue" value={pendingKyc ?? 0} tone="gold" />
              <HealthCard title="Commissions" value={pendingCommissions ?? 0} tone="emerald" />
              <HealthCard title="Withdrawals" value={pendingWithdrawals ?? 0} tone="rose" />
            </div>
          </DashboardPanel>
        </div>

        <div className="grid gap-6">
          <DashboardPanel className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="dashboard-label">Recent registrations</p>
                <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)]">
                  New accounts
                </h2>
              </div>
              <Link href="/admin/users" className="text-sm font-medium text-[var(--color-accent)]">
                See all users
              </Link>
            </div>

            {(recentUsers?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {recentUsers?.map((user: any) => (
                  <div key={user.id} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{user.email ?? 'No email attached'}</p>
                        <p className="text-sm capitalize text-[var(--text-secondary)]">{user.role?.replace('_', ' ') ?? 'Unknown role'}</p>
                      </div>
                      <span className="dashboard-badge" data-tone={user.is_blocked ? 'rose' : user.is_verified ? 'emerald' : 'gold'}>
                        {user.is_blocked ? 'blocked' : user.is_verified ? 'verified' : 'pending'}
                      </span>
                    </div>
                    <p className="mt-4 text-xs text-[var(--text-tertiary)]">
                      Joined {new Date(user.created_at).toLocaleDateString('en-US')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dashboard-empty rounded-[1.75rem] px-5 py-10 text-sm">
                New registrations will appear here once account creation activity starts flowing.
              </div>
            )}
          </DashboardPanel>

          <DashboardPanel className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="dashboard-label">Recent activity</p>
                <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)]">
                  Audit feed
                </h2>
              </div>
              <Link href="/admin/audit" className="text-sm font-medium text-[var(--color-accent)]">
                Open audit log
              </Link>
            </div>

            {(recentAuditLogs?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {recentAuditLogs?.map((log: any) => (
                  <div key={log.id} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{log.action}</p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {log.target_table ?? 'Unknown table'} {log.target_id ? `#${log.target_id}` : ''}
                        </p>
                      </div>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {new Date(log.created_at).toLocaleDateString('en-US')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dashboard-empty rounded-[1.75rem] px-5 py-10 text-sm">
                Audit entries will appear here once internal operations start creating system events.
              </div>
            )}
          </DashboardPanel>
        </div>
      </div>
    </>
  )
}

function AdminAction({
  body,
  href,
  icon: Icon,
  label,
}: {
  body: string
  href: string
  icon: typeof Bell
  label: string
}) {
  return (
    <Link
      href={href}
      className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4 transition hover:border-[rgba(201,169,110,0.22)] hover:bg-white/[0.05]"
    >
      <div className="flex size-10 items-center justify-center rounded-2xl bg-[rgba(201,169,110,0.14)] text-[var(--color-accent)]">
        <Icon className="size-5" />
      </div>
      <p className="mt-4 text-sm font-semibold text-[var(--text-primary)]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{body}</p>
    </Link>
  )
}

function HealthCard({
  title,
  value,
  tone,
}: {
  title: string
  value: number
  tone: 'emerald' | 'gold' | 'rose'
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
      <p className="dashboard-label">{title}</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="font-price text-3xl text-[var(--text-primary)]">{value.toLocaleString('en-US')}</p>
        <span className="dashboard-badge" data-tone={tone}>
          Open
        </span>
      </div>
    </div>
  )
}
