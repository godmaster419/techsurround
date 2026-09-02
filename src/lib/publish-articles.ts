import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export async function seedAllArticles() {
  const seedPath = path.join(process.cwd(), "prisma", "articles-seed.json");
  if (!fs.existsSync(seedPath)) {
    console.warn("⚠️ articles-seed.json not found.");
    return;
  }

  const rawData = fs.readFileSync(seedPath, "utf-8");
  const posts = JSON.parse(rawData);

  console.log(`🚀 Seeding ${posts.length} articles from articles-seed.json...`);

  const author = await prisma.author.upsert({
    where: { slug: "techsurround" },
    update: {},
    create: {
      name: "TechSurround",
      slug: "techsurround",
      bio: "Official TechSurround editorial team — delivering verified tech journalism, in-depth hardware analyses, and cyber security research.",
    },
  });

  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

  let count = 0;
  for (const postData of posts) {
    const categoryId = categoryMap.get(postData.categorySlug);
    if (!categoryId) {
      console.warn(`Category ${postData.categorySlug} not found, skipping.`);
      continue;
    }

    const post = await prisma.post.upsert({
      where: { slug: postData.slug },
      update: {
        title: postData.title,
        excerpt: postData.excerpt,
        content: postData.content,
        featuredImage: postData.featuredImage,
        authorId: author.id,
        categoryId: categoryId,
        status: postData.status || "published",
        publishedAt: postData.publishedAt ? new Date(postData.publishedAt) : new Date(),
        readingTime: postData.readingTime || 6,
        isFeatured: Boolean(postData.isFeatured),
        isTrending: Boolean(postData.isTrending),
        seoTitle: postData.seoTitle,
        seoDescription: postData.seoDescription,
        focusKeyword: postData.focusKeyword,
      },
      create: {
        id: postData.id,
        title: postData.title,
        slug: postData.slug,
        excerpt: postData.excerpt,
        content: postData.content,
        featuredImage: postData.featuredImage,
        authorId: author.id,
        categoryId: categoryId,
        status: postData.status || "published",
        publishedAt: postData.publishedAt ? new Date(postData.publishedAt) : new Date(),
        readingTime: postData.readingTime || 6,
        isFeatured: Boolean(postData.isFeatured),
        isTrending: Boolean(postData.isTrending),
        seoTitle: postData.seoTitle,
        seoDescription: postData.seoDescription,
        focusKeyword: postData.focusKeyword,
      },
    });

    if (Array.isArray(postData.tags)) {
      for (const t of postData.tags) {
        const tag = await prisma.tag.upsert({
          where: { slug: t.slug },
          update: { name: t.name },
          create: { name: t.name, slug: t.slug },
        });

        await prisma.postTag.upsert({
          where: {
            postId_tagId: {
              postId: post.id,
              tagId: tag.id,
            },
          },
          update: {},
          create: {
            postId: post.id,
            tagId: tag.id,
          },
        });
      }
    }

    count++;
  }

  console.log(`✅ Successfully verified & seeded ${count} posts.`);
  return count;
}

if (require.main === module) {
  seedAllArticles()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
