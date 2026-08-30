import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/Breadcrumb";
import NewsCard from "@/components/NewsCard";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/Pagination";
import { db } from "@/lib/db";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const tag = await db.tag.findUnique({ where: { slug } });
  if (!tag) return {};
  return {
    title: `${tag.name} Articles`,
    description: tag.description || `Articles tagged with ${tag.name} on TechSurround.`,
    alternates: { canonical: `/tag/${slug}` },
  };
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || "1");
  const limit = 12;

  const tag = await db.tag.findUnique({ where: { slug } });
  if (!tag) notFound();

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where: { status: "published", tags: { some: { tagId: tag.id } } },
      include: { category: true, author: true },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.post.count({
      where: { status: "published", tags: { some: { tagId: tag.id } } },
    }),
  ]);

  return (
    <section className="py-8 md:py-12">
      <Container>
        <Breadcrumb items={[{ name: "Home", href: "/" }, { name: tag.name }]} />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-2">
          {tag.name}
        </h1>
        {tag.description && <p className="text-muted mb-8">{tag.description}</p>}

        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <NewsCard
                  key={post.id}
                  title={post.title}
                  excerpt={post.excerpt || ""}
                  slug={post.slug}
                  categoryName={post.category?.name || ""}
                  categorySlug={post.category?.slug || "technology"}
                  image={post.featuredImage}
                  date={post.publishedAt?.toISOString() || post.createdAt.toISOString()}
                  readingTime={post.readingTime}
                />
              ))}
            </div>
            <Pagination currentPage={page} totalPages={Math.ceil(total / limit)} basePath={`/tag/${slug}`} className="mt-10" />
          </>
        ) : (
          <EmptyState message={`No articles tagged with "${tag.name}" yet.`} />
        )}
      </Container>
    </section>
  );
}
