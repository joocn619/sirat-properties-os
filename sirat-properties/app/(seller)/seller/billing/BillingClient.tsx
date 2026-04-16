'use client'

import { useState } from 'react'
import { Check, Crown, Zap, ArrowRight, Clock, CreditCard, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Plan {
  id: string
  name: string
  price_monthly: number
  price_yearly: number
  max_listings: number
  max_featured: number
  max_agents: number
  features: string[]
}

interface Subscription {
  id: string
  plan_id: string
  status: string
  billing_cycle: string
  current_period_end: string
  subscription_plans: Plan
}

interface Payment {
  id: string
  amount: number
  payment_type: string
  status: string
  gateway_transaction_id: string | null
  created_at: string
}

const PLAN_ICONS: Record<string, typeof Zap> = {
  free: Zap,
  pro: Crown,
  business: Crown,
}

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  completed: { bg: 'rgba(16,185,129,0.08)', text: '#10b981' },
  pending: { bg: 'rgba(201,169,110,0.08)', text: '#C9A96E' },
  failed: { bg: 'rgba(244,63,94,0.08)', text: '#f43f5e' },
  refunded: { bg: 'rgba(59,130,246,0.08)', text: '#3B82F6' },
}

export function BillingClient({
  plans,
  currentSubscription,
  payments,
}: {
  plans: Plan[]
  currentSubscription: Subscription | null
  payments: Payment[]
}) {
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  const currentPlanId = currentSubscription?.plan_id ?? 'free'

  async function handleSubscribe(planId: string) {
    if (planId === 'free') return
    setLoading(planId)

    try {
      const res = await fetch('/api/payments/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'subscription', planId, cycle }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Payment initialization failed')
        setLoading(null)
        return
      }

      // Redirect to SSLCommerz
      window.location.href = data.url
    } catch {
      toast.error('Something went wrong')
      setLoading(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Current Plan */}
      {currentSubscription && (
        <div className="rounded-2xl border border-[rgba(201,169,110,0.2)] bg-[rgba(201,169,110,0.04)] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[rgba(201,169,110,0.12)]">
                <Crown className="size-5 text-[var(--color-accent)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {currentSubscription.subscription_plans?.name ?? currentSubscription.plan_id} Plan
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {currentSubscription.billing_cycle} billing
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--text-tertiary)]">Renews</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {new Date(currentSubscription.current_period_end).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cycle toggle */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setCycle('monthly')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            cycle === 'monthly'
              ? 'bg-[rgba(201,169,110,0.12)] text-[var(--color-accent)]'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setCycle('yearly')}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            cycle === 'yearly'
              ? 'bg-[rgba(201,169,110,0.12)] text-[var(--color-accent)]'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
          }`}
        >
          Yearly
          <span className="rounded-full bg-[rgba(16,185,129,0.1)] px-1.5 py-0.5 text-[10px] text-[#10b981]">
            Save 17%
          </span>
        </button>
      </div>

      {/* Plans grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const Icon = PLAN_ICONS[plan.id] ?? Zap
          const price = cycle === 'yearly' ? plan.price_yearly : plan.price_monthly
          const perMonth = cycle === 'yearly' ? Math.round(plan.price_yearly / 12) : plan.price_monthly
          const isCurrent = currentPlanId === plan.id
          const isPopular = plan.id === 'pro'

          return (
            <div
              key={plan.id}
              className={`relative overflow-hidden rounded-2xl border p-6 transition ${
                isPopular
                  ? 'border-[rgba(201,169,110,0.3)] bg-[rgba(201,169,110,0.04)]'
                  : 'border-white/[0.06] bg-white/[0.02]'
              }`}
            >
              {isPopular && (
                <div className="absolute right-3 top-3 rounded-full bg-[var(--color-accent)] px-2.5 py-0.5 text-[10px] font-bold text-[#0A0A0F]">
                  Popular
                </div>
              )}

              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-white/[0.04]">
                <Icon className="size-5 text-[var(--color-accent)]" />
              </div>

              <p className="text-lg font-semibold text-[var(--text-primary)]">{plan.name}</p>

              <div className="mt-2 flex items-baseline gap-1">
                {price > 0 ? (
                  <>
                    <span className="font-price text-3xl font-bold text-[var(--color-accent)]">
                      ৳{perMonth.toLocaleString()}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">/mo</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-[var(--text-primary)]">Free</span>
                )}
              </div>
              {cycle === 'yearly' && price > 0 && (
                <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                  ৳{price.toLocaleString()} billed yearly
                </p>
              )}

              <div className="my-5 h-px bg-white/[0.04]" />

              <ul className="space-y-2">
                {(plan.features as string[]).map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <Check className="size-3.5 shrink-0 text-[var(--color-accent)]" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleSubscribe(plan.id)}
                disabled={isCurrent || plan.id === 'free' || loading === plan.id}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold transition disabled:opacity-50 ${
                  isCurrent
                    ? 'bg-white/[0.04] text-[var(--text-tertiary)]'
                    : isPopular
                      ? 'bg-[var(--color-accent)] text-[#0A0A0F] hover:shadow-[0_4px_16px_rgba(201,169,110,0.3)]'
                      : 'bg-white/[0.06] text-[var(--text-primary)] hover:bg-white/[0.1]'
                }`}
              >
                {loading === plan.id ? (
                  'Redirecting…'
                ) : isCurrent ? (
                  'Current Plan'
                ) : plan.id === 'free' ? (
                  'Free Forever'
                ) : (
                  <>
                    Upgrade <ArrowRight className="size-3.5" />
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-accent)]">
            Payment History
          </h2>
          <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
            {payments.map((p, i) => {
              const style = STATUS_STYLE[p.status] ?? STATUS_STYLE.pending
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-4 px-5 py-4 text-sm ${
                    i < payments.length - 1 ? 'border-b border-white/[0.04]' : ''
                  }`}
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04]">
                    <CreditCard className="size-4 text-[var(--text-tertiary)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)] capitalize">
                      {p.payment_type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {new Date(p.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ background: style.bg, color: style.text }}
                  >
                    {p.status}
                  </span>
                  <p className="font-price text-sm font-semibold text-[var(--text-primary)]">
                    ৳{p.amount.toLocaleString()}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
