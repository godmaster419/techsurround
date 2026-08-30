import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import Button from "@/components/ui/Button";

export default async function AdminDashboardPage() {
  const [
    postCount,
    publishedCount,
    categoryCount,
    mobileCount,
    appCount,
    subscribersCount,
    messagesCount,
    recentPosts,
  ] = await Promise.all([
    db.post.count(),
    db.post.count({ where: { status: "published" } }),
    db.category.count(),
    db.mobileArrival.count(),
    db.trendingApp.count(),
    db.newsletterSubscriber.count(),
    db.contactMessage.count(),
    db.post.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { category: true, author: true },
    }),
  ]);

  const STATS = [
    { label: "Total Articles", value: postCount, sub: `${publishedCount} published`, icon: "📝", href: "/admin/posts" },
    { label: "Mobile Arrivals", value: mobileCount, sub: "Devices cataloged", icon: "📱", href: "/admin/mobile-arrivals" },
    { label: "Trending Apps", value: appCount, sub: "Apps listed", icon: "🚀", href: "/admin/trending-apps" },
    { label: "Categories", value: categoryCount, sub: "Content channels", icon: "📁", href: "/admin/categories" },
    { label: "Subscribers", value: subscribersCount, sub: "Newsletter members", icon: "👥", href: "/admin/subscribers" },
    { label: "Inquiries", value: messagesCount, sub: "Contact messages", icon: "📬", href: "/admin/messages" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card-bg border border-card-border p-6 rounded-[var(--radius-xl)] shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-muted mt-1">
            Welcome to the TechSurround content management center.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/posts/new">
            <Button variant="primary" size="sm">
              + New Article
            </Button>
          </Link>
          <Link href="/admin/mobile-arrivals/new">
            <Button variant="outline" size="sm">
              + Mobile Arrival
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {STATS.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-card-bg border border-card-border rounded-[var(--radius-lg)] p-4 shadow-sm hover:border-primary/40 transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-xs font-semibold text-primary">View →</span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
              <p className="text-xs font-medium text-foreground mt-0.5">{s.label}</p>
              <p className="text-[11px] text-muted">{s.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Articles Table */}
      <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Recent Articles</h2>
          <Link href="/admin/posts" className="text-xs font-medium text-primary hover:underline">
            View All Articles →
          </Link>
        </div>

        {recentPosts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-light text-xs font-semibold text-muted">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {recentPosts.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-hover/50">
                    <td className="py-3 pr-4 font-medium text-foreground max-w-xs truncate">
                      {p.title}
                    </td>
                    <td className="py-3 pr-4 text-muted">
                      {p.category?.name || "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded ${
                          p.status === "published"
                            ? "bg-success/10 text-success"
                            : p.status === "scheduled"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted-foreground/10 text-muted"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted">
                      {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/posts/${p.id}`}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted py-6 text-center">
            No articles yet. Click &ldquo;+ New Article&rdquo; to publish your first post!
          </p>
        )}
      </div>
    </div>
  );
}
