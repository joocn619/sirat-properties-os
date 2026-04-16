import { TrendingDown, TrendingUp } from 'lucide-react'

import { CountUpValue } from '@/components/ui/count-up-value'
import { cn } from '@/lib/utils'

interface StatCardProps {
  accent?: 'blue' | 'emerald' | 'gold' | 'rose'
  hint?: string
  icon: React.ReactNode
  label: string
  trend?: {
    direction: 'down' | 'up'
    label: string
  }
  value: number | string
}

const accentClasses: Record<NonNullable<StatCardProps['accent']>, string> = {
  gold: 'border border-[rgba(201,169,110,0.16)] bg-[linear-gradient(180deg,rgba(201,169,110,0.18),rgba(201,169,110,0.08))] text-[var(--color-accent)]',
  blue: 'border border-[rgba(59,130,246,0.18)] bg-[linear-gradient(180deg,rgba(59,130,246,0.2),rgba(59,130,246,0.08))] text-[var(--color-blue)]',
  emerald: 'border border-[rgba(16,185,129,0.18)] bg-[linear-gradient(180deg,rgba(16,185,129,0.2),rgba(16,185,129,0.08))] text-[var(--color-emerald)]',
  rose: 'border border-[rgba(244,63,94,0.18)] bg-[linear-gradient(180deg,rgba(244,63,94,0.2),rgba(244,63,94,0.08))] text-[var(--color-rose)]',
}

export function StatCard({
  accent = 'gold',
  hint,
  icon,
  label,
  trend,
  value,
}: StatCardProps) {
  return (
    <div className="group dashboard-panel relative overflow-hidden rounded-[1.75rem] p-5 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(201,169,110,0.1),transparent_34%)] opacity-70" />
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(201,169,110,0.9),transparent)] opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-4">
            <p className="dashboard-label">{label}</p>
            <div className="font-price text-3xl font-medium tracking-[-0.04em] text-[var(--text-primary)] sm:text-4xl">
              {typeof value === 'number' ? <CountUpValue value={value} /> : value}
            </div>
            {hint ? <p className="text-sm leading-6 text-[var(--text-secondary)]">{hint}</p> : null}
          </div>
          <div className={cn('flex size-12 shrink-0 items-center justify-center rounded-2xl', accentClasses[accent])}>
            {icon}
          </div>
        </div>
        {trend ? (
          <div
            className={cn(
              'mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold',
              trend.direction === 'up'
                ? 'bg-[var(--color-emerald-glow)] text-[var(--color-emerald)]'
                : 'bg-[var(--color-rose-glow)] text-[var(--color-rose)]',
            )}
          >
            {trend.direction === 'up' ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            <span>{trend.label}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
