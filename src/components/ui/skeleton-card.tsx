/** Kerangka kartu saat data dimuat; tinggi minimum mengikuti kartu KPI. */
export function SkeletonCard({ chart = false }: { chart?: boolean }) {
  return (
    <div className="flex min-h-56 flex-col rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
      <div className="h-4 w-32 animate-pulse rounded-ctl bg-line/70" aria-hidden="true" />
      <div className="mt-3 h-8 w-28 animate-pulse rounded-ctl bg-line/70" aria-hidden="true" />
      <div className="mt-3 h-4 w-40 animate-pulse rounded-ctl bg-line/70" aria-hidden="true" />
      {chart ? (
        <div className="mt-5 h-28 w-full animate-pulse rounded-ctl bg-line/70" aria-hidden="true" />
      ) : null}
      <div className="mt-auto h-14 w-full animate-pulse rounded-ctl bg-line/70" aria-hidden="true" />
    </div>
  );
}
