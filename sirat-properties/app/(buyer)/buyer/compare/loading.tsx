export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-56 animate-pulse rounded-xl bg-white/[0.04]" />
        <div className="h-4 w-40 animate-pulse rounded-lg bg-white/[0.03]" />
      </div>
      <div className="h-[500px] animate-pulse rounded-2xl bg-white/[0.03]" />
    </div>
  )
}
