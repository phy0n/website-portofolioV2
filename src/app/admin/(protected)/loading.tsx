export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-3 w-28 rounded-full bg-white/10 animate-pulse" />
        <div className="h-8 w-64 rounded-full bg-white/10 animate-pulse" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`metric-${index}`}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          >
            <div className="h-3 w-20 rounded-full bg-white/10 animate-pulse" />
            <div className="mt-4 h-7 w-16 rounded-full bg-white/10 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="h-4 w-40 rounded-full bg-white/10 animate-pulse" />
        <div className="mt-5 h-52 w-full rounded-2xl bg-white/5 animate-shimmer" />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] lg:col-span-3">
          <div className="h-4 w-32 rounded-full bg-white/10 animate-pulse" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`row-${index}`} className="space-y-2">
                <div className="h-3 w-40 rounded-full bg-white/10 animate-pulse" />
                <div className="h-2 w-full rounded-full bg-white/5 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] lg:col-span-2">
          <div className="h-4 w-28 rounded-full bg-white/10 animate-pulse" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`meta-${index}`} className="flex items-center justify-between">
                <div className="h-3 w-28 rounded-full bg-white/10 animate-pulse" />
                <div className="h-3 w-10 rounded-full bg-white/10 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
