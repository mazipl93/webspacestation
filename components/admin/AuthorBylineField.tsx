"use client";

import { useEffect, useState } from "react";
import { adminApi, ApiError } from "@/lib/admin/api";
import type { BylineAuthorOption } from "@/lib/admin/types";
import { cmsRoleLabel } from "@/lib/ui/cms-role-labels";
import { EditorFieldPanel } from "@/components/admin/EditorFieldPanel";
import { Field, TextInput } from "@/components/admin/primitives";
import Avatar from "@/components/profile/Avatar";
import { cn } from "@/lib/cn";

type Mode = "none" | "team" | "manual";

function deriveMode(bylineUserId: string, authorByline: string): Mode {
  if (bylineUserId.trim()) return "team";
  if (authorByline.trim()) return "manual";
  return "none";
}

export default function AuthorBylineField({
  bylineUserId,
  authorByline,
  authors: authorsProp,
  onChangeBylineUserId,
  onChangeAuthorByline,
}: {
  bylineUserId: string;
  authorByline: string;
  currentUserId?: string;
  authors?: BylineAuthorOption[];
  onChangeBylineUserId: (id: string) => void;
  onChangeAuthorByline: (text: string) => void;
}) {
  const [authorsLocal, setAuthorsLocal] = useState<BylineAuthorOption[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<Mode>(() =>
    deriveMode(bylineUserId, authorByline)
  );
  const authors = authorsProp ?? authorsLocal;

  useEffect(() => {
    if (authorsProp) return;
    let active = true;
    adminApi
      .listBylineAuthors()
      .then((data) => {
        if (active) setAuthorsLocal(data);
      })
      .catch((e) => {
        if (active) {
          setLoadError(e instanceof ApiError ? e.message : "Nie udało się załadować redakcji.");
        }
      });
    return () => {
      active = false;
    };
  }, [authorsProp]);

  const defaultTeamId = (): string => {
    if (bylineUserId.trim() && authors.some((a) => a.id === bylineUserId)) {
      return bylineUserId;
    }
    return authors[0]?.id ?? "";
  };

  const setMode = (next: Mode) => {
    setActiveMode(next);
    if (next === "none") {
      onChangeBylineUserId("");
      onChangeAuthorByline("");
      return;
    }
    if (next === "manual") {
      onChangeBylineUserId("");
      return;
    }
    onChangeAuthorByline("");
    const id = defaultTeamId();
    if (id) onChangeBylineUserId(id);
  };

  const selectTeam = (id: string) => {
    setActiveMode("team");
    onChangeBylineUserId(id);
    onChangeAuthorByline("");
  };

  return (
    <div className="flex flex-col gap-3">
      <EditorFieldPanel
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Sposób wyświetlania autora"
      >
        {(
          [
            { id: "none" as const, label: "Bez autora" },
            { id: "team" as const, label: "Z redakcji" },
            { id: "manual" as const, label: "Wpisz ręcznie" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setMode(opt.id)}
            className={cn(
              "rounded-badge border px-3 py-1.5 text-meta font-semibold transition-colors",
              activeMode === opt.id
                ? "border-accent-blue/50 bg-accent-blue/20 text-text-primary"
                : "border-white/16 bg-[#090d13] text-text-secondary hover:border-white/24 hover:bg-[#0b1018]"
            )}
            aria-pressed={activeMode === opt.id}
          >
            {opt.label}
          </button>
        ))}
      </EditorFieldPanel>

      {loadError ? (
        <EditorFieldPanel>
          <p className="text-caption text-accent-live">{loadError}</p>
        </EditorFieldPanel>
      ) : null}

      {activeMode === "team" ? (
        <EditorFieldPanel className="grid gap-2 sm:grid-cols-2">
          {authors.length === 0 ? (
            <p className="text-caption text-text-muted">Ładowanie zespołu…</p>
          ) : (
            authors.map((a) => {
              const selected = bylineUserId === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => selectTeam(a.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                    selected
                      ? "border-accent-blue/50 bg-accent-blue/15 ring-1 ring-accent-blue/30"
                      : "border-white/16 bg-[#090d13] hover:border-white/24 hover:bg-[#0b1018]"
                  )}
                >
                  <Avatar name={a.name} src={a.avatarUrl ?? undefined} size={36} squared />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-meta font-semibold text-text-primary">
                      {a.name}
                    </span>
                    <span className="block truncate text-caption text-text-muted">
                      {cmsRoleLabel(a.role)}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </EditorFieldPanel>
      ) : null}

      {activeMode === "manual" ? (
        <EditorFieldPanel>
        <Field
          label="Podpis autora"
          htmlFor="authorByline"
          hint="Wyświetli się na stronie bez zdjęcia profilowego."
        >
          <TextInput
            id="authorByline"
            value={authorByline}
            placeholder="np. Anna Nowak, redakcja WSS"
            onChange={(e) => {
              setActiveMode("manual");
              onChangeAuthorByline(e.target.value);
              onChangeBylineUserId("");
            }}
          />
        </Field>
        </EditorFieldPanel>
      ) : null}

      {activeMode === "none" ? (
        <EditorFieldPanel>
          <p className="text-caption text-text-muted">
            Na stronie artykułu nie pojawi się blok autora.
          </p>
        </EditorFieldPanel>
      ) : null}
    </div>
  );
}
