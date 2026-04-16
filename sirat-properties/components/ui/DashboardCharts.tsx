'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { dashboardChartTheme } from '@/lib/chart-theme'

interface ChartPoint {
  label: string
  value: number
}

interface AreaTrendChartProps {
  data: ChartPoint[]
  emptyLabel: string
  formatter?: (value: number) => string
  label: string
}

interface BarTrendChartProps extends AreaTrendChartProps {
  tone?: 'accent' | 'blue' | 'emerald'
}

export function AreaTrendChart({
  data,
  emptyLabel,
  formatter = (value) => value.toLocaleString('en-US'),
  label,
}: AreaTrendChartProps) {
  const hasData = data.some((point) => point.value > 0)

  if (!hasData) {
    return <ChartEmptyState label={emptyLabel} />
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="dashboardAreaAccent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={dashboardChartTheme.accent} stopOpacity={0.55} />
              <stop offset="100%" stopColor={dashboardChartTheme.accent} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={dashboardChartTheme.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: dashboardChartTheme.text, fontSize: 12 }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={36}
            tick={{ fill: dashboardChartTheme.text, fontSize: 12 }}
          />
          <Tooltip content={<ChartTooltip label={label} formatter={formatter} />} cursor={{ stroke: dashboardChartTheme.grid }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={dashboardChartTheme.accent}
            strokeWidth={2.5}
            fill="url(#dashboardAreaAccent)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BarTrendChart({
  data,
  emptyLabel,
  formatter = (value) => value.toLocaleString('en-US'),
  label,
  tone = 'blue',
}: BarTrendChartProps) {
  const hasData = data.some((point) => point.value > 0)

  if (!hasData) {
    return <ChartEmptyState label={emptyLabel} />
  }

  const color =
    tone === 'emerald' ? dashboardChartTheme.emerald : tone === 'accent' ? dashboardChartTheme.accent : dashboardChartTheme.blue

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="28%">
          <CartesianGrid stroke={dashboardChartTheme.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: dashboardChartTheme.text, fontSize: 12 }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={36}
            tick={{ fill: dashboardChartTheme.text, fontSize: 12 }}
          />
          <Tooltip content={<ChartTooltip label={label} formatter={formatter} />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="value" fill={color} radius={[10, 10, 4, 4]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label: string
  formatter: (value: number) => string
}) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      className="rounded-2xl border px-3 py-2 shadow-2xl"
      style={{
        background: dashboardChartTheme.tooltipBackground,
        borderColor: dashboardChartTheme.tooltipBorder,
        color: '#F0EDE8',
      }}
    >
      <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#9E9AA0]">{label}</p>
      <p className="mt-1 text-sm font-semibold">{formatter(Number(payload[0]?.value ?? 0))}</p>
    </div>
  )
}

function ChartEmptyState({ label }: { label: string }) {
  return (
    <div className="dashboard-empty flex h-72 items-center justify-center rounded-[1.5rem] px-5 text-center text-sm">
      {label}
    </div>
  )
}
