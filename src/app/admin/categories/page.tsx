'use client';

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import LoadingState from "@/components/ui/LoadingState";
import { slugify } from "@/lib/config";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: { posts: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(slugify(val));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setError("Name and slug are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create category.");
        setSaving(false);
        return;
      }

      setName("");
      setSlug("");
      setDescription("");
      loadCategories();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
          Category Channels
        </h1>
        <p className="text-sm text-muted">
          Manage publication taxonomy and category sections.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Create category form */}
        <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 shadow-sm h-fit">
          <h2 className="text-base font-bold text-foreground mb-4">Add New Category</h2>

          {error && (
            <div className="p-3 mb-4 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Category Name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Cloud Security"
              required
            />

            <Input
              label="URL Slug"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="cloud-security"
              required
            />

            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description for category header and meta tags..."
              rows={3}
            />

            <Button type="submit" variant="primary" size="sm" className="w-full" loading={saving}>
              Create Category
            </Button>
          </form>
        </div>

        {/* Existing categories list */}
        <div className="md:col-span-2 bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-4">
            Active Categories ({categories.length})
          </h2>

          {loading ? (
            <LoadingState message="Loading categories..." />
          ) : (
            <div className="divide-y divide-border-light">
              {categories.map((c) => (
                <div key={c.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{c.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-surface border border-border-light text-muted font-mono">
                        /{c.slug}
                      </span>
                    </div>
                    {c.description && (
                      <p className="text-xs text-muted mt-1 line-clamp-1">{c.description}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-primary/10 text-primary">
                      {c._count?.posts ?? 0} articles
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
