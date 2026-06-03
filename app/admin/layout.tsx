import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/user";
import { canAccessCms } from "@/lib/auth/permissions";
import AdminShell from "@/components/admin/AdminShell";
import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";

export const metadata: Metadata = {
  title: "Newsroom CMS | WSS",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated, email, user } = await getAuthContext();
  if (!authenticated) redirect("/login");
  if (!user || !canAccessCms(user.role)) redirect("/");

  const role = user.role;
  const displayEmail = user.email ?? email ?? "";

  return (
    <AdminAuthProvider value={{ email: displayEmail, role }}>
      <AdminShell email={displayEmail} role={role}>
        {children}
      </AdminShell>
    </AdminAuthProvider>
  );
}
