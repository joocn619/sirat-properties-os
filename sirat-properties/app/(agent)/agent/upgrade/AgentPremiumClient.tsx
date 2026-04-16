'use client'

import { useState } from 'react'
import { Crown, Check, Zap, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const FEATURES = [
  'Unlimited listing applications',
  'Priority visibility to sellers',
  'Advanced commission analytics',
  'Early access to new listings',
  'Premium badge on profile',
  'Dedicated support channel',
]

export function AgentPremiumClient({
  isPremium,
  premiumUntil,
}: {
  isPremium: boolean
  premiumUntil: string | null
}) {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade(months: number) {
    setLoading(true)
    try {
      const res = await fetch('/api/payments/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'agent_premium',
          amount: months === 12 ? 4990 : months === 6 ? 2690 : 499,
          months,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Payment failed')
        setLoading(false)
        return
      }
      window.location.href = data.url
    } catch {
      toast.error('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {isPremium && premiumUntil && (
        <div className="flex items-center gap-3 rounded-2xl border border-[rgba(201,169,110,0.2)] bg-[rgba(201,169,110,0.04)] p-5">
          <Crown className="size-6 text-[var(--color-accent)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">You are a Premium Agent</p>
            <p className="text-xs text-[var(--text-tertiary)]">
              Active until {new Date(premiumUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[rgba(201,169,110,0.12)]">
            <Crown className="size-5 text-[var(--color-accent)]" />
          </div>
          <div>
            <p className="text-base font-semibold text-[var(--text-primary)]">Agent Premium</p>
            <p className="text-xs text-[var(--text-tertiary)]">Boost your real estate career</p>
          </div>
        </div>

        <ul className="mb-6 space-y-2.5">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Check className="size-4 shrink-0 text-[var(--color-accent)]" /> {f}
            </li>
          ))}
        </ul>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { months: 1, price: 499, label: '1 Month' },
            { months: 6, price: 2690, label: '6 Months', badge: 'Save 10%' },
            { months: 12, price: 4990, label: '1 Year', badge: 'Save 17%' },
          ].map((opt) => (
            <button
              key={opt.months}
              type="button"
              disabled={loading}
              onClick={() => handleUpgrade(opt.months)}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition hover:border-[rgba(201,169,110,0.2)] hover:bg-[rgba(201,169,110,0.04)] disabled:opacity-50"
            >
              {opt.badge && (
                <span className="absolute -top-2 right-3 rounded-full bg-[rgba(16,185,129,0.12)] px-2 py-0.5 text-[9px] font-semibold text-[#10b981]">
                  {opt.badge}
                </span>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">{opt.label}</p>
              <p className="mt-1 font-price text-xl font-bold text-[var(--color-accent)]">
                ৳{opt.price.toLocaleString()}
              </p>
              <div className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-white/[0.04] py-2 text-xs font-semibold text-[var(--text-secondary)] transition group-hover:bg-[var(--color-accent)] group-hover:text-[#0A0A0F]">
                {loading ? '…' : 'Upgrade'} <ArrowRight className="size-3" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
