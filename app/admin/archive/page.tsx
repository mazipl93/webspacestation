import { redirect } from "next/navigation";

/** Archiwum jest zakładką w /admin/articles — stary URL przekierowuje. */
export default function ArchiveRedirectPage() {
  redirect("/admin/articles");
}
