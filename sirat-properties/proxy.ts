import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/callback', '/projects', '/properties']
const AUTH_ROUTES = ['/auth/login']

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public pages — সবাই দেখতে পারবে
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return supabaseResponse
  }

  // Login না করলে login page-এ পাঠাও
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Login করা user login page-এ গেলে dashboard-এ পাঠাও
  if (AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/buyer/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
