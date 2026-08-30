import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/Breadcrumb";
import SocialShare from "@/components/SocialShare";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { db } from "@/lib/db";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const app = await db.trendingApp.findUnique({ where: { slug } });
  if (!app) return {};

  return {
    title: app.seoTitle || `${app.name} — Review & Download | TechSurround`,
    description: app.seoDescription || app.shortDescription || `Download and explore features of ${app.name}.`,
    alternates: { canonical: `/trending-apps/${slug}` },
    openGraph: {
      title: app.name,
      description: app.shortDescription || undefined,
      images: app.ogImage || app.icon ? [{ url: (app.ogImage || app.icon)! }] : [],
    },
  };
}

export default async function TrendingAppDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = await db.trendingApp.findUnique({ where: { slug } });

  if (!app) notFound();

  const pageUrl = `${siteUrl}/trending-apps/${slug}`;

  return (
    <section className="py-8 md:py-12">
      <Container narrow>
        <Breadcrumb
          items={[
            { name: "Home", href: "/" },
            { name: "Trending Apps", href: "/trending-apps" },
            { name: app.name },
          ]}
        />

        <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 sm:p-8 shadow-[var(--card-shadow)] mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[var(--radius-xl)] bg-surface flex items-center justify-center shrink-0 overflow-hidden border border-border">
              {app.icon ? (
                <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">📱</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {app.category && <Badge variant="primary">{app.category}</Badge>}
                {app.platform && <Badge variant="secondary">{app.platform}</Badge>}
                {app.isTrending && <Badge variant="warning">Trending</Badge>}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {app.name}
              </h1>

              {app.developer && (
                <p className="text-sm text-muted-foreground mt-1">
                  Developer: <span className="font-medium text-foreground">{app.developer}</span>
                </p>
              )}
            </div>
          </div>

          {/* Action download buttons */}
          <div className="mt-6 pt-6 border-t border-border-light flex flex-wrap items-center gap-3">
            {app.androidUrl && (
              <a href={app.androidUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="md">
                  Google Play Store ↗
                </Button>
              </a>
            )}
            {app.iosUrl && (
              <a href={app.iosUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="md">
                  Apple App Store ↗
                </Button>
              </a>
            )}
            {app.officialWebsite && (
              <a href={app.officialWebsite} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="md">
                  Official Website ↗
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Short & Full Description */}
        {app.shortDescription && (
          <div className="mb-6 p-4 rounded-[var(--radius-lg)] bg-surface border border-border-light text-muted">
            {app.shortDescription}
          </div>
        )}

        {app.fullDescription && (
          <div className="mb-8 prose max-w-none" dangerouslySetInnerHTML={{ __html: app.fullDescription }} />
        )}

        {/* Features / Details grid */}
        {(app.version || app.lastUpdated || app.privacy || app.features) && (
          <div className="mt-8 bg-surface rounded-[var(--radius-lg)] border border-border p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground">App Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {app.version && (
                <div>
                  <span className="text-muted block text-xs">Version</span>
                  <span className="font-semibold text-foreground">{app.version}</span>
                </div>
              )}
              {app.lastUpdated && (
                <div>
                  <span className="text-muted block text-xs">Last Updated</span>
                  <span className="font-semibold text-foreground">{app.lastUpdated}</span>
                </div>
              )}
              {app.privacy && (
                <div className="sm:col-span-2">
                  <span className="text-muted block text-xs">Privacy & Permissions</span>
                  <span className="text-foreground">{app.privacy}</span>
                </div>
              )}
              {app.features && (
                <div className="sm:col-span-2">
                  <span className="text-muted block text-xs">Key Features</span>
                  <span className="text-foreground">{app.features}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social Share */}
        <div className="mt-8 pt-6 border-t border-border">
          <SocialShare url={pageUrl} title={app.name} />
        </div>
      </Container>
    </section>
  );
}
