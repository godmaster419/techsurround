import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/Breadcrumb";
import NewsCard from "@/components/NewsCard";
import EmptyState from "@/components/ui/EmptyState";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Search",
  description: "Search articles, mobile arrivals, and trending apps on TechSurround.",
  robots: { index: false },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  let posts: any[] = [];
  let mobileArrivals: any[] = [];
  let trendingApps: any[] = [];

  if (query.length >= 2) {
    [posts, mobileArrivals, trendingApps] = await Promise.all([
      db.post.findMany({
        where: {
          status: "published",
          OR: [
            { title: { contains: query } },
            { excerpt: { contains: query } },
          ],
        },
        include: { category: true, author: true },
        orderBy: { publishedAt: "desc" },
        take: 20,
      }),
      db.mobileArrival.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { brand: { contains: query } },
          ],
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
      db.trendingApp.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { developer: { contains: query } },
          ],
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
    ]);
  }

  const totalResults = posts.length + mobileArrivals.length + trendingApps.length;

  return (
    <section className="py-8 md:py-12">
      <Container>
        <Breadcrumb items={[{ name: "Home", href: "/" }, { name: "Search" }]} />

        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-2">
          Search Results
        </h1>

        {query && (
          <p className="text-muted mb-8">
            {totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
        )}

        {!query && (
          <EmptyState message="Enter a search term to find articles, devices, and apps." />
        )}

        {query && totalResults === 0 && (
          <EmptyState
            title="No results found"
            message={`We couldn't find anything matching "${query}". Try a different search term.`}
          />
        )}

        {/* Articles */}
        {posts.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-foreground mb-4">Articles ({posts.length})</h2>
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
          </div>
        )}

        {/* Mobile Arrivals */}
        {mobileArrivals.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-foreground mb-4">Mobile Arrivals ({mobileArrivals.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mobileArrivals.map((d) => (
                <Link key={d.id} href={`/new-mobile-arrivals/${d.slug}`} className="p-4 bg-card-bg border border-card-border rounded-[var(--radius-lg)] hover:shadow-[var(--card-shadow-hover)] transition-all">
                  <p className="text-xs font-semibold text-primary">{d.brand}</p>
                  <p className="font-bold text-foreground">{d.name}</p>
                  {d.price && <p className="text-sm text-muted mt-1">{d.price}</p>}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Trending Apps */}
        {trendingApps.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Trending Apps ({trendingApps.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingApps.map((a) => (
                <Link key={a.id} href={`/trending-apps/${a.slug}`} className="p-4 bg-card-bg border border-card-border rounded-[var(--radius-lg)] hover:shadow-[var(--card-shadow-hover)] transition-all">
                  <p className="font-bold text-foreground">{a.name}</p>
                  {a.platform && <p className="text-xs text-muted">{a.platform}</p>}
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
