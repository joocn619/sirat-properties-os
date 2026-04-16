export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-white/[0.04]" />
        <div className="h-4 w-32 animate-pulse rounded-lg bg-white/[0.03]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="aspect-[4/3] animate-pulse bg-white/[0.04]" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-white/[0.04]" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.03]" />
              <div className="h-5 w-1/3 animate-pulse rounded bg-white/[0.04]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
