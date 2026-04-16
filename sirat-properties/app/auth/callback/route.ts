import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // আমাদের users table-এ আছে কিনা check করো
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, role')
          .eq('id', user.id)
          .single()

        if (!existingUser) {
          // নতুন user — role selection-এ পাঠাও
          return NextResponse.redirect(new URL('/auth/role', origin))
        }

        // Role আছে কিন্তু seller/agent হলে KYC check করো
        if (
          existingUser.role === 'seller' ||
          existingUser.role === 'agent'
        ) {
          const { data: kyc } = await supabase
            .from('kyc_documents')
            .select('status')
            .eq('user_id', user.id)
            .single()

          if (!kyc) {
            return NextResponse.redirect(new URL('/auth/kyc', origin))
          }
        }

        // Role অনুযায়ী dashboard-এ পাঠাও
        const dashboardMap: Record<string, string> = {
          buyer: '/buyer/dashboard',
          seller: '/seller/dashboard',
          agent: '/agent/dashboard',
          admin: '/admin/dashboard',
          super_admin: '/admin/dashboard',
          hr_admin: '/admin/hr',
          accounts_admin: '/admin/accounts',
        }

        const redirectTo =
          dashboardMap[existingUser.role] ?? '/buyer/dashboard'
        return NextResponse.redirect(new URL(redirectTo, origin))
      }
    }
  }

  return NextResponse.redirect(new URL('/auth/login?error=auth_failed', origin))
}
