import { createBrowserClient } from '@supabase/ssr'

// Dev bypass: return a no-op client when Supabase is not available locally
function makeDevClient(): any {
  const emptyResult = { data: null, error: null, count: 0 }
  function chain(): any {
    return new Proxy({}, {
      get(_t, prop) {
        if (prop === 'then') return (resolve: (v: any) => void) => resolve(emptyResult)
        return () => chain()
      },
    })
  }
  return {
    from: () => chain(),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    storage: { from: () => chain() },
  }
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  // Use mock client when dev bypass is enabled OR credentials are missing/placeholder
  if (
    process.env.NEXT_PUBLIC_DEV_BYPASS === 'true' ||
    !url || !key ||
    url === 'your_supabase_project_url'
  ) {
    return makeDevClient()
  }

  return createBrowserClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}
