"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { UserRole } from "@/lib/auth/permissions";

export interface AdminAuthValue {
  email: string;
  role: UserRole | null;
}

const AdminAuthContext = createContext<AdminAuthValue>({
  email: "",
  role: null,
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
