/** Full-width preview — bez wąskiej kolumny edytora. */
export default function ArticlePreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="-mx-6 -my-8 md:-mx-10 md:-my-10">{children}</div>;
}
