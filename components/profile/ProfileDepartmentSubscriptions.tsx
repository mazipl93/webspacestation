"use client";

import { Bell } from "lucide-react";
import { cn } from "@/lib/cn";
import { CATEGORY_INFO } from "@/lib/categories";
import { SUBSCRIBABLE_DEPARTMENT_SLUGS } from "@/lib/departments/subscriptions";
import { useDepartmentSubscriptions } from "@/hooks/useDepartmentSubscriptions";
import ProfileSectionHeading from "@/components/profile/ProfileSectionHeading";

export default function ProfileDepartmentSubscriptions() {
  const { slugs, loading, toggling, error, isSubscribed, toggle, isLoggedIn } =
    useDepartmentSubscriptions();

  if (!isLoggedIn) return null;

  return (
    <section className="mt-10">
      <ProfileSectionHeading
        icon={Bell}
        title="Ulubione działy"
        count={slugs.length}
        accentClassName="text-accent-cyan"
      />
      <p className="mb-4 max-w-[560px] text-[13px] leading-relaxed text-text-muted">
        Wybierz działy, z których chcesz dostawać powiadomienia o nowych artykułach.
        Starty rakiet nadal pojawiają się w dzwonku dla każdego zalogowanego konta.
      </p>
      {error ? (
        <p className="mb-3 text-[13px] text-accent-live">{error}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {SUBSCRIBABLE_DEPARTMENT_SLUGS.map((slug) => {
          const meta = CATEGORY_INFO[slug];
          const active = isSubscribed(slug);
          const busy = loading || toggling === slug;
          return (
            <button
              key={slug}
              type="button"
              disabled={busy}
              onClick={() => void toggle(slug)}
              className={cn(
                "inline-flex min-h-[40px] items-center gap-2 rounded-full border px-3.5 py-2 text-[12.5px] font-semibold transition-all",
                active
                  ? "text-text-primary"
                  : "border-hairline text-text-secondary hover:border-hairline-strong hover:text-text-primary"
              )}
              style={
                active
                  ? {
                      borderColor: `${meta.color}66`,
                      background: `${meta.color}18`,
                    }
                  : { background: "var(--glass-fill)" }
              }
              aria-pressed={active}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: meta.color }}
              />
              {meta.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
