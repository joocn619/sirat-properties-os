import { cn } from '@/lib/utils'

interface DashboardPageHeaderProps {
  action?: React.ReactNode
  className?: string
  eyebrow?: string
  title: string
  description: string
}

export function DashboardPageHeader({
  action,
  className,
  eyebrow,
  title,
  description,
}: DashboardPageHeaderProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(25,27,37,0.98)_0%,rgba(16,18,27,0.99)_48%,rgba(17,23,34,0.98)_100%)] px-6 py-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)] sm:px-8 sm:py-7',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(201,169,110,0.14),transparent_34%)]" />
      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-3">
          {eyebrow ? <p className="dashboard-label text-[var(--color-accent)]">{eyebrow}</p> : null}
          <div className="space-y-2">
            <h1 className="font-display text-4xl font-medium tracking-[-0.035em] text-[var(--text-primary)] sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
              {description}
            </p>
          </div>
        </div>
        {action ? <div className="flex shrink-0 flex-wrap items-center gap-3">{action}</div> : null}
      </div>
    </div>
  )
}
