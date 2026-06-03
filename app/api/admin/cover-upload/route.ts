import { NextRequest, NextResponse } from "next/server";
import { requireCmsAccess } from "@/lib/auth/guard";
import { jsonError } from "@/lib/server/http";
import {
  COVER_MAX_INPUT_BYTES,
  isAcceptedCoverMime,
  processCoverImage,
} from "@/lib/media/process-cover-image";
import { createAdminClient } from "@/lib/supabase/admin";
import { coverUploadErrorMessage } from "@/lib/supabase/storage-errors";

export const runtime = "nodejs";

const BUCKET = "article-covers";

function safeFolderSegment(raw: string | null): string {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return "drafts";
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(trimmed)) return "drafts";
  return trimmed;
}

export async function POST(request: NextRequest) {
  const guard = await requireCmsAccess();
  if (!guard.ok) return guard.response;

  const admin = createAdminClient();
  if (!admin) {
    return jsonError(
      503,
      "STORAGE_NOT_CONFIGURED",
      "Brak SUPABASE_SERVICE_ROLE_KEY. Dodaj klucz w Vercel i lokalnie w .env."
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError(400, "INVALID_BODY", "Oczekiwano multipart/form-data.");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return jsonError(400, "MISSING_FILE", "Brak pliku w polu „file”.");
  }

  if (file.size > COVER_MAX_INPUT_BYTES) {
    return jsonError(
      413,
      "FILE_TOO_LARGE",
      "Plik jest za duży (maks. 25 MB przed kompresją)."
    );
  }

  const mime = file.type || "application/octet-stream";
  if (!isAcceptedCoverMime(mime)) {
    return jsonError(
      400,
      "INVALID_TYPE",
      "Dozwolone formaty: JPG, PNG, WEBP, GIF."
    );
  }

  const articleFolder = safeFolderSegment(formData.get("articleId") as string | null);
  const bytes = Buffer.from(await file.arrayBuffer());

  let processed;
  try {
    processed = await processCoverImage(bytes);
  } catch (err) {
    console.error("[cover-upload] sharp", err);
    return jsonError(400, "PROCESS_FAILED", "Nie udało się przetworzyć obrazu.");
  }

  const path = `${articleFolder}/${Date.now()}-${guard.user.id.slice(0, 8)}.webp`;

  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, processed.buffer, {
    upsert: false,
    cacheControl: "31536000",
    contentType: processed.contentType,
  });

  if (uploadError) {
    console.error("[cover-upload] storage", uploadError);
    return jsonError(502, "UPLOAD_FAILED", coverUploadErrorMessage(uploadError));
  }

  const {
    data: { publicUrl },
  } = admin.storage.from(BUCKET).getPublicUrl(path);

  return NextResponse.json({
    data: {
      url: publicUrl,
      path,
      width: processed.width,
      height: processed.height,
    },
  });
}
