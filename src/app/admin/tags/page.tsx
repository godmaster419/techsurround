'use client';

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import LoadingState from "@/components/ui/LoadingState";
import { slugify } from "@/lib/config";

interface TagItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: { posts: number };
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadTags = async () => {
    try {
      const res = await fetch("/api/tags");
      const data = await res.json();
      setTags(data.tags || []);
    } catch (err) {
      console.error("Failed to load tags:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
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
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create tag.");
        setSaving(false);
        return;
      }

      setName("");
      setSlug("");
      setDescription("");
      loadTags();
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
          Content Tags
        </h1>
        <p className="text-sm text-muted">
          Manage keyword tags for cross-topic discovery and internal linking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 shadow-sm h-fit">
          <h2 className="text-base font-bold text-foreground mb-4">Add New Tag</h2>

          {error && (
            <div className="p-3 mb-4 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Tag Name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Apple, OpenAI, 5G"
              required
            />

            <Input
              label="URL Slug"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="apple"
              required
            />

            <Textarea
              label="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short tag description..."
              rows={2}
            />

            <Button type="submit" variant="primary" size="sm" className="w-full" loading={saving}>
              Create Tag
            </Button>
          </form>
        </div>

        <div className="md:col-span-2 bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-4">
            Tags ({tags.length})
          </h2>

          {loading ? (
            <LoadingState message="Loading tags..." />
          ) : tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <div
                  key={t.id}
                  className="px-3 py-2 bg-surface rounded-[var(--radius-lg)] border border-border-light flex items-center gap-2"
                >
                  <span className="font-semibold text-xs text-foreground">#{t.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                    {t._count?.posts ?? 0}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No tags created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
