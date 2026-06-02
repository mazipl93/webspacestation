"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { adminApi, ApiError } from "@/lib/admin/api";
import type { AdminCategory, CategoryFormValues } from "@/lib/admin/types";
import { slugify } from "@/lib/admin/slugify";
import { cn } from "@/lib/cn";
import {
  Banner,
  Button,
  Card,
  Field,
  TextArea,
  TextInput,
} from "@/components/admin/primitives";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { canManageCategories } from "@/lib/auth/permissions";

const EMPTY: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  colorTheme: "#2f6dff",
  orderIndex: 0,
};

type Mode = { kind: "create" } | { kind: "edit"; id: string } | { kind: "idle" };

export default function CategoryManager() {
  const { role } = useAdminAuth();
  const mayManage = canManageCategories(role);

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>({ kind: "idle" });
  const [form, setForm] = useState<CategoryFormValues>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slugTouched = useRef(false);

  const load = async () => {
    setLoading(true);
    try {
      setCategories(await adminApi.listCategories());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Nie udało się załadować kategorii.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startCreate = () => {
    slugTouched.current = false;
    setForm({ ...EMPTY, orderIndex: categories.length });
    setMode({ kind: "create" });
    setError(null);
  };

  const startEdit = (c: AdminCategory) => {
    if (!mayManage) return;
    slugTouched.current = true;
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      colorTheme: c.colorTheme ?? "#2f6dff",
      orderIndex: c.orderIndex,
    });
    setMode({ kind: "edit", id: c.id });
    setError(null);
  };

  const update = <K extends keyof CategoryFormValues>(
    key: K,
    value: CategoryFormValues[K]
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !slugTouched.current) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  };

  const save = async () => {
    if (mode.kind === "idle") return;
    if (!form.name.trim()) {
      setError("Nazwa jest wymagana.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description || null,
        colorTheme: form.colorTheme || null,
        orderIndex: form.orderIndex,
      };
      if (mode.kind === "create") {
        await adminApi.createCategory(payload);
      } else {
        await adminApi.updateCategory(mode.id, payload);
      }
      await load();
      setMode({ kind: "idle" });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Zapis nie powiódł się.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      {/* ── List ── */}
      <div>
        {loading ? (
          <div className="card-surface grid place-items-center px-6 py-16 text-meta text-text-tertiary">
            <Loader2 className="mb-2 h-5 w-5 animate-spin" />
            Ładowanie…
          </div>
        ) : categories.length === 0 ? (
          <div className="card-surface px-6 py-12 text-center text-meta text-text-tertiary">
            Brak kategorii.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {categories.map((c) => {
              const active = mode.kind === "edit" && mode.id === c.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    disabled={!mayManage}
                    className={cn(
                      "card-surface flex w-full items-center gap-3 px-4 py-3 text-left",
                      mayManage && "surface-interactive",
                      !mayManage && "cursor-default",
                      active && "border-hairline-strong"
                    )}
                  >
                    <span
                      className="h-8 w-8 shrink-0 rounded-[0.5rem] border border-hairline"
                      style={{ backgroundColor: c.colorTheme ?? "#232a3a" }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-meta font-medium text-text-primary">
                        {c.name}
                      </span>
                      <span className="block truncate text-caption text-text-tertiary">
                        /{c.slug}
                      </span>
                    </span>
                    <span className="text-caption tabular-nums text-text-muted">
                      #{c.orderIndex}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Form panel ── */}
      <div>
        {!mayManage ? (
          <Card className="flex flex-col gap-2">
            <h2 className="text-title-sm font-semibold">Tylko do odczytu</h2>
            <p className="text-meta text-text-secondary">
              Zarządzanie kategoriami jest dostępne wyłącznie dla administratora.
            </p>
          </Card>
        ) : mode.kind === "idle" ? (
          <Card className="flex flex-col items-start gap-3">
            <p className="text-meta text-text-secondary">
              Wybierz kategorię z listy, aby ją edytować, lub utwórz nową.
            </p>
            <Button onClick={startCreate}>
              <Plus className="h-4 w-4" />
              Nowa kategoria
            </Button>
          </Card>
        ) : (
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-title-sm font-semibold">
                {mode.kind === "create" ? "Nowa kategoria" : "Edycja kategorii"}
              </h2>
              <button
                type="button"
                onClick={() => setMode({ kind: "idle" })}
                className="text-caption text-text-tertiary hover:text-text-primary"
              >
                Anuluj
              </button>
            </div>

            {error ? <Banner tone="error">{error}</Banner> : null}

            <Field label="Nazwa" htmlFor="cat-name">
              <TextInput
                id="cat-name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </Field>
            <Field label="Slug" htmlFor="cat-slug">
              <TextInput
                id="cat-slug"
                value={form.slug}
                onChange={(e) => {
                  slugTouched.current = true;
                  update("slug", slugify(e.target.value));
                }}
              />
            </Field>
            <Field label="Kolor (theme)" htmlFor="cat-color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.colorTheme || "#2f6dff"}
                  onChange={(e) => update("colorTheme", e.target.value)}
                  className="h-9 w-10 cursor-pointer rounded-[0.5rem] border border-hairline bg-space-surface"
                  aria-label="Wybór koloru"
                />
                <TextInput
                  id="cat-color"
                  value={form.colorTheme}
                  onChange={(e) => update("colorTheme", e.target.value)}
                  className="flex-1"
                />
              </div>
            </Field>
            <Field label="Kolejność" htmlFor="cat-order">
              <TextInput
                id="cat-order"
                type="number"
                value={form.orderIndex}
                onChange={(e) => update("orderIndex", Number(e.target.value) || 0)}
              />
            </Field>
            <Field label="Opis" htmlFor="cat-desc">
              <TextArea
                id="cat-desc"
                rows={3}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </Field>

            <Button onClick={save} disabled={saving}>
              {saving ? "Zapisywanie…" : "Zapisz kategorię"}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
