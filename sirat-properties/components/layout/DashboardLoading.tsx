export function DashboardLoading({ roleLabel }: { roleLabel: string }) {
  return (
    <div className="dashboard-theme">
      <div className="dashboard-shell flex min-h-screen">
        <aside className="hidden h-screen w-[280px] shrink-0 border-r border-white/6 bg-[rgba(11,11,17,0.92)] px-4 py-5 lg:block">
          <div className="skeleton h-12 rounded-2xl" />
          <div className="mt-8 space-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="skeleton h-12 rounded-2xl" />
            ))}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-white/6 bg-[rgba(10,10,15,0.72)] px-4 py-4 backdrop-blur-2xl sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div className="space-y-3">
                <div className="skeleton h-6 w-32 rounded-full" />
                <div className="skeleton h-4 w-48 rounded-full" />
              </div>
              <div className="flex items-center gap-3">
                <div className="skeleton h-10 w-10 rounded-2xl" />
                <div className="skeleton h-10 w-40 rounded-full" />
              </div>
            </div>
          </header>

          <main className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
              <section className="dashboard-panel rounded-[2rem] px-6 py-6 sm:px-8">
                <p className="dashboard-label text-[var(--color-accent)]">{roleLabel} workspace</p>
                <div className="mt-4 space-y-3">
                  <div className="skeleton h-12 w-2/3 rounded-2xl" />
                  <div className="skeleton h-4 w-full rounded-full" />
                  <div className="skeleton h-4 w-3/4 rounded-full" />
                </div>
              </section>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="dashboard-panel rounded-[1.75rem] p-5">
                    <div className="skeleton h-4 w-24 rounded-full" />
                    <div className="mt-5 skeleton h-10 w-20 rounded-2xl" />
                    <div className="mt-4 skeleton h-4 w-full rounded-full" />
                  </div>
                ))}
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="dashboard-panel rounded-[2rem] p-6">
                    <div className="skeleton h-6 w-40 rounded-2xl" />
                    <div className="mt-6 space-y-3">
                      {Array.from({ length: 4 }).map((__, itemIndex) => (
                        <div key={itemIndex} className="skeleton h-24 rounded-[1.5rem]" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
