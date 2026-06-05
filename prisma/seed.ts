import { PrismaClient, ArticleStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import newsData from "../data/news.json";

const prisma = new PrismaClient();

// Shape of an entry in data/news.json (the legacy static content source).
type NewsJsonArticle = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  imageUrl: string;
  slug: string;
  isBreaking?: boolean;
  content?: string[];
  readTime?: number;
};

// Category colour themes mirror the frozen design-system map in
// docs/WSS_CHECKPOINT_PHASE_2.md (single source of truth for accents).
const CATEGORIES = [
  {
    slug: "misje",
    name: "Misje",
    colorTheme: "#2f6dff",
    orderIndex: 0,
    description: "Załogowe i bezzałogowe misje kosmiczne.",
  },
  {
    slug: "astronomia",
    name: "Astronomia",
    colorTheme: "#a855f7",
    orderIndex: 1,
    description: "Odkrycia, obserwacje i badania wszechświata.",
  },
  {
    slug: "popularnonaukowe",
    name: "Popularnonaukowe",
    colorTheme: "#14b8a6",
    orderIndex: 2,
    description: "Wyjaśnienia i przewodniki evergreen o kosmosie.",
  },
  {
    slug: "technologie",
    name: "Technologie kosmiczne",
    colorTheme: "#38bdf8",
    orderIndex: 3,
    description: "Rakiety, satelity, napędy i inżynieria kosmiczna.",
  },
  {
    slug: "iss",
    name: "ISS i załogi",
    colorTheme: "#ffb830",
    orderIndex: 4,
    description: "Międzynarodowa Stacja Kosmiczna.",
  },
  {
    slug: "ziemia-z-kosmosu",
    name: "Ziemia z kosmosu",
    colorTheme: "#22c55e",
    orderIndex: 5,
    description: "Obserwacja Ziemi i pogoda kosmiczna.",
  },
  {
    slug: "rozrywka",
    name: "Rozrywka",
    colorTheme: "#f472b6",
    orderIndex: 6,
    description: "Gry, filmy i kultura sci-fi w kosmosie.",
  },
] as const;

const ADMIN = {
  email: "admin@wss.space",
  name: "WSS Admin",
  // Override locally via env before seeding production-like data.
  password: process.env.SEED_ADMIN_PASSWORD ?? "wss-admin-2026",
};

// All editorial content is migrated from data/news.json so nothing is lost when
// the public site repoints from the static file to the DB. The first paragraph
// of each article doubles as its subtitle/standfirst.
const ARTICLES = (newsData as NewsJsonArticle[]).map((n) => ({
  slug: n.slug,
  title: n.title,
  subtitle: n.content?.[0]?.slice(0, 180) ?? n.excerpt,
  excerpt: n.excerpt,
  coverImage: n.imageUrl,
  categorySlug: n.category,
  readingTime: n.readTime ?? null,
  featured: Boolean(n.isBreaking),
  publishedAt: new Date(n.publishedAt),
  content: n.content ?? [n.excerpt],
}));

async function main() {
  console.log("Seeding database…");

  // 1. Categories (idempotent upsert by unique slug).
  const categoryIdBySlug = new Map<string, string>();
  for (const c of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        description: c.description,
        colorTheme: c.colorTheme,
        orderIndex: c.orderIndex,
      },
      create: {
        slug: c.slug,
        name: c.name,
        description: c.description,
        colorTheme: c.colorTheme,
        orderIndex: c.orderIndex,
      },
    });
    categoryIdBySlug.set(category.slug, category.id);
  }
  console.log(`  ✓ ${CATEGORIES.length} categories`);

  // 2. Admin user (idempotent upsert by unique email).
  const passwordHash = await bcrypt.hash(ADMIN.password, 12);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN.email },
    update: { name: ADMIN.name, role: Role.ADMIN },
    create: {
      email: ADMIN.email,
      name: ADMIN.name,
      role: Role.ADMIN,
      passwordHash,
    },
  });
  console.log(`  ✓ admin user (${admin.email})`);

  // 3. Sample articles (idempotent upsert by unique slug).
  for (const a of ARTICLES) {
    const categoryId = categoryIdBySlug.get(a.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category for slug "${a.categorySlug}"`);
    }
    await prisma.article.upsert({
      where: { slug: a.slug },
      update: {
        title: a.title,
        subtitle: a.subtitle,
        excerpt: a.excerpt,
        content: a.content.join("\n\n"),
        coverImage: a.coverImage,
        status: ArticleStatus.PUBLISHED,
        featured: a.featured,
        readingTime: a.readingTime,
        categoryId,
        authorId: admin.id,
        publishedAt: a.publishedAt,
      },
      create: {
        slug: a.slug,
        title: a.title,
        subtitle: a.subtitle,
        excerpt: a.excerpt,
        content: a.content.join("\n\n"),
        coverImage: a.coverImage,
        status: ArticleStatus.PUBLISHED,
        featured: a.featured,
        readingTime: a.readingTime,
        categoryId,
        authorId: admin.id,
        publishedAt: a.publishedAt,
      },
    });
  }
  console.log(`  ✓ ${ARTICLES.length} sample articles`);

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
