import { UploadCloud } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";

export default function MediaPage() {
  return (
    <div>
      <PageHeader
        overline="Zasoby"
        title="Media"
        description="Biblioteka multimediów dla redakcji."
      />

      <div className="card-surface grid place-items-center px-6 py-20 text-center">
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-white/5 text-text-tertiary">
          <UploadCloud className="h-6 w-6" />
        </div>
        <h2 className="text-title-sm font-semibold text-text-primary">
          Przesyłanie plików wkrótce
        </h2>
        <p className="mt-1.5 max-w-sm text-meta text-text-tertiary">
          Moduł biblioteki mediów (upload, przeglądanie, wstawianie do artykułów)
          pojawi się w kolejnej fazie. Na razie używaj adresów URL obrazów w edytorze.
        </p>
        <div className="mt-6 w-full max-w-md rounded-[0.7rem] border border-dashed border-hairline px-6 py-10 text-caption text-text-muted">
          Przeciągnij i upuść pliki tutaj
        </div>
      </div>
    </div>
  );
}
