export function AuthLoading() {
  return (
    <div className="auth-theme grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden border-r border-white/6 lg:block" />
      <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl">
          <div className="auth-card rounded-[2rem] p-6 sm:p-8 lg:p-10">
            <div className="space-y-4">
              <div className="skeleton h-6 w-28 rounded-full" />
              <div className="skeleton h-12 w-3/4 rounded-2xl" />
              <div className="skeleton h-4 w-full rounded-full" />
              <div className="skeleton h-4 w-2/3 rounded-full" />
            </div>
            <div className="mt-8 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="skeleton h-20 rounded-[1.5rem]" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
