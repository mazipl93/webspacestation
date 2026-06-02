"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Client-side "Edytuj artykuł" affordance. Keeping this off the server lets the
 * article page render statically (ISR) for anonymous visitors. It only probes
 * the server for CMS access once a Supabase session exists; the real RBAC gate
 * still lives in the /admin route + the article mutation API (Prisma role).
 */
export default function ArticleEditButton({ articleId }: { articleId: string }) {
  const { user, loading } = useAuth();
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setCanEdit(false);
      return;
    }

    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/cms-check", {
          method: "GET",
          cache: "no-store",
        });
        if (active) setCanEdit(res.status === 204);
      } catch {
        if (active) setCanEdit(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user, loading]);

  if (!canEdit) return null;

  return (
    <Link
      href={`/admin/articles/${articleId}/edit`}
      className="ml-auto inline-flex items-center gap-2 rounded-xl border border-accent-blue/40 bg-accent-blue/10 px-4 py-2.5 text-[12.5px] font-semibold text-accent-cyan transition-all duration-300 hover:border-accent-blue/60 hover:bg-accent-blue/15 active:scale-[0.97]"
    >
      <Pencil size={14} />
      Edytuj artykuł
    </Link>
  );
}
