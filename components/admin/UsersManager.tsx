"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { adminApi, ApiError } from "@/lib/admin/api";
import type { AdminUser, UserRole } from "@/lib/admin/types";
import PageHeader from "@/components/admin/PageHeader";
import { Banner } from "@/components/admin/primitives";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "USER", label: "Użytkownik" },
  { value: "AUTHOR", label: "Autor" },
  { value: "EDITOR", label: "Redaktor" },
  { value: "MODERATOR", label: "Moderator" },
  { value: "ADMIN", label: "Administrator" },
];

export default function UsersManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.listUsers();
      setUsers(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Nie udało się załadować użytkowników.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function changeRole(user: AdminUser, role: UserRole) {
    if (user.role === role) return;
    setBusyId(user.id);
    setError(null);
    try {
      const updated = await adminApi.updateUserRole(user.id, role);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Nie udało się zmienić roli.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader
        overline="Administracja"
        title="Użytkownicy"
        description="Zarządzaj rolami kont powiązanych z Supabase (e-mail)."
      />

      {error ? (
        <div className="mb-5">
          <Banner tone="error">{error}</Banner>
        </div>
      ) : null}

      <div className="card-surface overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-12 text-meta text-text-tertiary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Ładowanie…
          </div>
        ) : (
          <table className="w-full text-left text-meta">
            <thead>
              <tr className="border-b border-hairline text-overline text-text-muted">
                <th className="px-5 py-3 font-semibold">E-mail</th>
                <th className="px-5 py-3 font-semibold">Nazwa</th>
                <th className="px-5 py-3 font-semibold">Rola</th>
                <th className="px-5 py-3 font-semibold">Od</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-hairline-faint last:border-b-0"
                >
                  <td className="px-5 py-3 text-text-primary">{u.email}</td>
                  <td className="px-5 py-3 text-text-secondary">{u.name}</td>
                  <td className="px-5 py-3">
                    <select
                      value={u.role}
                      disabled={busyId === u.id}
                      onChange={(e) =>
                        changeRole(u, e.target.value as UserRole)
                      }
                      className="rounded-lg border border-hairline bg-black/25 px-2.5 py-1.5 text-meta text-text-primary outline-none focus:border-accent-blue/60"
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-text-muted">
                    {new Date(u.createdAt).toLocaleDateString("pl-PL")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
