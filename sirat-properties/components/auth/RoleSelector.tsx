'use client'

import { BriefcaseBusiness, Building2, Check, Home, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

import type { UserRole } from '@/types'

const ROLES = [
  {
    value: 'buyer' as UserRole,
    label: 'Buyer',
    desc: 'Search properties, manage bookings, and track project updates in one place.',
    icon: Home,
    badge: 'Personal',
    tone: 'blue',
    badgeColor: 'rgba(59,130,246,0.12)',
    badgeBorder: 'rgba(59,130,246,0.25)',
    badgeText: '#6ba3f5',
    iconBg: 'rgba(59,130,246,0.1)',
    iconColor: '#6ba3f5',
  },
  {
    value: 'seller' as UserRole,
    label: 'Seller / Developer',
    desc: 'Launch listings, manage agents, and keep every property funnel moving.',
    icon: Building2,
    badge: 'Revenue',
    tone: 'gold',
    badgeColor: 'rgba(201,169,110,0.12)',
    badgeBorder: 'rgba(201,169,110,0.28)',
    badgeText: '#C9A96E',
    iconBg: 'rgba(201,169,110,0.1)',
    iconColor: '#C9A96E',
  },
  {
    value: 'agent' as UserRole,
    label: 'Agent',
    desc: 'Apply to active listings, negotiate commission deals, and track earnings.',
    icon: BriefcaseBusiness,
    badge: 'Commission',
    tone: 'emerald',
    badgeColor: 'rgba(16,185,129,0.1)',
    badgeBorder: 'rgba(16,185,129,0.25)',
    badgeText: '#10b981',
    iconBg: 'rgba(16,185,129,0.1)',
    iconColor: '#10b981',
  },
]

export function RoleSelector({ userId: _, userEmail: __ }: { userId: string; userEmail?: string }) {
  const [selected, setSelected] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleConfirm() {
    if (!selected) return

    setLoading(true)

    const res = await fetch('/api/auth/set-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: selected }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      const message = data.error ?? `API error: ${res.status}`
      setError(message)
      toast.error(message)
      setLoading(false)
      return
    }

    toast.success('Role saved. Moving to the next step.')

    if (selected === 'seller' || selected === 'agent') {
      router.push('/auth/kyc')
    } else {
      router.push('/auth/profile-setup')
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        {ROLES.map((role) => {
          const Icon = role.icon
          const active = selected === role.value

          return (
            <button
              key={role.value}
              type="button"
              onClick={() => setSelected(role.value)}
              data-selected={active}
              className="auth-option w-full rounded-2xl p-4 text-left"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: role.iconBg }}
                >
                  <Icon className="size-5" style={{ color: role.iconColor }} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{role.label}</p>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1"
                      style={{
                        background: role.badgeColor,
                        borderColor: 'transparent',
                        boxShadow: `0 0 0 1px ${role.badgeBorder}`,
                        color: role.badgeText,
                      }}
                    >
                      {role.badge}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-5 text-[var(--text-tertiary)]">{role.desc}</p>
                </div>

                {/* Check indicator */}
                <div
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full transition-all ${
                    active
                      ? 'bg-[var(--color-accent)] ring-2 ring-[rgba(201,169,110,0.3)]'
                      : 'ring-1 ring-white/[0.12]'
                  }`}
                >
                  <Check className={`size-3 transition-opacity ${active ? 'opacity-100 text-[#1a1208]' : 'opacity-0 text-transparent'}`} />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {error ? (
        <div className="rounded-2xl border border-[rgba(244,63,94,0.22)] bg-[rgba(244,63,94,0.08)] px-4 py-3 text-sm text-[var(--color-rose)]">
          {error}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleConfirm}
        disabled={!selected || loading}
        className="group relative flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl text-sm font-semibold tracking-wide transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: selected
            ? 'linear-gradient(135deg, #C9A96E 0%, #B8954F 40%, #D4AF7A 100%)'
            : 'rgba(255,255,255,0.04)',
          border: selected ? 'none' : '1px solid rgba(255,255,255,0.08)',
          color: selected ? '#1a1208' : 'var(--text-tertiary)',
          boxShadow: selected
            ? '0 8px 32px rgba(201,169,110,0.28), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)'
            : 'none',
          transition: 'all 300ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Shimmer */}
        {selected && (
          <span
            className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.18)_50%,transparent_60%)] transition-transform duration-700 group-hover:translate-x-full"
            aria-hidden
          />
        )}

        {loading ? (
          <>
            <svg className="size-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Saving role…</span>
          </>
        ) : (
          <>
            <span>Continue</span>
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </div>
  )
}
