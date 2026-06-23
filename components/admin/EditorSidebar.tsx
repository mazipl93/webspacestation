"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Image, Send, Settings2 } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  Button,
  Field,
  Select,
  TextArea,
  TextInput,
  Toggle,
} from "@/components/admin/primitives";
import StatusBadge from "@/components/admin/StatusBadge";
import {
  EditorControlPanel,
  EditorFieldPanel,
} from "@/components/admin/EditorFieldPanel";
import AuthorBylineField from "@/components/admin/AuthorBylineField";
import CoverImageUploader from "@/components/admin/CoverImageUploader";
import CoverImageCredit from "@/components/article/CoverImageCredit";
import {
  ARTICLE_CONTENT_KINDS,
  CONTENT_KIND_HINTS,
  CONTENT_KIND_LABELS,
} from "@/lib/articles/content-kind";
import { hasPublishableBody } from "@/lib/articles/workflow";
import type {
  AdminCategory,
  ArticleContentKind,
  ArticleFormValues,
  ArticleStatus,
  BylineAuthorOption,
} from "@/lib/admin/types";

type Tab = "meta" | "cover" | "publish";

const STATUS_DESCRIPTIONS: Record<ArticleStatus, string> = {
  DRAFT: "Szkic — widoczny tylko dla redakcji",
  REVIEW: "Oczekuje na recenzję",
  PUBLISHED: "Opublikowany",
  SCHEDULED: "Zaplanowany",
  ARCHIVED: "Zarchiwizowany",
};

export interface EditorSidebarProps {
  form: ArticleFormValues;
  update: <K extends keyof ArticleFormValues>(key: K, value: ArticleFormValues[K]) => void;
  onSlugChange: (value: string) => void;
  sortedCategories: AdminCategory[];
  bylineAuthors: BylineAuthorOption[];
  categoryEditorHint: string | undefined;
  status: ArticleStatus;
  publishedSlug: string | null;
  currentId: string | null;
  saving: boolean;
  canPublish: boolean;
  schedulePastDue: boolean;
  scheduleDueLabel: string | null;
  publishMode: "now" | "schedule";
  onSetPublishMode: (mode: "now" | "schedule") => void;
  onPublish(): void;
  onSaveDraft(): void;
  onSubmitReview(): void;
  onSchedule(): void;
  onUpdate(): void;
  isPublishReady: boolean;
}

const TABS: { id: Tab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "meta", label: "Meta", Icon: Settings2 },
  { id: "cover", label: "Okładka", Icon: Image },
  { id: "publish", label: "Publikacja", Icon: Send },
];

export default function EditorSidebar({
  form,
  update,
  onSlugChange,
  sortedCategories,
  bylineAuthors,
  categoryEditorHint,
  status,
  publishedSlug,
  currentId,
  saving,
  canPublish,
  schedulePastDue,
  scheduleDueLabel,
  publishMode,
  onSetPublishMode,
  onPublish,
  onSaveDraft,
  onSubmitReview,
  onSchedule,
  onUpdate,
  isPublishReady,
}: EditorSidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>("meta");

  const previewCredit = form.coverImageCredit.trim() || null;
  const todayMin = new Date(Date.now() + 60_000).toISOString().slice(0, 16);

  return (
    <div className="flex h-full flex-col">
      {/* ── Tab bar ── */}
      <div className="flex shrink-0 border-b border-hairline">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 border-b-2 px-3 py-2.5 text-meta font-medium transition-colors",
              activeTab === id
                ? "border-accent-blue text-text-primary"
                : "border-transparent text-text-tertiary hover:text-text-primary"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── META ── */}
      {activeTab === "meta" && (
        <div className="flex flex-col gap-4 p-4">
          <Field
            label="Slug"
            htmlFor="sidebar-slug"
            hint="Generowany z tytułu — można nadpisać"
          >
            <TextInput
              id="sidebar-slug"
              value={form.slug}
              placeholder="slug-artykulu"
              onChange={(e) => onSlugChange(e.target.value)}
            />
          </Field>

          <Field
            label="Kategoria"
            htmlFor="sidebar-category"
            hint={
              categoryEditorHint ??
              "Wymagana przed publikacją."
            }
          >
            <Select
              id="sidebar-category"
              value={form.categoryId}
              onChange={(e) => update("categoryId", e.target.value)}
            >
              <option value="">Wybierz kategorię…</option>
              {sortedCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Typ treści"
            htmlFor="sidebar-contentKind"
            hint={
              CONTENT_KIND_HINTS[form.contentKind] ??
              "Aktualność vs wiedza."
            }
          >
            <Select
              id="sidebar-contentKind"
              value={form.contentKind}
              onChange={(e) =>
                update("contentKind", e.target.value as ArticleContentKind)
              }
            >
              {ARTICLE_CONTENT_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {CONTENT_KIND_LABELS[kind]}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Tagi"
            htmlFor="sidebar-tags"
            hint="Oddziel przecinkami (maks. 5)"
          >
            <TextInput
              id="sidebar-tags"
              value={form.tagsText}
              placeholder="np. Space, NASA, Starship"
              onChange={(e) => update("tagsText", e.target.value)}
            />
          </Field>

          <Field label="Czas czytania (min)" htmlFor="sidebar-readingTime">
            <TextInput
              id="sidebar-readingTime"
              type="number"
              min={1}
              max={60}
              value={form.readingTime ?? ""}
              placeholder="np. 4"
              onChange={(e) =>
                update(
                  "readingTime",
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
            />
          </Field>

          <EditorControlPanel
            title="Ważne"
            description="Znaczek Ważne na kartach i w hero. Nie wpływa na Popularne."
          >
            <Toggle
              checked={form.featured}
              onChange={(v) => update("featured", v)}
            />
          </EditorControlPanel>

          <Field
            label="Pozycja w hero (0 = poza)"
            htmlFor="sidebar-heroPosition"
            hint="1 = przesuwa istniejące o 1 w dół. 2–4 = ręczna pozycja. 0 = usuwa z hero."
          >
            <TextInput
              id="sidebar-heroPosition"
              type="number"
              min={0}
              max={4}
              value={form.heroPosition}
              onChange={(e) =>
                update(
                  "heroPosition",
                  Number.parseInt(e.target.value, 10) || 0
                )
              }
            />
          </Field>

          <EditorControlPanel
            title="W centrum uwagi"
            description="Sekcja weekTopic na homepage."
          >
            <Toggle
              checked={form.weekTopic}
              onChange={(v) => update("weekTopic", v)}
            />
          </EditorControlPanel>

          {form.weekTopic && (
            <Field
              label="Pozycja weekTopic"
              htmlFor="sidebar-weekTopicPosition"
              hint="0 = poza sekcją. 1–4 = kolejność slajdów."
            >
              <TextInput
                id="sidebar-weekTopicPosition"
                type="number"
                min={0}
                max={4}
                value={form.weekTopicPosition}
                onChange={(e) =>
                  update(
                    "weekTopicPosition",
                    Number.parseInt(e.target.value, 10) || 0
                  )
                }
              />
            </Field>
          )}

          <AuthorBylineField
            bylineUserId={form.bylineUserId}
            authorByline={form.authorByline}
            authors={bylineAuthors}
            onChangeBylineUserId={(id) => update("bylineUserId", id)}
            onChangeAuthorByline={(text) => update("authorByline", text)}
          />
        </div>
      )}

      {/* ── OKŁADKA ── */}
      {activeTab === "cover" && (
        <div className="flex flex-col gap-4 p-4">
          <Field label="Plik lub URL okładki" hint="Upload (WebP) lub wklej link">
            <CoverImageUploader
              articleId={currentId}
              coverUrl={form.coverImage.trim()}
              onCoverUrl={(url) => update("coverImage", url)}
              disabled={false}
            />
          </Field>

          <Field label="Obraz okładki (URL)" htmlFor="sidebar-coverImage">
            <TextInput
              id="sidebar-coverImage"
              value={form.coverImage}
              placeholder="https://… lub upload powyżej"
              onChange={(e) => update("coverImage", e.target.value)}
            />
          </Field>

          <Field
            label="Podpis zdjęcia"
            htmlFor="sidebar-coverImageCredit"
            hint="Autor zdjęcia, licencja. Przy RSS auto-podpis gdy puste."
          >
            <TextArea
              id="sidebar-coverImageCredit"
              rows={3}
              value={form.coverImageCredit}
              placeholder="np. NASA / Joel Kowsky · CC BY-NC 2.0"
              onChange={(e) => update("coverImageCredit", e.target.value)}
            />
          </Field>

          {previewCredit && (
            <EditorFieldPanel>
              <p className="mb-1.5 text-[10px] text-text-muted">
                Podgląd podpisu pod okładką:
              </p>
              <CoverImageCredit variant="hero" credit={previewCredit} />
            </EditorFieldPanel>
          )}
        </div>
      )}

      {/* ── PUBLIKACJA ── */}
      {activeTab === "publish" && (
        <div className="flex flex-col gap-4 p-4">
          {/* Status */}
          <div className="flex items-start gap-2.5">
            <StatusBadge status={status} />
            <p className="text-[12px] leading-relaxed text-text-muted">
              {STATUS_DESCRIPTIONS[status]}
            </p>
          </div>

          {/* Opublikowany — tylko aktualizacja */}
          {status === "PUBLISHED" && canPublish && (
            <Button
              onClick={onUpdate}
              disabled={saving || !isPublishReady}
              className="w-full justify-center"
            >
              Zaktualizuj
            </Button>
          )}

          {/* Nieodpublikowane — harmonogram + przyciski */}
          {status !== "PUBLISHED" && status !== "ARCHIVED" && (
            <>
              <div className="flex flex-col gap-1.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-text-secondary">
                  Harmonogram
                </p>
                <p className="text-[10px] leading-snug text-text-muted">
                  Data i godzina w czasie lokalnym (24h).
                </p>
                <input
                  type="datetime-local"
                  min={todayMin}
                  value={form.publishAtLocal}
                  onChange={(e) => {
                    update("publishAtLocal", e.target.value);
                    onSetPublishMode(e.target.value ? "schedule" : "now");
                  }}
                  className="w-full rounded-lg border border-hairline bg-white/5 px-3 py-2 text-meta text-text-primary"
                />
              </div>

              {schedulePastDue && (
                <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-300">
                  Termin minął{scheduleDueLabel ? ` (${scheduleDueLabel})` : ""}.
                </p>
              )}

              {canPublish && (
                <div className="flex flex-col gap-2">
                  {schedulePastDue && (
                    <Button
                      onClick={onPublish}
                      disabled={saving || !isPublishReady}
                      className="w-full justify-center"
                    >
                      Opublikuj teraz (termin minął)
                    </Button>
                  )}
                  {publishMode === "schedule" ? (
                    <Button
                      onClick={onSchedule}
                      disabled={saving || !isPublishReady}
                      className="w-full justify-center"
                      title={
                        !hasPublishableBody(form)
                          ? "Treść lub zajawka jest wymagana"
                          : !form.categoryId
                            ? "Kategoria jest wymagana"
                            : undefined
                      }
                    >
                      {status === "SCHEDULED" ? "Zaktualizuj plan" : "Zaplanuj"}
                    </Button>
                  ) : status !== "SCHEDULED" ? (
                    <Button
                      onClick={onPublish}
                      disabled={saving || !isPublishReady}
                      className="w-full justify-center"
                      title={
                        !hasPublishableBody(form)
                          ? "Treść lub zajawka jest wymagana"
                          : !form.categoryId
                            ? "Kategoria jest wymagana"
                            : undefined
                      }
                    >
                      Opublikuj
                    </Button>
                  ) : null}
                </div>
              )}

              {!canPublish && (
                <p className="text-[12px] text-text-muted">
                  Publikacja wymaga roli Edytor lub Administrator.
                </p>
              )}
            </>
          )}

          {/* Workflow: do sprawdzenia / przenieś do szkiców */}
          {currentId && (
            <div className="flex flex-col gap-2">
              {status === "DRAFT" && (
                <Button
                  variant="ghost"
                  onClick={onSubmitReview}
                  disabled={saving || !form.categoryId}
                  className="w-full justify-center"
                >
                  Do sprawdzenia
                </Button>
              )}
              {status === "REVIEW" && (
                <Button
                  variant="ghost"
                  onClick={onSaveDraft}
                  disabled={saving}
                  className="w-full justify-center"
                >
                  Przenieś do szkiców
                </Button>
              )}
            </div>
          )}

          {/* Linki */}
          <div className="flex flex-col gap-2 border-t border-hairline pt-4">
            {publishedSlug ? (
              <Link
                href={`/aktualnosci/${publishedSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary transition-colors hover:text-text-primary"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Podgląd na portalu
              </Link>
            ) : currentId ? (
              <Link
                href={`/admin/articles/${currentId}/preview`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] text-accent-cyan transition-colors hover:text-accent-cyan/80"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Preview publikacji
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
