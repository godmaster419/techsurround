import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import NewsCard from "@/components/NewsCard";
import Breadcrumb from "@/components/Breadcrumb";
import Pagination from "@/components/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import { db } from "@/lib/db";
import { getCategoryBySlug, CATEGORIES } from "@/lib/config";

const VALID_SLUGS = CATEGORIES.filter((c) => !["new-mobile-arrivals", "trending-apps", "tools"].includes(c.slug)).map((c) => c.slug);

export async function generateMetadata(
  { params }: { params: Promise<{ category: string }> }
): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) return {};

  return {
    title: cat.name,
    description: cat.description,
    alternates: { canonical: `/${cat.slug}` },
    openGraph: {
      title: `${cat.name} | TechSurround`,
      description: cat.description,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { category } = await params;
  const { page: pageParam } = await searchParams;

  // Check if this is a valid article category
  if (!VALID_SLUGS.includes(category)) {
    notFound();
  }

  const catInfo = getCategoryBySlug(category);
  if (!catInfo) notFound();

  const page = parseInt(pageParam || "1");
  const limit = 12;

  const dbCategory = await db.category.findUnique({
    where: { slug: category },
  });

  if (!dbCategory) notFound();

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where: { status: "published", categoryId: dbCategory.id },
      include: {
        category: { select: { name: true, slug: true } },
        author: { select: { name: true, slug: true } },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.post.count({
      where: { status: "published", categoryId: dbCategory.id },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <section className="py-8 md:py-12">
      <Container>
        <Breadcrumb
          items={[
            { name: "Home", href: "/" },
            { name: catInfo.name },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {catInfo.name}
          </h1>
          {catInfo.description && (
            <p className="mt-2 text-muted max-w-2xl">{catInfo.description}</p>
          )}
        </div>

        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <NewsCard
                  key={post.id}
                  title={post.title}
                  excerpt={post.excerpt || ""}
                  slug={post.slug}
                  categoryName={post.category?.name || catInfo.name}
                  categorySlug={post.category?.slug || catInfo.slug}
                  image={post.featuredImage}
                  date={post.publishedAt?.toISOString() || post.createdAt.toISOString()}
                  readingTime={post.readingTime}
                  author={post.author?.name}
                />
              ))}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath={`/${category}`}
              className="mt-10"
            />
          </>
        ) : (
          <EmptyState
            title="No articles yet"
            message={`No articles published in ${catInfo.name} yet. Check back soon!`}
          />
        )}
      </Container>
    </section>
  );
}
