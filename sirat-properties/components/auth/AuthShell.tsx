import { Building2, Shield, Sparkles, TrendingUp, Users, MapPin } from 'lucide-react'

interface AuthShellProps {
  children: React.ReactNode
  description: string
  eyebrow: string
  heading: string
  step?: string
  stepNumber?: 1 | 2 | 3 | 4
}

const STEPS = ['Sign in', 'Role', 'Verify', 'Profile']

export function AuthShell({
  children,
  description,
  eyebrow,
  heading,
  step,
  stepNumber = 1,
}: AuthShellProps) {
  return (
    <div className="auth-theme grid min-h-screen lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.15fr_0.85fr]">

      {/* ── LEFT: Brand Panel ── */}
      <section className="relative hidden overflow-hidden border-r border-white/[0.06] lg:flex">

        {/* Deep layered background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#0A0A0F_0%,#0C0C14_50%,#0A0B10_100%)]" />
          {/* Gold orb — top left */}
          <div className="absolute -top-32 -left-32 size-[500px] rounded-full bg-[radial-gradient(circle,rgba(201,169,110,0.16)_0%,transparent_65%)]" style={{ animation: 'aurora-shift 12s ease-in-out infinite alternate' }} />
          {/* Blue orb — top right */}
          <div className="absolute -top-20 right-0 size-[360px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.12)_0%,transparent_60%)]" style={{ animation: 'aurora-shift 9s ease-in-out 2s infinite alternate-reverse' }} />
          {/* Subtle gold orb — bottom */}
          <div className="absolute -bottom-40 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,169,110,0.08)_0%,transparent_60%)]" style={{ animation: 'aurora-shift 14s ease-in-out 1s infinite alternate' }} />
          {/* Dot grid texture */}
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)]" />
        </div>

        <div className="relative z-10 flex w-full flex-col justify-between px-10 py-12 xl:px-14 xl:py-14">

          {/* Brand wordmark */}
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[rgba(201,169,110,0.12)] ring-1 ring-[rgba(201,169,110,0.2)]">
              <Building2 className="size-4 text-[var(--color-accent)]" />
            </div>
            <span className="font-display text-base font-medium tracking-wide text-[var(--text-primary)]">
              Sirat Properties
            </span>
          </div>

          {/* Center visual */}
          <div className="flex flex-col items-center gap-8">
            {/* Headline */}
            <div className="space-y-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                Premium Real Estate OS
              </p>
              <h1 className="font-display text-5xl font-medium leading-[1.08] tracking-[-0.04em] text-[var(--text-primary)] xl:text-6xl">
                Where serious<br />
                <em className="not-italic text-[var(--color-accent)]">property</em> deals<br />
                begin.
              </h1>
            </div>

            {/* Property card mockup */}
            <div className="relative w-full max-w-sm">
              {/* Glow behind card */}
              <div className="absolute -inset-6 rounded-[3rem] bg-[radial-gradient(ellipse,rgba(201,169,110,0.15),transparent_65%)] blur-2xl" />

              <div className="auth-visual-card relative overflow-hidden rounded-[2rem]">
                {/* Card image area */}
                <div className="relative h-44 overflow-hidden bg-[linear-gradient(135deg,#1a1a2e_0%,#16213e_35%,#0f3460_60%,#1a1a2e_100%)]">
                  {/* Building silhouette */}
                  <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-end gap-1.5 px-6">
                    {[28, 48, 64, 52, 36, 44, 60, 40].map((h, i) => (
                      <div
                        key={i}
                        className="w-5 rounded-t-sm"
                        style={{
                          height: `${h}px`,
                          background: `linear-gradient(to top, rgba(201,169,110,${0.15 + (i % 3) * 0.06}) 0%, rgba(201,169,110,0.04) 100%)`,
                          boxShadow: 'inset 0 1px 0 rgba(201,169,110,0.2)',
                        }}
                      />
                    ))}
                  </div>
                  {/* Ambient light overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,169,110,0.12),transparent_55%)]" />
                  {/* Premium badge */}
                  <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-[rgba(201,169,110,0.18)] px-2.5 py-1 ring-1 ring-[rgba(201,169,110,0.28)] backdrop-blur-sm">
                    <Sparkles className="size-3 text-[var(--color-accent)]" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">Premium</span>
                  </div>
                </div>

                {/* Card body */}
                <div className="space-y-3 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-accent)]">
                      Featured listing
                    </p>
                    <p className="mt-1 font-display text-xl font-medium text-[var(--text-primary)]">
                      Skyline Residence, Gulshan
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                    <MapPin className="size-3" />
                    Gulshan-2, Dhaka · 4 BR · 3,200 sqft
                  </div>
                  <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                    <p className="font-price text-lg font-semibold text-[var(--color-accent)]">
                      ৳ 2,40,00,000
                    </p>
                    <span className="rounded-full bg-[rgba(16,185,129,0.1)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#10b981] ring-1 ring-[rgba(16,185,129,0.2)]">
                      Available
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating stats */}
              <div className="absolute -left-10 top-12 auth-stat-pill">
                <TrendingUp className="size-3.5 text-[var(--color-accent)]" />
                <span className="text-xs font-semibold text-[var(--text-primary)]">240+</span>
                <span className="text-xs text-[var(--text-tertiary)]">Listings</span>
              </div>
              <div className="absolute -right-8 bottom-16 auth-stat-pill">
                <Users className="size-3.5 text-[var(--color-accent)]" />
                <span className="text-xs font-semibold text-[var(--text-primary)]">1,200+</span>
                <span className="text-xs text-[var(--text-tertiary)]">Buyers</span>
              </div>
              <div className="absolute -right-6 top-8 auth-stat-pill">
                <Shield className="size-3.5 text-[var(--color-accent)]" />
                <span className="text-xs font-semibold text-[var(--text-primary)]">Verified</span>
              </div>
            </div>
          </div>

          {/* Bottom feature cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { n: '01', title: 'Unified Roles', body: 'Buyer, seller, agent & admin in one system.' },
              { n: '02', title: 'Secure Flow', body: 'KYC, profile setup — one coherent onboarding.' },
              { n: '03', title: 'Luxury Design', body: 'Gold accents, dark surfaces, soft motion.' },
            ].map((f) => (
              <div key={f.n} className="auth-feature-card rounded-[1.5rem] p-4">
                <p className="font-price text-xs font-semibold text-[rgba(201,169,110,0.5)]">{f.n}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)]">{f.title}</p>
                <p className="mt-2 text-xs leading-5 text-[var(--text-tertiary)]">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RIGHT: Auth Card Panel ── */}
      <section className="relative flex items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
        {/* Subtle right panel bg */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,169,110,0.06),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.05),transparent_50%)]" />

        <div className="relative z-10 w-full max-w-[26rem]">
          {/* Step progress indicator */}
          {step && (
            <div className="mb-6 flex items-center gap-2">
              {STEPS.map((s, i) => {
                const idx = i + 1
                const isActive = idx === stepNumber
                const isDone = idx < stepNumber
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 ${isActive ? 'opacity-100' : isDone ? 'opacity-60' : 'opacity-25'}`}>
                      <div className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-[var(--color-accent)] text-[#0A0A0F]'
                          : isDone
                            ? 'bg-[rgba(201,169,110,0.3)] text-[var(--color-accent)]'
                            : 'bg-white/[0.06] text-[var(--text-tertiary)]'
                      }`}>
                        {idx}
                      </div>
                      <span className={`hidden text-xs font-medium sm:inline ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--text-tertiary)]'}`}>
                        {s}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-px w-4 rounded-full ${idx < stepNumber ? 'bg-[rgba(201,169,110,0.4)]' : 'bg-white/[0.08]'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Main card */}
          <div className="auth-card-premium rounded-[2.25rem] p-7 sm:p-9">
            {/* Card inner ambient glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-48 rounded-t-[2.25rem] bg-[radial-gradient(ellipse_at_top,rgba(201,169,110,0.07),transparent_70%)]" />

            <div className="relative space-y-2 mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                {eyebrow}
              </p>
              <h2 className="font-display text-[2.4rem] font-medium leading-[1.1] tracking-[-0.04em] text-[var(--text-primary)] sm:text-5xl">
                {heading}
              </h2>
              <p className="pt-1 text-sm leading-7 text-[var(--text-secondary)]">
                {description}
              </p>
            </div>

            <div className="relative">
              {children}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
