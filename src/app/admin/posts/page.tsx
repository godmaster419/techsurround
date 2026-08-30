'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";

interface PostItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
  publishedAt: string | null;
  category?: { name: string; slug: string };
  author?: { name: string };
  isFeatured: boolean;
  isTrending: boolean;
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let url = "/api/posts?admin=true&limit=50";
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [statusFilter]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(posts.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete post.");
      }
    } catch {
      alert("Network error.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Article Management
          </h1>
          <p className="text-sm text-muted">Create, edit, organize, and publish articles.</p>
        </div>
        <Link href="/admin/posts/new">
          <Button variant="primary" size="md">
            + Create New Article
          </Button>
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-card-bg p-4 rounded-[var(--radius-lg)] border border-card-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchPosts();
          }}
          className="flex-1"
        >
          <input
            type="search"
            placeholder="Search articles by title or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 bg-input-bg border border-input-border rounded-[var(--radius)] text-sm text-foreground placeholder:text-muted"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-input-bg border border-input-border rounded-[var(--radius)] text-sm text-foreground cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingState message="Loading articles..." />
      ) : posts.length > 0 ? (
        <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface border-b border-border-light text-xs font-semibold text-muted">
                <tr>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Badges</th>
                  <th className="py-3.5 px-4">Published Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground max-w-sm">
                      <Link href={`/admin/posts/${p.id}`} className="hover:text-primary transition-colors line-clamp-1">
                        {p.title}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-muted whitespace-nowrap">
                      {p.category?.name || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-muted whitespace-nowrap">
                      {p.author?.name || "—"}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 text-[11px] font-bold uppercase rounded ${
                          p.status === "published"
                            ? "bg-success/15 text-success"
                            : p.status === "scheduled"
                            ? "bg-primary/15 text-primary"
                            : "bg-muted-foreground/15 text-muted"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        {p.isFeatured && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-warning/15 text-warning font-semibold">
                            Featured
                          </span>
                        )}
                        {p.isTrending && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-primary/15 text-primary font-semibold">
                            Trending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted whitespace-nowrap">
                      {p.publishedAt
                        ? new Date(p.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "Not published"}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                      <Link
                        href={`/admin/posts/${p.id}`}
                        className="px-2 py-1 text-xs font-semibold rounded bg-surface hover:bg-surface-hover text-foreground transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="px-2 py-1 text-xs font-semibold rounded text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No articles found"
          message="Create your first article or adjust your search filter."
          action={
            <Link href="/admin/posts/new">
              <Button variant="primary" size="sm">+ Create Article</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
