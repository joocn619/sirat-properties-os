'use client'
import { usePathname } from 'next/navigation'
import { ChevronRight, Menu, PanelLeftClose, PanelLeftOpen, Sparkles } from 'lucide-react'

import { AccountMenu } from '@/components/layout/AccountMenu'
import { NotificationDropdown } from '@/components/layout/NotificationDropdown'
import { titleFromSegment, type DashboardScope, type TopbarNotification } from '@/lib/dashboard-shared'
import { cn } from '@/lib/utils'

interface TopBarProps {
  avatarUrl: string | null
  collapsed: boolean
  latestNotifications: TopbarNotification[]
  onOpenMobileNav: () => void
  onToggleCollapse: () => void
  role: DashboardScope
  roleLabel: string
  unreadNotifications: number
  userEmail: string
  userName: string
}

export function TopBar({
  avatarUrl,
  collapsed,
  latestNotifications,
  onOpenMobileNav,
  onToggleCollapse,
  role,
  roleLabel,
  unreadNotifications,
  userEmail,
  userName,
}: TopBarProps) {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean).slice(1)
  const crumbs = segments.length ? segments.map(titleFromSegment) : ['Overview']
  const today = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
  const notificationsHref = `/${role}/notifications`
  const workspaceFocus: Record<DashboardScope, string> = {
    buyer: 'Search, bookings, and alerts stay in sync',
    seller: 'Inventory, agents, and bookings in one view',
    agent: 'Deals, listings, and chat always visible',
    admin: 'Users, compliance, and finance fully connected',
  }

  return (
    <header className="dashboard-shell dashboard-topbar sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="dashboard-icon-button rounded-2xl p-2 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="dashboard-icon-button hidden rounded-2xl p-2 lg:block"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="dashboard-badge" data-tone="gold">
                {roleLabel}
              </span>
              <span className="hidden sm:inline">{today}</span>
            </div>
            <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 text-sm text-[var(--text-secondary)]">
              <span className="shrink-0">Dashboard</span>
              {crumbs.map((crumb, index) => (
                <span key={`${crumb}-${index}`} className="flex items-center gap-2">
                  <ChevronRight className="size-3 text-[var(--text-tertiary)]" />
                  <span className={cn(index === crumbs.length - 1 && 'text-[var(--text-primary)]')}>{crumb}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="dashboard-toolbar-pill hidden items-center gap-3 rounded-full px-4 py-2 md:flex">
            <div className="flex size-8 items-center justify-center rounded-full bg-[var(--color-accent-glow)] text-[var(--color-accent)]">
              <Sparkles className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                {roleLabel} workspace
              </p>
              <p className="truncate text-sm text-[var(--text-secondary)]">{workspaceFocus[role]}</p>
            </div>
          </div>

          <NotificationDropdown
            href={notificationsHref}
            notifications={latestNotifications}
            unreadNotifications={unreadNotifications}
          />

          <AccountMenu avatarUrl={avatarUrl} roleLabel={roleLabel} userEmail={userEmail} userName={userName} />
        </div>
      </div>
    </header>
  )
}
