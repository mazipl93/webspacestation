import "server-only";

import { prisma } from "@/lib/prisma";
import type { CategoryRecord } from "@/lib/server/articles";
import type {
  CategoryCreateInput,
  CategoryUpdateInput,
} from "@/lib/server/validation";

const categorySelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  colorTheme: true,
  orderIndex: true,
} as const;

export function getCategoryById(id: string): Promise<CategoryRecord | null> {
  return prisma.category.findUnique({ where: { id }, select: categorySelect });
}

export function createCategory(
  input: CategoryCreateInput
): Promise<CategoryRecord> {
  return prisma.category.create({ data: input, select: categorySelect });
}

export async function updateCategory(
  id: string,
  input: CategoryUpdateInput
): Promise<CategoryRecord | null> {
  const existing = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return null;
  return prisma.category.update({
    where: { id },
    data: input,
    select: categorySelect,
  });
}
