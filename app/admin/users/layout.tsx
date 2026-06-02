import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/user";
import { canManageUsers } from "@/lib/auth/permissions";

export default async function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getAuthContext();
  if (!user || !canManageUsers(user.role)) {
    redirect("/admin/dashboard");
  }
  return children;
}
