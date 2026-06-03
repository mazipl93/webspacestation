import { revalidatePath, revalidateTag } from "next/cache";
import { ARTICLES_TAG } from "@/lib/cache/tags";

const PUBLIC_LIST_PATHS = ["/", "/aktualnosci"] as const;

/** Invalidate cached article data and homepage / feed HTML after publish. */
export function revalidatePublicArticleCaches(): void {
  revalidateTag(ARTICLES_TAG);
  for (const path of PUBLIC_LIST_PATHS) {
    revalidatePath(path, "layout");
  }
}
