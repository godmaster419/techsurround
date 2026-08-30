import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/Breadcrumb";
import EmptyState from "@/components/ui/EmptyState";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Trending Apps — TechSurround",
  description: "Discover trending and emerging mobile and desktop apps, utility tools, and productivity software.",
  alternates: { canonical: "/trending-apps" },
};

export default async function TrendingAppsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category, page: pageParam } = await searchParams;
  const page = parseInt(pageParam || "1");
  const limit = 16;

  const where: Record<string, unknown> = {};
  if (category) where.category = category;

  const [apps, total, categories] = await Promise.all([
    db.trendingApp.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.trendingApp.count({ where: where as any }),
    db.trendingApp.groupBy({ by: ["category"], orderBy: { category: "asc" } }),
  ]);

  const catList = categories.map((c) => c.category).filter(Boolean) as string[];

  return (
    <section className="py-8 md:py-12">
      <Container>
        <Breadcrumb items={[{ name: "Home", href: "/" }, { name: "Trending Apps" }]} />

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Trending Apps
          </h1>
          <p className="mt-2 text-muted max-w-2xl">
            Discover popular and emerging applications across Android, iOS, Web, and Desktop ecosystems.
          </p>
        </div>

        {/* Category filters */}
        {catList.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              href="/trending-apps"
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                !category
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card-bg border-border text-muted hover:text-foreground hover:border-foreground"
              }`}
            >
              All
            </Link>
            {catList.map((cat) => (
              <Link
                key={cat}
                href={`/trending-apps?category=${encodeURIComponent(cat)}`}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                  category === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card-bg border-border text-muted hover:text-foreground hover:border-foreground"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        )}

        {apps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {apps.map((app) => (
              <Link
                key={app.id}
                href={`/trending-apps/${app.slug}`}
                className="group bg-card-bg border border-card-border rounded-[var(--radius-lg)] p-5 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-[var(--radius-lg)] bg-surface flex items-center justify-center mb-4 overflow-hidden border border-border-light">
                    {app.icon ? (
                      <img src={app.icon} alt={app.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <span className="text-2xl">📱</span>
                    )}
                  </div>
                  <h2 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {app.name}
                  </h2>
                  {app.developer && (
                    <p className="text-xs text-muted-foreground mt-0.5">{app.developer}</p>
                  )}
                  {app.category && (
                    <span className="inline-block mt-2 px-2 py-0.5 text-[11px] font-medium rounded bg-surface border border-border-light text-muted">
                      {app.category}
                    </span>
                  )}
                  {app.shortDescription && (
                    <p className="mt-3 text-sm text-muted line-clamp-2">{app.shortDescription}</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-border-light flex items-center justify-between text-xs text-primary font-medium">
                  <span>{app.platform || "Multi-platform"}</span>
                  <span>View Details →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No trending apps found"
            message={category ? `No apps found in "${category}". Try another category.` : "Check back soon for the latest trending apps."}
          />
        )}
      </Container>
    </section>
  );
}
