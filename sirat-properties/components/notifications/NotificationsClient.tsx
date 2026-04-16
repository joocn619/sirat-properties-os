'use client'

import { Bell, BellRing, CheckSquare, CircleDollarSign, ClipboardCheck, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  title: string
  body: string
  type: string
  is_read: boolean
  created_at: string
  reference_id: string | null
}

const TYPE_CONFIG: Record<string, { icon: typeof Bell; tone: 'blue' | 'emerald' | 'gold' | 'rose' }> = {
  booking: { icon: ClipboardCheck, tone: 'blue' },
  commission: { icon: CircleDollarSign, tone: 'emerald' },
  kyc: { icon: ShieldCheck, tone: 'gold' },
  task: { icon: CheckSquare, tone: 'rose' },
  default: { icon: BellRing, tone: 'gold' },
}

export function NotificationsClient({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [marking, setMarking] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const unreadIds = notifications.filter((notification) => !notification.is_read).map((notification) => notification.id)

  async function markAllRead() {
    if (!unreadIds.length) {
      return
    }

    setMarking(true)
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds)
    setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })))
    setMarking(false)
    toast.success('All notifications marked as read.')
    router.refresh()
  }

  async function markOneRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications((current) =>
      current.map((notification) => (notification.id === id ? { ...notification, is_read: true } : notification)),
    )
    toast.success('Notification marked as read.')
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <section className="dashboard-panel rounded-[2rem] px-6 py-6 sm:px-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="dashboard-label text-[var(--color-accent)]">Notification center</p>
            <h1 className="font-display text-4xl font-medium tracking-[-0.03em] text-[var(--text-primary)]">Signals that need your attention</h1>
            <p className="max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
              Booking activity, verification changes, commission movement, and internal task updates now share the same
              dark notification surface.
            </p>
          </div>
          {unreadIds.length > 0 ? (
            <button
              type="button"
              onClick={markAllRead}
              disabled={marking}
              className="inline-flex items-center justify-center rounded-full border border-[rgba(201,169,110,0.22)] bg-white/[0.04] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-primary)] transition hover:border-[rgba(201,169,110,0.28)] hover:text-[var(--color-accent)] disabled:opacity-50"
            >
              {marking ? 'Updating...' : 'Mark all as read'}
            </button>
          ) : null}
        </div>
      </section>

      {notifications.length === 0 ? (
        <div className="dashboard-empty rounded-[2rem] px-6 py-16 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-[var(--color-accent)]">
            <Bell className="size-7" />
          </div>
          <p className="mt-5 text-base font-semibold text-[var(--text-primary)]">No notifications yet</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">New activity will start appearing here automatically.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const config = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.default
            const Icon = config.icon

            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => {
                  if (!notification.is_read) {
                    void markOneRead(notification.id)
                  }
                }}
                className={`dashboard-panel flex w-full items-start gap-4 rounded-[1.75rem] p-5 text-left transition hover:border-[rgba(201,169,110,0.22)] ${
                  notification.is_read ? 'opacity-70' : ''
                }`}
              >
                <div
                  className={`mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl ${
                    config.tone === 'emerald'
                      ? 'bg-[var(--color-emerald-glow)] text-[var(--color-emerald)]'
                      : config.tone === 'blue'
                        ? 'bg-[var(--color-blue-glow)] text-[var(--color-blue)]'
                        : config.tone === 'rose'
                          ? 'bg-[var(--color-rose-glow)] text-[var(--color-rose)]'
                          : 'bg-[var(--color-accent-glow)] text-[var(--color-accent)]'
                  }`}
                >
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{notification.title}</p>
                      <p className="text-sm leading-7 text-[var(--text-secondary)]">{notification.body}</p>
                    </div>
                    {!notification.is_read ? <span className="mt-1 size-2.5 shrink-0 rounded-full bg-[var(--color-accent)]" /> : null}
                  </div>
                  <p className="mt-4 text-xs text-[var(--text-tertiary)]">
                    {new Date(notification.created_at).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
