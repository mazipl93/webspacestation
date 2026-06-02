import type { AdminArticleEnrichmentView } from "@/lib/admin/rss-display";
import { cn } from "@/lib/cn";

export default function ArticleEnrichmentPreview({
  view,
  className,
}: {
  view: AdminArticleEnrichmentView;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[0.6rem] border border-hairline bg-white/[0.03] px-4 py-3",
        className
      )}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-overline font-semibold uppercase tracking-wide text-accent-cyan">
          Podgląd AI (RSS)
        </span>
        {view.isRawDraft ? (
          <span className="rounded-badge border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-caption font-medium text-amber-200">
            Surowy szkic — czeka na AI
          </span>
        ) : view.isEnriched ? (
          <span className="rounded-badge border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-caption font-medium text-emerald-300">
            Wzbogacony
          </span>
        ) : null}
        {view.readingTimeLabel ? (
          <span className="text-caption text-text-muted">
            {view.readingTimeLabel} czytania
          </span>
        ) : null}
      </div>

      <p className="text-meta font-semibold text-text-primary">{view.title}</p>

      {view.summary ? (
        <p className="mt-2 text-meta leading-relaxed text-text-secondary">
          {view.summary}
        </p>
      ) : (
        <p className="mt-2 text-meta italic text-text-muted">
          Brak streszczenia w bazie — uruchom proces AI lub uzupełnij zajawkę.
        </p>
      )}

      <dl className="mt-3 grid gap-2 text-caption sm:grid-cols-2">
        <div>
          <dt className="text-text-muted">Kategoria</dt>
          <dd className="font-medium text-text-secondary">{view.categoryName}</dd>
        </div>
        <div>
          <dt className="text-text-muted">Tagi</dt>
          <dd className="mt-0.5 flex flex-wrap gap-1">
            {view.tags.length > 0 ? (
              view.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-badge border border-hairline bg-white/5 px-2 py-0.5 text-caption text-text-secondary"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-text-muted">—</span>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
