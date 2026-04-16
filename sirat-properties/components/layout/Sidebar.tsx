'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  BookOpenText,
  BriefcaseBusiness,
  Building2,
  CalendarRange,
  Crown,
  GitCompareArrows,
  Heart,
  ChartColumnBig,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileBadge2,
  FolderKanban,
  LayoutDashboard,
  LayoutTemplate,
  ListChecks,
  MessageSquare,
  ReceiptText,
  Search,
  ShieldCheck,
  SquareTerminal,
  Users,
  Wallet,
} from 'lucide-react'

import type { DashboardScope } from '@/lib/dashboard-shared'
import { cn } from '@/lib/utils'

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
  onToggleCollapse: () => void
  role: DashboardScope
  unreadNotifications: number
}

interface NavItem {
  icon: LucideIcon
  href: string
  label: string
  badge?: number
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navConfig: Record<DashboardScope, NavGroup[]> = {
  buyer: [
    {
      label: 'Workspace',
      items: [
        { href: '/buyer/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { href: '/buyer/search', icon: Search, label: 'Search' },
        { href: '/buyer/saved', icon: Heart, label: 'Saved' },
        { href: '/buyer/compare', icon: GitCompareArrows, label: 'Compare' },
        { href: '/buyer/bookings', icon: ClipboardCheck, label: 'Bookings' },
        { href: '/buyer/projects', icon: Building2, label: 'Projects' },
      ],
    },
    {
      label: 'Connect',
      items: [
        { href: '/buyer/chat', icon: MessageSquare, label: 'Chat' },
        { href: '/buyer/notifications', icon: Bell, label: 'Alerts' },
      ],
    },
  ],
  seller: [
    {
      label: 'Portfolio',
      items: [
        { href: '/seller/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { href: '/seller/listings', icon: Building2, label: 'Listings' },
        { href: '/seller/listings/new', icon: ClipboardList, label: 'New Property' },
        { href: '/seller/bookings', icon: CalendarRange, label: 'Bookings' },
      ],
    },
    {
      label: 'Growth',
      items: [
        { href: '/seller/agents', icon: Users, label: 'Agents' },
        { href: '/seller/projects', icon: FolderKanban, label: 'Projects' },
        { href: '/seller/landing-pages', icon: LayoutTemplate, label: 'Landing Pages' },
        { href: '/seller/billing', icon: CreditCard, label: 'Billing' },
        { href: '/seller/notifications', icon: Bell, label: 'Alerts' },
      ],
    },
  ],
  agent: [
    {
      label: 'Performance',
      items: [
        { href: '/agent/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { href: '/agent/listings', icon: BriefcaseBusiness, label: 'Listings' },
        { href: '/agent/commissions', icon: CircleDollarSign, label: 'Deals' },
        { href: '/agent/wallet', icon: Wallet, label: 'Wallet' },
      ],
    },
    {
      label: 'Connect',
      items: [
        { href: '/agent/chat', icon: MessageSquare, label: 'Chat' },
        { href: '/agent/upgrade', icon: Crown, label: 'Premium' },
        { href: '/agent/notifications', icon: Bell, label: 'Alerts' },
      ],
    },
  ],
  admin: [
    {
      label: 'Command',
      items: [
        { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { href: '/admin/users', icon: Users, label: 'Users' },
        { href: '/admin/kyc', icon: ShieldCheck, label: 'KYC' },
        { href: '/admin/notifications', icon: Bell, label: 'Alerts' },
      ],
    },
    {
      label: 'Operations',
      items: [
        { href: '/admin/kanban', icon: FolderKanban, label: 'Kanban' },
        { href: '/admin/withdrawals', icon: CreditCard, label: 'Withdrawals' },
        { href: '/admin/audit', icon: SquareTerminal, label: 'Audit' },
        { href: '/admin/sop', icon: BookOpenText, label: 'SOP' },
      ],
    },
    {
      label: 'Finance & HR',
      items: [
        { href: '/admin/accounts/summary', icon: ChartColumnBig, label: 'Summary' },
        { href: '/admin/accounts/ledger', icon: ReceiptText, label: 'Ledger' },
        { href: '/admin/accounts/commissions', icon: CircleDollarSign, label: 'Commissions' },
        { href: '/admin/hr/employees', icon: FileBadge2, label: 'Employees' },
        { href: '/admin/hr/payroll', icon: Wallet, label: 'Payroll' },
        { href: '/admin/hr/kpi', icon: ListChecks, label: 'KPI' },
      ],
    },
  ],
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function SidebarContent({
  collapsed,
  onCloseMobile,
  onToggleCollapse,
  pathname,
  role,
  unreadNotifications,
}: Omit<SidebarProps, 'mobileOpen'> & { pathname: string }) {
  const roleNotes: Record<DashboardScope, { title: string; body: string }> = {
    buyer: {
      title: 'Your buying flow',
      body: 'Search inventory, follow bookings, and keep alerts close to every conversation.',
    },
    seller: {
      title: 'Your seller flow',
      body: 'Publish faster, move inventory, and jump into agent or booking actions without extra clicks.',
    },
    agent: {
      title: 'Your agent flow',
      body: 'Stay on top of listings, live deals, wallet movement, and buyer conversations from one rail.',
    },
    admin: {
      title: 'Your control plane',
      body: 'Monitor compliance, users, finance, and internal execution from the same operating shell.',
    },
  }
  const navGroups = navConfig[role].map((group) => ({
    ...group,
    items: group.items.map((item) =>
      item.href.endsWith('/notifications') ? { ...item, badge: unreadNotifications } : item,
    ),
  }))

  return (
    <div className="dashboard-sidebar-surface flex h-full flex-col rounded-none border-r border-white/8 px-3 py-4 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3 px-3 pb-5 pt-2">
        <div className={cn('flex items-center gap-3 overflow-hidden', collapsed && 'justify-center')}>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[rgba(201,169,110,0.22)] bg-[linear-gradient(180deg,rgba(48,40,28,0.95),rgba(23,19,15,0.98))] text-[var(--color-accent)] shadow-[0_12px_28px_rgba(201,169,110,0.16)]">
            <Building2 className="size-5" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="font-display text-xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                Sirat
              </p>
              <p className="dashboard-label mt-1">Luxury OS</p>
            </div>
          ) : null}
        </div>
        {!collapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="dashboard-icon-button hidden rounded-2xl p-2 lg:block"
            aria-label="Collapse sidebar"
          >
            <PanelIcon collapsed={false} />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-1">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            {!collapsed ? <p className="dashboard-label px-3">{group.label}</p> : null}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href)
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition',
                      collapsed ? 'justify-center px-2' : '',
                      active
                        ? 'border-[rgba(201,169,110,0.22)] bg-[linear-gradient(135deg,rgba(201,169,110,0.16),rgba(201,169,110,0.05))] text-[var(--color-accent)] shadow-[inset_3px_0_0_0_var(--color-accent),0_16px_30px_rgba(0,0,0,0.18)]'
                        : 'border-transparent text-[var(--text-secondary)] hover:border-white/8 hover:bg-white/[0.05] hover:text-[var(--text-primary)]',
                    )}
                  >
                    <Icon className={cn('size-5 shrink-0', active ? 'text-[var(--color-accent)]' : 'text-current')} />
                    {!collapsed ? <span className="truncate">{item.label}</span> : null}
                    {!collapsed && item.badge ? (
                      <span className="ml-auto inline-flex min-w-6 items-center justify-center rounded-full border border-[rgba(201,169,110,0.2)] bg-[var(--color-accent-glow)] px-2 py-0.5 text-[0.65rem] font-semibold text-[var(--color-accent)]">
                        {item.badge}
                      </span>
                    ) : null}
                    {collapsed && item.badge ? (
                      <span className="absolute right-2 top-2 size-2 rounded-full bg-[var(--color-accent)]" />
                    ) : null}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-6 space-y-3 border-t border-white/6 px-3 pt-4">
        {collapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="dashboard-icon-button hidden w-full items-center justify-center rounded-2xl p-2 lg:flex"
            aria-label="Expand sidebar"
          >
            <PanelIcon collapsed />
          </button>
        ) : (
          <div className="rounded-3xl border border-white/8 bg-[linear-gradient(180deg,rgba(31,33,45,0.88),rgba(18,20,28,0.96))] p-4 shadow-[0_16px_38px_rgba(0,0,0,0.18)]">
            <p className="dashboard-label text-[var(--color-accent)]">Interface</p>
            <p className="mt-2 text-sm text-[var(--text-primary)]">{roleNotes[role].title}</p>
            <p className="mt-1 text-xs leading-6 text-[var(--text-secondary)]">
              {roleNotes[role].body}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function PanelIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-1">
      <span className={cn('block h-2.5 w-2.5 rounded-sm bg-current opacity-80', collapsed && 'col-span-2 w-5')} />
      {!collapsed ? <span className="block h-2.5 w-2.5 rounded-sm bg-current opacity-50" /> : null}
      <span className={cn('block h-2.5 rounded-sm bg-current opacity-50', collapsed ? 'hidden' : 'col-span-2 w-5')} />
    </div>
  )
}

export function Sidebar(props: SidebarProps) {
  const pathname = usePathname()
  const desktopWidth = props.collapsed ? 96 : 280

  return (
    <>
      <motion.aside
        animate={{ width: desktopWidth }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="dashboard-shell sticky top-0 hidden h-screen shrink-0 overflow-hidden border-r border-white/6 lg:block"
      >
        <SidebarContent {...props} pathname={pathname} />
      </motion.aside>

      <AnimatePresence>
        {props.mobileOpen ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={props.onCloseMobile}
              aria-label="Close navigation"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 240, damping: 28 }}
              className="fixed inset-y-0 left-0 z-50 w-[86vw] max-w-[320px] overflow-hidden border-r border-white/6 shadow-2xl lg:hidden"
            >
              <SidebarContent {...props} collapsed={false} pathname={pathname} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}
