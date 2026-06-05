/** Block self-delete when CMS articles reference this user as author (Prisma Restrict). */
export function getDeleteAccountBlockReason(
  authoredArticleCount: number
): string | null {
  if (authoredArticleCount > 0) {
    return "To konto jest powiązane z artykułami redakcyjnymi w CMS. Usunięcia dokonuje administrator — napisz przez Kontakt.";
  }
  return null;
}
