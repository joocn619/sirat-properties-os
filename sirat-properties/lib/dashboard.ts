import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/format'
import type { DashboardScope, TopbarNotification } from '@/lib/dashboard-shared'
import type { UserRole } from '@/types'

export { formatCurrency } from '@/lib/format'

const ROLE_ACCESS: Record<DashboardScope, UserRole[]> = {
  buyer: ['buyer'],
  seller: ['seller'],
  agent: ['agent'],
  admin: ['admin', 'super_admin', 'hr_admin', 'accounts_admin'],
}

export interface DashboardSession {
  avatarUrl: string | null
  displayName: string
  email: string
  latestNotifications: TopbarNotification[]
  role: UserRole
  supabase: Awaited<ReturnType<typeof createClient>>
  unreadNotifications: number
  userId: string
}

// ─── Dev bypass ───────────────────────────────────────────────────────────────
// Set DEV_BYPASS_AUTH=true in .env.local to skip Supabase auth during local dev.
// Never enable this in production.
// Sensible per-table defaults so pages don't show error states in dev
const DEV_TABLE_DATA: Record<string, any> = {
  users: { id: 'dev-id', role: 'seller', is_verified: true, is_premium: false, premium_until: null },
  profiles: { full_name: 'Dev User', avatar_url: null, bio: '', whatsapp_number: '', address: '' },
  kyc_documents: null,
  subscriptions: null,
  subscription_plans: { name: 'Pro', max_listings: 999 },
}

function makeDevSupabase() {
  function chain(table?: string): any {
    const result = {
      data: table ? (DEV_TABLE_DATA[table] ?? null) : null,
      error: null,
      count: 0,
    }
    return new Proxy({}, {
      get(_t, prop) {
        if (prop === 'then') return (resolve: (v: any) => void) => resolve(result)
        if (prop === 'from') return (t: string) => chain(t)
        return () => chain(table)
      },
    })
  }
  return {
    from: (t: string) => chain(t),
    auth: { getUser: async () => ({ data: { user: null } }) },
    storage: { from: () => chain() },
  } as any
}

const DEV_ROLE_MAP: Record<string, UserRole> = {
  buyer: 'buyer',
  seller: 'seller',
  agent: 'agent',
  admin: 'admin',
}

function devSession(scope: DashboardScope): DashboardSession {
  const role = DEV_ROLE_MAP[scope] ?? 'buyer'
  return {
    avatarUrl: null,
    displayName: `Dev ${scope.charAt(0).toUpperCase() + scope.slice(1)}`,
    email: `dev-${scope}@localhost`,
    latestNotifications: [],
    role,
    supabase: makeDevSupabase(),
    unreadNotifications: 0,
    userId: `dev-${scope}-id`,
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

export async function requireDashboardSession(scope: DashboardScope): Promise<DashboardSession> {
  // Explicit bypass flag
  if (process.env.DEV_BYPASS_AUTH === 'true' && process.env.NODE_ENV !== 'production') {
    return devSession(scope)
  }

  const supabase = await createClient()

  // In development, if Supabase is unreachable auto-fallback to dev session (1.5s timeout)
  let user: any = null
  try {
    const result = await withTimeout(supabase.auth.getUser(), 1500) as any
    user = result.data?.user ?? null
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      return devSession(scope)
    }
  }

  if (!user) {
    if (process.env.NODE_ENV !== 'production') return devSession(scope)
    redirect('/auth/login')
  }

  let dbUser: any = null
  let profile: any = null
  let unreadNotifications = 0
  let latestNotifications: any[] = []

  try {
    const results = await withTimeout(
      Promise.all([
        supabase.from('users').select('role').eq('id', user.id).single(),
        supabase.from('profiles').select('full_name, avatar_url').eq('user_id', user.id).maybeSingle(),
        supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false),
        supabase.from('notifications').select('id, title, body, type, is_read, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      ]),
      3000
    ) as any[]
    dbUser = results[0].data
    profile = results[1].data
    unreadNotifications = results[2].count ?? 0
    latestNotifications = results[3].data ?? []
  } catch {
    if (process.env.NODE_ENV !== 'production') return devSession(scope)
    redirect('/auth/login')
  }

  if (!dbUser || !ROLE_ACCESS[scope].includes(dbUser.role)) {
    redirect('/auth/login')
  }

  return {
    avatarUrl: profile?.avatar_url ?? null,
    displayName: profile?.full_name ?? user.email ?? 'Dashboard User',
    email: user.email ?? 'No email attached',
    latestNotifications: latestNotifications as TopbarNotification[],
    role: dbUser.role,
    supabase,
    unreadNotifications,
    userId: user.id,
  }
}

export function buildMonthlyCountSeries<T>(items: T[], getDate: (item: T) => string | null | undefined, months = 6) {
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short' })
  const now = new Date()
  const buckets = Array.from({ length: months }, (_, index) => {
    const bucketDate = new Date(now.getFullYear(), now.getMonth() - (months - index - 1), 1)
    const key = `${bucketDate.getFullYear()}-${bucketDate.getMonth()}`
    return {
      key,
      label: formatter.format(bucketDate),
      value: 0,
    }
  })

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]))

  items.forEach((item) => {
    const rawDate = getDate(item)
    if (!rawDate) {
      return
    }
    const parsed = new Date(rawDate)
    const key = `${parsed.getFullYear()}-${parsed.getMonth()}`
    const bucket = bucketMap.get(key)
    if (bucket) {
      bucket.value += 1
    }
  })

  return buckets
}

export function buildMonthlyValueSeries<T>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
  getValue: (item: T) => number,
  months = 6,
) {
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short' })
  const now = new Date()
  const buckets = Array.from({ length: months }, (_, index) => {
    const bucketDate = new Date(now.getFullYear(), now.getMonth() - (months - index - 1), 1)
    const key = `${bucketDate.getFullYear()}-${bucketDate.getMonth()}`
    return {
      key,
      label: formatter.format(bucketDate),
      value: 0,
    }
  })

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]))

  items.forEach((item) => {
    const rawDate = getDate(item)
    if (!rawDate) {
      return
    }
    const parsed = new Date(rawDate)
    const key = `${parsed.getFullYear()}-${parsed.getMonth()}`
    const bucket = bucketMap.get(key)
    if (bucket) {
      bucket.value += getValue(item)
    }
  })

  return buckets
}
