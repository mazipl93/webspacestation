// Loading placeholder that mirrors ArticleCard's geometry so the layout doesn't
// shift when real results arrive. Purely presentational.
export default function ArticleCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="relative flex flex-col overflow-hidden rounded-xl border border-hairline"
    >
      <div className="h-[176px] shrink-0 animate-pulse bg-space-surface" />
      <div className="flex flex-1 flex-col gap-3 border-t border-hairline bg-space-card px-4 pb-5 pt-4">
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-16 animate-pulse rounded bg-glass" />
          <div className="h-2.5 w-10 animate-pulse rounded bg-glass" />
        </div>
        <div className="h-3.5 w-full animate-pulse rounded bg-glass" />
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-glass" />
        <div className="mt-1.5 h-2.5 w-2/3 animate-pulse rounded bg-glass" />
      </div>
    </div>
  );
}
