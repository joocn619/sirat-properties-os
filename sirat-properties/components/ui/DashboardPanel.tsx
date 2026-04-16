import { cn } from '@/lib/utils'

interface DashboardPanelProps {
  children: React.ReactNode
  className?: string
}

export function DashboardPanel({ children, className }: DashboardPanelProps) {
  return (
    <section className={cn('dashboard-panel relative overflow-hidden rounded-[2rem] p-6 sm:p-7', className)}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(201,169,110,0.08),transparent_30%)]" />
      <div className="relative z-10">{children}</div>
    </section>
  )
}
