import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="dashboard-theme flex min-h-screen items-center justify-center px-4 py-10">
      <div className="dashboard-panel max-w-2xl rounded-[2rem] px-8 py-10 text-center">
        <p className="dashboard-label text-[var(--color-accent)]">404 / Not found</p>
        <h1 className="mt-4 font-display text-5xl font-medium tracking-[-0.04em] text-[var(--text-primary)]">
          This page left the estate.
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
          The route you requested does not exist, may have moved, or is not available for this account.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-[rgba(201,169,110,0.22)] bg-[var(--gradient-gold)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-inverse)]"
          >
            Go home
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-primary)]"
          >
            Open login
          </Link>
        </div>
      </div>
    </main>
  )
}
