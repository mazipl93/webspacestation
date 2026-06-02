import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/user";
import { canAccessCms } from "@/lib/auth/permissions";
import AdminSidebar from "@/components/admin/AdminSidebar";
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
      <div className="flex min-h-dvh bg-space-bg">
        <AdminSidebar email={displayEmail} role={role} />
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-5xl px-6 py-8 md:px-10 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </AdminAuthProvider>
  );
}
