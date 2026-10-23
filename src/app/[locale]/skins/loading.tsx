export default function SkinsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="h-8 w-40 animate-pulse rounded-md bg-surface-raised" />
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-border bg-surface p-5">
            <div className="h-40 w-full rounded-md bg-surface-raised" />
            <div className="mt-4 h-4 w-2/3 rounded bg-surface-raised" />
            <div className="mt-2 h-3 w-full rounded bg-surface-raised" />
          </div>
        ))}
      </div>
    </div>
  );
}
