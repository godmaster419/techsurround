import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Badge from "@/components/ui/Badge";
import NewsCard from "@/components/NewsCard";
import EmptyState from "@/components/ui/EmptyState";
import { db } from "@/lib/db";
import { CATEGORIES, TOOLS } from "@/lib/config";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "TechSurround — Technology, Explained Simply",
  description:
    "Your trusted source for technology news, cyber security, mobile arrivals, trending apps, gadgets, AI, and technology tools. Stay informed with TechSurround.",
  alternates: { canonical: "/" },
};

async function getHomeData() {
  const [
    featuredPost,
    latestPosts,
    trendingPosts,
    mobileArrivals,
    trendingApps,
    categoryPosts,
  ] = await Promise.all([
    db.post.findFirst({
      where: { status: "published", isFeatured: true },
      include: { category: true, author: true },
      orderBy: { publishedAt: "desc" },
    }),
    db.post.findMany({
      where: { status: "published" },
      include: { category: true, author: true },
      orderBy: { publishedAt: "desc" },
      take: 6,
    }),
    db.post.findMany({
      where: { status: "published", isTrending: true },
      include: { category: true, author: true },
      orderBy: { publishedAt: "desc" },
      take: 4,
    }),
    db.mobileArrival.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    db.trendingApp.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    // Get posts for various categories
    Promise.all(
      ["cyber-security", "cyber-crime", "ai", "gadgets", "new-tech-arrivals"].map(
        (slug) =>
          db.post.findMany({
            where: { status: "published", category: { slug } },
            include: { category: true, author: true },
            orderBy: { publishedAt: "desc" },
            take: 3,
          })
      )
    ),
  ]);

  return {
    featuredPost,
    latestPosts,
    trendingPosts,
    mobileArrivals,
    trendingApps,
    cyberSecurityPosts: categoryPosts[0],
    cyberCrimePosts: categoryPosts[1],
    aiPosts: categoryPosts[2],
    gadgetPosts: categoryPosts[3],
    newTechPosts: categoryPosts[4],
  };
}

export default async function HomePage() {
  const data = await getHomeData();
  const hasContent = data.latestPosts.length > 0 || data.mobileArrivals.length > 0;

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            generateOrganizationSchema(),
            generateWebSiteSchema(),
          ]),
        }}
      />

      {/* Hero Section */}
      {data.featuredPost ? (
        <section className="bg-surface border-b border-border">
          <Container className="py-8 md:py-12">
            <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center">
              {/* Text */}
              <div>
                {data.featuredPost.category && (
                  <Link href={`/${data.featuredPost.category.slug}`}>
                    <Badge variant="primary" className="mb-3">
                      {data.featuredPost.category.name}
                    </Badge>
                  </Link>
                )}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                  {data.featuredPost.title}
                </h1>
                {data.featuredPost.excerpt && (
                  <p className="mt-3 text-muted text-base line-clamp-2">
                    {data.featuredPost.excerpt}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                  {data.featuredPost.publishedAt && (
                    <time dateTime={data.featuredPost.publishedAt.toISOString()}>
                      {data.featuredPost.publishedAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  )}
                  <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                  <span>{data.featuredPost.readingTime} min read</span>
                </div>
                <Link
                  href={`/${data.featuredPost.category?.slug || "technology"}/${data.featuredPost.slug}`}
                  className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-[var(--radius)] hover:bg-primary-hover transition-colors"
                >
                  Read Article
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              {/* Image */}
              <div className="relative aspect-[16/10] rounded-[var(--radius-lg)] overflow-hidden bg-surface-elevated">
                {data.featuredPost.featuredImage ? (
                  <img
                    src={data.featuredPost.featuredImage}
                    alt={data.featuredPost.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl font-bold text-primary/10">TS</span>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </section>
      ) : (
        <section className="bg-surface border-b border-border">
          <Container className="py-10 md:py-14 text-center">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Welcome to</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              <span className="text-primary">Tech</span>Surround
            </h1>
            <p className="mt-3 text-muted max-w-lg mx-auto">
              Technology, Explained Simply. Your trusted source for tech news, reviews, and insights.
            </p>
          </Container>
        </section>
      )}

      {/* Latest Technology News */}
      {data.latestPosts.length > 0 && (
        <section className="py-10 md:py-14">
          <Container>
            <SectionHeader title="Latest Technology News" href="/technology" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.latestPosts.map((post) => (
                <NewsCard
                  key={post.id}
                  title={post.title}
                  excerpt={post.excerpt || ""}
                  slug={post.slug}
                  categoryName={post.category?.name || "Technology"}
                  categorySlug={post.category?.slug || "technology"}
                  image={post.featuredImage}
                  date={post.publishedAt?.toISOString() || post.createdAt.toISOString()}
                  readingTime={post.readingTime}
                  author={post.author?.name}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Trending News */}
      {data.trendingPosts.length > 0 && (
        <section className="py-10 md:py-14 bg-surface">
          <Container>
            <SectionHeader title="Trending News" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.trendingPosts.map((post) => (
                <NewsCard
                  key={post.id}
                  title={post.title}
                  excerpt={post.excerpt || ""}
                  slug={post.slug}
                  categoryName={post.category?.name || "Technology"}
                  categorySlug={post.category?.slug || "technology"}
                  image={post.featuredImage}
                  date={post.publishedAt?.toISOString() || post.createdAt.toISOString()}
                  readingTime={post.readingTime}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* New Mobile Arrivals */}
      <section className="py-10 md:py-14">
        <Container>
          <SectionHeader
            title="New Mobile Arrivals"
            description="Latest smartphones and mobile device launches"
            href="/new-mobile-arrivals"
          />
          {data.mobileArrivals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.mobileArrivals.map((device) => (
                <Link
                  key={device.id}
                  href={`/new-mobile-arrivals/${device.slug}`}
                  className="group bg-card-bg border border-card-border rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all"
                >
                  <div className="aspect-square bg-surface flex items-center justify-center p-4">
                    {device.primaryImage ? (
                      <img src={device.primaryImage} alt={device.name} className="max-h-full object-contain" loading="lazy" />
                    ) : (
                      <svg className="w-16 h-16 text-muted-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">{device.brand}</p>
                    <h3 className="mt-1 font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {device.name}
                    </h3>
                    {device.shortDescription && (
                      <p className="mt-1 text-xs text-muted line-clamp-2">{device.shortDescription}</p>
                    )}
                    {device.price && (
                      <p className="mt-2 text-sm font-semibold text-foreground">{device.currency || "$"}{device.price}</p>
                    )}
                    <span className="mt-2 inline-block text-xs font-medium text-primary">View Details →</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState message="No mobile arrivals published yet. Check back soon for the latest smartphones and devices." />
          )}
        </Container>
      </section>

      {/* Category sections */}
      {[
        { posts: data.cyberSecurityPosts, title: "Cyber Security", slug: "cyber-security" },
        { posts: data.cyberCrimePosts, title: "Cyber Crime", slug: "cyber-crime" },
        { posts: data.aiPosts, title: "Artificial Intelligence", slug: "ai" },
        { posts: data.gadgetPosts, title: "Gadgets", slug: "gadgets" },
        { posts: data.newTechPosts, title: "New Tech Arrivals", slug: "new-tech-arrivals" },
      ]
        .filter((section) => section.posts.length > 0)
        .map((section, i) => (
          <section key={section.slug} className={`py-10 md:py-14 ${i % 2 === 0 ? "bg-surface" : ""}`}>
            <Container>
              <SectionHeader title={section.title} href={`/${section.slug}`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.posts.map((post) => (
                  <NewsCard
                    key={post.id}
                    title={post.title}
                    excerpt={post.excerpt || ""}
                    slug={post.slug}
                    categoryName={post.category?.name || section.title}
                    categorySlug={post.category?.slug || section.slug}
                    image={post.featuredImage}
                    date={post.publishedAt?.toISOString() || post.createdAt.toISOString()}
                    readingTime={post.readingTime}
                  />
                ))}
              </div>
            </Container>
          </section>
        ))}

      {/* Trending Apps */}
      <section className="py-10 md:py-14">
        <Container>
          <SectionHeader
            title="Trending Apps"
            description="Popular apps and emerging digital tools"
            href="/trending-apps"
          />
          {data.trendingApps.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.trendingApps.map((app) => (
                <Link
                  key={app.id}
                  href={`/trending-apps/${app.slug}`}
                  className="group bg-card-bg border border-card-border rounded-[var(--radius-lg)] p-5 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all"
                >
                  <div className="w-14 h-14 rounded-[var(--radius-lg)] bg-surface flex items-center justify-center mb-3 overflow-hidden">
                    {app.icon ? (
                      <img src={app.icon} alt={app.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <span className="text-2xl">📱</span>
                    )}
                  </div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {app.name}
                  </h3>
                  {app.category && (
                    <p className="text-xs text-muted mt-0.5">{app.category}</p>
                  )}
                  {app.platform && (
                    <p className="text-xs text-muted-foreground mt-0.5">{app.platform}</p>
                  )}
                  {app.shortDescription && (
                    <p className="mt-2 text-sm text-muted line-clamp-2">{app.shortDescription}</p>
                  )}
                  <span className="mt-3 inline-block text-xs font-medium text-primary">View Details →</span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState message="No trending apps published yet. Check back soon for the latest apps and tools." />
          )}
        </Container>
      </section>

      {/* Tools */}
      <section className="py-10 md:py-14 bg-surface">
        <Container>
          <SectionHeader
            title="Technology Tools"
            description="Free browser-based utilities for everyday tasks"
            href="/tools"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOOLS.map((tool) => (
              <Link
                key={tool.slug}
                href={tool.href}
                className="group bg-card-bg border border-card-border rounded-[var(--radius-lg)] p-5 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all"
              >
                <span className="text-3xl">{tool.icon}</span>
                <h3 className="mt-3 font-bold text-foreground group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                <p className="mt-1 text-sm text-muted line-clamp-2">{tool.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Use Tool
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Empty state if no content at all */}
      {!hasContent && (
        <section className="py-16">
          <Container>
            <EmptyState
              title="Coming Soon"
              message="TechSurround is getting ready. Content will be published soon. Stay tuned!"
            />
          </Container>
        </section>
      )}
    </>
  );
}
