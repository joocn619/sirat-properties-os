'use client'

import { useEffect, useState } from 'react'

import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import type { DashboardScope, TopbarNotification } from '@/lib/dashboard-shared'

interface DashboardShellProps {
  avatarUrl: string | null
  children: React.ReactNode
  latestNotifications: TopbarNotification[]
  role: DashboardScope
  roleLabel: string
  unreadNotifications: number
  userEmail: string
  userName: string
}

const STORAGE_KEY = 'sirat-dashboard-collapsed'

export function DashboardShell({
  avatarUrl,
  children,
  latestNotifications,
  role,
  roleLabel,
  unreadNotifications,
  userEmail,
  userName,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') {
      setCollapsed(true)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(collapsed))
  }, [collapsed])

  return (
    <div className="dashboard-theme">
      <div className="dashboard-shell flex min-h-screen">
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          onToggleCollapse={() => setCollapsed((current) => !current)}
          role={role}
          unreadNotifications={unreadNotifications}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            avatarUrl={avatarUrl}
            collapsed={collapsed}
            latestNotifications={latestNotifications}
            onOpenMobileNav={() => setMobileOpen(true)}
            onToggleCollapse={() => setCollapsed((current) => !current)}
            role={role}
            roleLabel={roleLabel}
            unreadNotifications={unreadNotifications}
            userEmail={userEmail}
            userName={userName}
          />
          <main className="relative flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
