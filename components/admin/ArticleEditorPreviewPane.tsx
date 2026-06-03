"use client";

import { memo, useMemo, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import type { AdminCategory, ArticleFormValues, ArticleStatus } from "@/lib/admin/types";
import {
  formToPreviewArticle,
  previewSubtitle,
} from "@/lib/admin/preview-article";
import type { NewsArticle } from "@/types";
import ArticlePublicPreview, {
  type ArticlePreviewViewport,
} from "@/components/article/ArticlePublicPreview";
import { useDebouncedValue } from "@/lib/ui/use-debounced-value";

const PREVIEW_DEBOUNCE_MS = 300;

export type ArticleEditorPreviewPaneProps = {
  form: ArticleFormValues;
  categories: AdminCategory[];
  status: ArticleStatus;
  contentOrigin?: NewsArticle["contentOrigin"];
  articleId?: string | null;
  className?: string;
};

function ViewportToggle({
  viewport,
  onChange,
}: {
  viewport: ArticlePreviewViewport;
  onChange: (v: ArticlePreviewViewport) => void;
}) {
  return (
    <div
      className="inline-flex rounded-lg border border-hairline bg-white/[0.03] p-0.5"
      role="group"
      aria-label="Tryb podglądu"
    >
      <button
        type="button"
        onClick={() => onChange("desktop")}
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
          viewport === "desktop"
            ? "bg-accent-blue/20 text-accent-cyan"
            : "text-text-muted hover:text-text-secondary"
        }`}
        aria-pressed={viewport === "desktop"}
      >
        <Monitor className="h-3.5 w-3.5" aria-hidden />
        Desktop
      </button>
      <button
        type="button"
        onClick={() => onChange("mobile")}
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
          viewport === "mobile"
            ? "bg-accent-blue/20 text-accent-cyan"
            : "text-text-muted hover:text-text-secondary"
        }`}
        aria-pressed={viewport === "mobile"}
      >
        <Smartphone className="h-3.5 w-3.5" aria-hidden />
        Mobile
      </button>
    </div>
  );
}

function ArticleEditorPreviewPaneInner({
  form,
  categories,
  status,
  contentOrigin,
  articleId,
  className = "",
}: ArticleEditorPreviewPaneProps) {
  const [viewport, setViewport] = useState<ArticlePreviewViewport>("desktop");
  const debouncedForm = useDebouncedValue(form, PREVIEW_DEBOUNCE_MS);

  /** Text fields debounced; cover/source update live so hero image is instant. */
  const previewForm = useMemo(
    () => ({
      ...debouncedForm,
      coverImage: form.coverImage,
      sourceName: form.sourceName,
      sourceUrl: form.sourceUrl,
    }),
    [
      debouncedForm,
      form.coverImage,
      form.sourceName,
      form.sourceUrl,
    ]
  );

  const previewArticle = useMemo(
    () =>
      formToPreviewArticle({
        form: previewForm,
        categories,
        contentOrigin,
        articleId: articleId ?? undefined,
      }),
    [previewForm, categories, contentOrigin, articleId]
  );

  const subtitle = useMemo(() => previewSubtitle(form), [form]);

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-[0.65rem] border border-hairline bg-space-bg ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline bg-white/[0.02] px-3 py-2.5">
        <div>
          <p className="text-meta font-semibold text-text-primary">Live preview</p>
          <p className="text-[10px] text-text-muted">
            Podgląd na żywo · status: {status}
          </p>
        </div>
        <ViewportToggle viewport={viewport} onChange={setViewport} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-space-bg">
        <ArticlePublicPreview
          article={previewArticle}
          subtitle={subtitle}
          viewport={viewport}
          embedded
        />
      </div>
    </div>
  );
}

const ArticleEditorPreviewPane = memo(ArticleEditorPreviewPaneInner);
export default ArticleEditorPreviewPane;
