/** Map Supabase Storage / Auth errors to Polish messages for profile uploads. */
export function avatarUploadErrorMessage(err: { message?: string } | null): string {
  if (!err?.message) return "Nie udało się przesłać zdjęcia. Spróbuj ponownie.";

  const msg = err.message.toLowerCase();

  if (msg.includes("bucket not found") || msg.includes("bucket does not exist")) {
    return "Brak bucketa „avatars” w Supabase. W SQL Editor uruchom plik supabase/avatars.sql.";
  }
  if (msg.includes("row-level security") || msg.includes("policy")) {
    return "Brak uprawnień do zapisu. W Supabase → SQL Editor uruchom supabase/avatars.sql.";
  }
  if (msg.includes("entity too large") || msg.includes("too large")) {
    return "Plik jest za duży (maks. 3 MB).";
  }
  if (msg.includes("mime") || msg.includes("content type")) {
    return "Niedozwolony format pliku. Użyj PNG, JPG, WEBP lub GIF.";
  }

  return err.message;
}

/** Map Supabase Storage errors for CMS article cover uploads. */
export function coverUploadErrorMessage(err: { message?: string } | null): string {
  if (!err?.message) return "Nie udało się zapisać okładki. Spróbuj ponownie.";

  const msg = err.message.toLowerCase();

  if (msg.includes("bucket not found") || msg.includes("bucket does not exist")) {
    return "Brak bucketa „article-covers” w Supabase. Uruchom supabase/article-covers.sql.";
  }
  if (msg.includes("entity too large") || msg.includes("too large")) {
    return "Skompresowany plik jest za duży (maks. 5 MB w bucket).";
  }
  if (msg.includes("mime") || msg.includes("content type")) {
    return "Bucket przyjmuje tylko WebP po przetworzeniu — sprawdź article-covers.sql.";
  }

  return err.message;
}
