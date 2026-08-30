import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/Breadcrumb";
import NewsCard from "@/components/NewsCard";
import EmptyState from "@/components/ui/EmptyState";
import { db } from "@/lib/db";
import { generatePersonSchema } from "@/lib/seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const author = await db.author.findUnique({ where: { slug } });
  if (!author) return {};
  return {
    title: `${author.name} — Author`,
    description: author.bio || `Articles by ${author.name} on TechSurround.`,
    alternates: { canonical: `/author/${slug}` },
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const author = await db.author.findUnique({ where: { slug } });
  if (!author) notFound();

  const posts = await db.post.findMany({
    where: { status: "published", authorId: author.id },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
  });

  const jsonLd = generatePersonSchema({
    name: author.name,
    image: author.image,
    bio: author.bio,
    url: `${siteUrl}/author/${slug}`,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="py-8 md:py-12">
        <Container>
          <Breadcrumb items={[{ name: "Home", href: "/" }, { name: author.name }]} />

          {/* Author profile */}
          <div className="flex items-start gap-5 mb-10">
            <div className="w-20 h-20 rounded-full bg-surface-elevated flex items-center justify-center overflow-hidden shrink-0">
              {author.image ? (
                <img src={author.image} alt={author.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary">{author.name[0]}</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">{author.name}</h1>
              {author.bio && <p className="mt-2 text-muted max-w-xl">{author.bio}</p>}
              <div className="mt-3 flex items-center gap-3">
                {author.twitter && (
                  <a href={author.twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">X / Twitter</a>
                )}
                {author.linkedin && (
                  <a href={author.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">LinkedIn</a>
                )}
                {author.website && (
                  <a href={author.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Website</a>
                )}
              </div>
            </div>
          </div>

          {/* Posts */}
          <h2 className="text-lg font-bold text-foreground mb-4">
            Published Articles ({posts.length})
          </h2>
          {posts.length > 0 ? (
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
          ) : (
            <EmptyState message={`${author.name} hasn't published any articles yet.`} />
          )}
        </Container>
      </section>
    </>
  );
}
