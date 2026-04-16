'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, BellRing, CheckSquare, CircleDollarSign, ClipboardCheck, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import type { TopbarNotification } from '@/lib/dashboard-shared'

const ICON_MAP = {
  booking: ClipboardCheck,
  commission: CircleDollarSign,
  kyc: ShieldCheck,
  task: CheckSquare,
  default: BellRing,
} as const

export function NotificationDropdown({
  href,
  notifications,
  unreadNotifications,
}: {
  href: string
  notifications: TopbarNotification[]
  unreadNotifications: number
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      window.addEventListener('mousedown', handleOutside)
    }

    return () => window.removeEventListener('mousedown', handleOutside)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="dashboard-icon-button relative rounded-2xl p-2.5"
        aria-label="Toggle notifications"
      >
        <Bell className="size-5" />
        {unreadNotifications > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 py-0.5 text-[0.65rem] font-semibold text-[var(--text-inverse)]">
            {unreadNotifications}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 z-40 mt-3 w-[min(92vw,380px)] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[rgba(13,14,20,0.98)] shadow-[0_30px_90px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
          >
            <div className="border-b border-white/8 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="dashboard-label text-[var(--color-accent)]">Latest alerts</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">Notification dropdown</p>
                </div>
                <Link href={href} onClick={() => setOpen(false)} className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                  View all
                </Link>
              </div>
            </div>

            <div className="max-h-[360px] overflow-y-auto p-3">
              {notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.map((notification) => {
                    const Icon = ICON_MAP[notification.type as keyof typeof ICON_MAP] ?? ICON_MAP.default

                    return (
                      <Link
                        key={notification.id}
                        href={href}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 rounded-[1.25rem] border border-white/6 bg-white/[0.03] px-3 py-3 transition hover:border-[rgba(201,169,110,0.22)] hover:bg-white/[0.05]"
                      >
                        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent-glow)] text-[var(--color-accent)]">
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="line-clamp-1 text-sm font-semibold text-[var(--text-primary)]">{notification.title}</p>
                            {!notification.is_read ? <span className="mt-1 size-2 shrink-0 rounded-full bg-[var(--color-accent)]" /> : null}
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">{notification.body}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="dashboard-empty rounded-[1.5rem] px-4 py-10 text-center text-sm">
                  No recent notifications yet.
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
