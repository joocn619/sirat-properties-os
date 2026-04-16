'use client'

import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="dashboard-theme flex min-h-screen items-center justify-center px-4 py-10">
        <div className="dashboard-panel max-w-2xl rounded-[2rem] px-8 py-10 text-center">
          <p className="dashboard-label text-[var(--color-accent)]">Application error</p>
          <h1 className="mt-4 font-display text-5xl font-medium tracking-[-0.04em] text-[var(--text-primary)]">
            Something broke inside the workspace.
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
            {error.message || 'An unexpected error interrupted the current view.'}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-full border border-[rgba(201,169,110,0.22)] bg-[var(--gradient-gold)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-inverse)]"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-primary)]"
            >
              Back home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
