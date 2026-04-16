import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function makeDevServerClient(): any {
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
    },
    storage: { from: () => chain() },
  }
}

export async function createClient() {
  if (process.env.DEV_BYPASS_AUTH === 'true' && process.env.NODE_ENV !== 'production') {
    return makeDevServerClient()
  }

  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component-এ call হলে ignore করো
          }
        },
      },
    }
  )
}
