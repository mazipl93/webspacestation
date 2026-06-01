import PageHeader from "@/components/admin/PageHeader";
import CategoryManager from "@/components/admin/CategoryManager";

export default function CategoriesPage() {
  return (
    <div>
      <PageHeader
        overline="Struktura"
        title="Kategorie"
        description="Zarządzaj sekcjami portalu i ich kolorami."
      />
      <CategoryManager />
    </div>
  );
}
