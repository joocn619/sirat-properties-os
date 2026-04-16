import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

import { AuthShell } from '@/components/auth/AuthShell'
import { EmailAuthForm } from '@/components/auth/EmailAuthForm'

const DEV_BYPASS = process.env.DEV_BYPASS_AUTH === 'true' && process.env.NODE_ENV !== 'production'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  return (
    <AuthShell
      eyebrow="Access"
      heading="Enter your Sirat workspace."
      description="Sign in or create an account to access the real estate operating system."
      step="Step 1 / Sign in"
      stepNumber={1}
    >
      <div className="space-y-5">
        <ErrorMessage searchParams={searchParams} />

        {/* Dev bypass — local only */}
        {DEV_BYPASS && (
          <div className="rounded-2xl border border-[rgba(201,169,110,0.25)] bg-[rgba(201,169,110,0.06)] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
              Dev Bypass — local only
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Buyer', href: '/buyer/dashboard' },
                { label: 'Seller', href: '/seller/dashboard' },
                { label: 'Agent', href: '/agent/dashboard' },
                { label: 'Admin', href: '/admin/dashboard' },
              ].map((role) => (
                <Link
                  key={role.href}
                  href={role.href}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.04] py-2 text-center text-xs font-semibold text-[var(--text-secondary)] transition hover:border-[rgba(201,169,110,0.3)] hover:bg-[rgba(201,169,110,0.08)] hover:text-[var(--color-accent)]"
                >
                  {role.label} →
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Email Sign In / Sign Up */}
        <EmailAuthForm />

        {/* What happens next */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
            What happens next
          </p>
          <div className="space-y-3">
            {[
              'Choose your workspace role — buyer, seller, or agent.',
              'Complete identity verification if you plan to list or broker.',
              'Finish your profile and enter the redesigned dashboard.',
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[rgba(201,169,110,0.1)] ring-1 ring-[rgba(201,169,110,0.18)]">
                  <CheckCircle2 className="size-3 text-[var(--color-accent)]" />
                </div>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs leading-6 text-[var(--text-tertiary)]">
          By continuing you agree to the platform terms and privacy policy.
        </p>
      </div>
    </AuthShell>
  )
}

async function ErrorMessage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  if (!params.error) return null

  return (
    <div className="rounded-2xl border border-[rgba(244,63,94,0.22)] bg-[rgba(244,63,94,0.08)] px-4 py-3 text-sm text-[var(--color-rose)]">
      Login failed. Please try again.
    </div>
  )
}
