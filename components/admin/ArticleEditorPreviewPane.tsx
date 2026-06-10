"use client";

import { memo, useMemo, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import type {
  AdminCategory,
  ArticleFormValues,
  ArticleStatus,
  BylineAuthorOption,
} from "@/lib/admin/types";
import {
  formToPreviewArticle,
} from "@/lib/admin/preview-article";
import type { NewsArticle } from "@/types";
import ArticlePublicPreview, {
  type ArticlePreviewViewport,
} from "@/components/article/ArticlePublicPreview";
import { useDebouncedValue } from "@/lib/ui/use-debounced-value";
import { cn } from "@/lib/cn";

const PREVIEW_DEBOUNCE_MS = 300;

export type ArticleEditorPreviewPaneProps = {
  form: ArticleFormValues;
  categories: AdminCategory[];
  status: ArticleStatus;
  contentOrigin?: NewsArticle["contentOrigin"];
  articleId?: string | null;
  bylineAuthors?: BylineAuthorOption[];
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
  bylineAuthors,
  className = "",
}: ArticleEditorPreviewPaneProps) {
  const [viewport, setViewport] = useState<ArticlePreviewViewport>("desktop");
  const debouncedForm = useDebouncedValue(form, PREVIEW_DEBOUNCE_MS);

  const previewForm = useMemo(
    () => ({
      ...debouncedForm,
      coverImage: form.coverImage,
      coverImageCredit: form.coverImageCredit,
      sourceName: form.sourceName,
      sourceUrl: form.sourceUrl,
    }),
    [debouncedForm, form.coverImage, form.coverImageCredit, form.sourceName, form.sourceUrl]
  );

  const previewArticle = useMemo(
    () =>
      formToPreviewArticle({
        form: previewForm,
        categories,
        contentOrigin,
        articleId: articleId ?? undefined,
        bylineAuthors,
      }),
    [previewForm, categories, contentOrigin, articleId, bylineAuthors]
  );

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-meta font-semibold text-text-primary">Live preview</p>
          <p className="text-[10px] text-text-muted">
            Podgląd jak na portalu — zmiany widać od razu (desktop / mobile).
          </p>
        </div>
        <ViewportToggle viewport={viewport} onChange={setViewport} />
      </div>

      <div className="overflow-hidden rounded-[0.65rem] border border-hairline bg-space-bg">
        <div className="max-h-[min(78vh,820px)] overflow-x-auto overflow-y-auto overscroll-contain">
          <div
            className={cn(
              "mx-auto",
              viewport === "desktop" ? "w-full max-w-4xl" : "w-full max-w-[390px]"
            )}
          >
            <ArticlePublicPreview
              article={previewArticle}
              viewport={viewport}
              embedded
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const ArticleEditorPreviewPane = memo(ArticleEditorPreviewPaneInner);
export default ArticleEditorPreviewPane;
