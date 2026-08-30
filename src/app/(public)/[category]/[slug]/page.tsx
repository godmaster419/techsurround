import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import Badge from "@/components/ui/Badge";
import Breadcrumb from "@/components/Breadcrumb";
import SocialShare from "@/components/SocialShare";
import NewsCard from "@/components/NewsCard";
import ArticlePdfDownload from "@/components/ArticlePdfDownload";
import { db } from "@/lib/db";
import { generateArticleSchema } from "@/lib/seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

export async function generateMetadata(
  { params }: { params: Promise<{ category: string; slug: string }> }
): Promise<Metadata> {
  const { category, slug } = await params;
  const post = await db.post.findUnique({
    where: { slug },
    include: { category: true, author: true },
  });
  if (!post) return {};

  const url = `${siteUrl}/${category}/${slug}`;
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || "",
    alternates: { canonical: post.canonicalUrl || url },
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || "",
      type: "article",
      url,
      images: post.ogImage || post.featuredImage ? [{ url: post.ogImage || post.featuredImage! }] : [],
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: post.author?.name ? [post.author.name] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || "",
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;

  const post = await db.post.findUnique({
    where: { slug },
    include: {
      category: true,
      author: true,
      tags: { include: { tag: true } },
    },
  });

  if (!post || post.status !== "published") notFound();

  const articleUrl = `${siteUrl}/${category}/${slug}`;

  // Get related articles
  const relatedPosts = await db.post.findMany({
    where: {
      status: "published",
      categoryId: post.categoryId,
      NOT: { id: post.id },
    },
    include: { category: true, author: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  // Generate table of contents from content
  const toc: { id: string; text: string; level: number }[] = [];
  if (post.content) {
    const headingRegex = /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi;
    let match;
    while ((match = headingRegex.exec(post.content)) !== null) {
      const text = match[2].replace(/<[^>]*>/g, "");
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      toc.push({ id, text, level: parseInt(match[1]) });
    }
  }

  const jsonLd = generateArticleSchema({
    title: post.title,
    description: post.seoDescription || post.excerpt || "",
    image: post.ogImage || post.featuredImage,
    authorName: post.author?.name,
    publishedAt: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    url: articleUrl,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="py-8 md:py-12">
        <Container narrow>
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { name: "Home", href: "/" },
              { name: post.category?.name || "Article", href: `/${post.category?.slug || category}` },
              { name: post.title },
            ]}
          />

          {/* Header */}
          <header className="mb-8">
            {post.category && (
              <Link href={`/${post.category.slug}`}>
                <Badge variant="primary" className="mb-3">{post.category.name}</Badge>
              </Link>
            )}

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-3 text-lg text-muted">{post.excerpt}</p>
            )}

            {/* Meta */}
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {post.author && (
                <Link href={`/author/${post.author.slug}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                  <div className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center overflow-hidden">
                    {post.author.image ? (
                      <img src={post.author.image} alt={post.author.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-primary">{post.author.name[0]}</span>
                    )}
                  </div>
                  <span className="font-medium text-foreground">{post.author.name}</span>
                </Link>
              )}
              {post.publishedAt && (
                <time dateTime={post.publishedAt.toISOString()}>
                  {post.publishedAt.toLocaleDateString("en-US", {
                    month: "long", day: "numeric", year: "numeric",
                  })}
                </time>
              )}
              {post.updatedAt && post.publishedAt && post.updatedAt > post.publishedAt && (
                <span className="text-xs">
                  (Updated {post.updatedAt.toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })})
                </span>
              )}
              <span>{post.readingTime} min read</span>

              <div className="ml-auto">
                <ArticlePdfDownload
                  title={post.title}
                  categoryName={post.category?.name}
                  authorName={post.author?.name}
                  publishedDate={post.publishedAt?.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  readingTime={post.readingTime}
                  excerpt={post.excerpt || ""}
                  contentHtml={post.content || ""}
                  articleUrl={articleUrl}
                  slug={post.slug}
                  variant="button"
                />
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mb-8 rounded-[var(--radius-lg)] overflow-hidden">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Table of Contents */}
          {toc.length > 2 && (
            <nav className="mb-8 p-5 bg-surface border border-border rounded-[var(--radius-lg)]" aria-label="Table of contents">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Table of Contents</h2>
              <ul className="space-y-1.5">
                {toc.map((item) => (
                  <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
                    <a href={`#${item.id}`} className="text-sm text-muted hover:text-primary transition-colors">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Content */}
          {post.content && (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}

          {/* AUTOMATIC STANDARD PDF DOWNLOAD CARD */}
          <ArticlePdfDownload
            title={post.title}
            categoryName={post.category?.name}
            authorName={post.author?.name}
            publishedDate={post.publishedAt?.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            readingTime={post.readingTime}
            excerpt={post.excerpt || ""}
            contentHtml={post.content || ""}
            articleUrl={articleUrl}
            slug={post.slug}
            variant="card"
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted mr-1">Tags:</span>
              {post.tags.map(({ tag }) => (
                <Link key={tag.id} href={`/tag/${tag.slug}`}>
                  <Badge variant="secondary">{tag.name}</Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Social Share */}
          <div className="mt-6 pt-6 border-t border-border">
            <SocialShare url={articleUrl} title={post.title} />
          </div>
        </Container>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="mt-12 py-10 bg-surface">
            <Container>
              <h2 className="text-xl font-bold text-foreground mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((p) => (
                  <NewsCard
                    key={p.id}
                    title={p.title}
                    excerpt={p.excerpt || ""}
                    slug={p.slug}
                    categoryName={p.category?.name || ""}
                    categorySlug={p.category?.slug || category}
                    image={p.featuredImage}
                    date={p.publishedAt?.toISOString() || p.createdAt.toISOString()}
                    readingTime={p.readingTime}
                  />
                ))}
              </div>
            </Container>
          </section>
        )}
      </article>
    </>
  );
}
