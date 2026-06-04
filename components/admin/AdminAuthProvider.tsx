"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { UserRole } from "@/lib/auth/permissions";

export interface AdminAuthValue {
  email: string;
  role: UserRole | null;
  userId: string | null;
  userName: string | null;
  avatarUrl: string | null;
}

const AdminAuthContext = createContext<AdminAuthValue>({
  email: "",
  role: null,
  userId: null,
  userName: null,
  avatarUrl: null,
});

export function AdminAuthProvider({
  value,
  children,
}: {
  value: AdminAuthValue;
  children: ReactNode;
}) {
  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthValue {
  return useContext(AdminAuthContext);
}
