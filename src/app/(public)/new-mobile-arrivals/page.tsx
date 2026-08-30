import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/Breadcrumb";
import EmptyState from "@/components/ui/EmptyState";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "New Mobile Arrivals",
  description: "Latest smartphones and mobile device launches — specifications, pricing, and availability.",
  alternates: { canonical: "/new-mobile-arrivals" },
};

export default async function MobileArrivalsPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; page?: string }>;
}) {
  const { brand, page: pageParam } = await searchParams;
  const page = parseInt(pageParam || "1");
  const limit = 12;

  const where: Record<string, unknown> = {};
  if (brand) where.brand = brand;

  const [arrivals, total, brands] = await Promise.all([
    db.mobileArrival.findMany({
      where: where as any,
      include: { images: { take: 1, orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.mobileArrival.count({ where: where as any }),
    db.mobileArrival.groupBy({ by: ["brand"], orderBy: { brand: "asc" } }),
  ]);

  const brandList = brands.map((b) => b.brand);

  return (
    <section className="py-8 md:py-12">
      <Container>
        <Breadcrumb items={[{ name: "Home", href: "/" }, { name: "New Mobile Arrivals" }]} />

        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-2">
          New Mobile Arrivals
        </h1>
        <p className="text-muted mb-6">Latest smartphones and mobile device launches</p>

        {/* Brand filters */}
        {brandList.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Link
              href="/new-mobile-arrivals"
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                !brand ? "bg-primary text-primary-foreground border-primary" : "bg-card-bg border-border text-muted hover:text-foreground hover:border-foreground"
              }`}
            >
              All
            </Link>
            {brandList.map((b) => (
              <Link
                key={b}
                href={`/new-mobile-arrivals?brand=${encodeURIComponent(b)}`}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  brand === b ? "bg-primary text-primary-foreground border-primary" : "bg-card-bg border-border text-muted hover:text-foreground hover:border-foreground"
                }`}
              >
                {b}
              </Link>
            ))}
          </div>
        )}

        {arrivals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {arrivals.map((device) => (
              <Link
                key={device.id}
                href={`/new-mobile-arrivals/${device.slug}`}
                className="group bg-card-bg border border-card-border rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all"
              >
                <div className="aspect-square bg-surface flex items-center justify-center p-6">
                  {device.primaryImage ? (
                    <img src={device.primaryImage} alt={device.name} className="max-h-full object-contain group-hover:scale-[1.03] transition-transform" loading="lazy" />
                  ) : (
                    <svg className="w-16 h-16 text-muted-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">{device.brand}</p>
                  <h2 className="mt-1 font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{device.name}</h2>
                  {device.shortDescription && <p className="mt-1 text-xs text-muted line-clamp-2">{device.shortDescription}</p>}
                  {device.price && <p className="mt-2 text-sm font-semibold text-foreground">{device.currency || "$"}{device.price}</p>}
                  <span className="mt-2 inline-block text-xs font-medium text-primary">View Specs →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No mobile arrivals yet"
            message={brand ? `No devices found for "${brand}". Try a different filter.` : "Check back soon for the latest smartphone launches."}
          />
        )}
      </Container>
    </section>
  );
}
