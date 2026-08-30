'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { slugify } from "@/lib/config";

interface CategoryOption {
  id: string;
  name: string;
}

interface AuthorOption {
  id: string;
  name: string;
}

interface TagOption {
  id: string;
  name: string;
}

export default function NewPostPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [status, setStatus] = useState("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [authors, setAuthors] = useState<AuthorOption[]>([]);
  const [tags, setTags] = useState<TagOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, autRes, tagRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/authors"),
          fetch("/api/tags"),
        ]);
        const catData = await catRes.json();
        const autData = await autRes.json();
        const tagData = await tagRes.json();

        setCategories(catData.categories || []);
        setAuthors(autData.authors || []);
        setTags(tagData.tags || []);

        if (catData.categories?.length > 0) {
          setCategoryId(catData.categories[0].id);
        }
        if (autData.authors?.length > 0) {
          setAuthorId(autData.authors[0].id);
        }
      } catch (err) {
        console.error("Failed to load options:", err);
      }
    }
    loadMeta();
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(slugify(val));
    if (!seoTitle) setSeoTitle(val);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setError("Title and slug are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          content,
          featuredImage: featuredImage || null,
          categoryId: categoryId || null,
          authorId: authorId || null,
          status,
          isFeatured,
          isTrending,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
          focusKeyword: focusKeyword || null,
          canonicalUrl: canonicalUrl || null,
          tagIds: selectedTagIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create post.");
        setSaving(false);
        return;
      }

      router.push("/admin/posts");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/admin/posts" className="text-xs text-muted hover:text-foreground">
            ← Back to Articles
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight mt-1">
            Create New Article
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/posts">
            <Button type="button" variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="primary" size="sm" loading={saving}>
            Save & Publish
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-[var(--radius)] text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main 2 columns: Title, Excerpt, Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 space-y-4 shadow-sm">
            <Input
              label="Article Title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g., Breakthrough in Quantum Computing: What It Means for AI"
              required
            />

            <Input
              label="URL Slug"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="breakthrough-quantum-computing-ai"
              helperText="The unique URL identifier for this article."
              required
            />

            <Textarea
              label="Short Excerpt / Summary"
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value);
                if (!seoDescription) setSeoDescription(e.target.value);
              }}
              placeholder="A concise 1-2 sentence overview of the article shown on cards and search results."
              rows={3}
            />
          </div>

          <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 space-y-3 shadow-sm">
            <label className="block text-sm font-semibold text-foreground">
              Article Content (Rich Text)
            </label>
            <RichTextEditor content={content} onChange={setContent} />
          </div>

          {/* SEO & Metadata Section */}
          <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-foreground">SEO Optimization & Schema</h2>
            <Input
              label="SEO Title"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Custom title tag (defaults to Article Title)"
            />
            <Textarea
              label="SEO Meta Description"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Search engine snippet description (150-160 chars recommended)"
              rows={2}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Focus Keyword"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                placeholder="e.g., quantum computing"
              />
              <Input
                label="Canonical URL (Optional)"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Sidebar 1 column: Status, Category, Author, Featured Image, Tags */}
        <div className="space-y-6">
          {/* Publishing Settings */}
          <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-foreground">Publishing</h2>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-input-bg border border-input-border rounded-[var(--radius)] text-sm text-foreground cursor-pointer"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-border-light">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                Feature in Homepage Hero
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                Mark as Trending
              </label>
            </div>
          </div>

          {/* Category & Author */}
          <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 space-y-4 shadow-sm">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-input-bg border border-input-border rounded-[var(--radius)] text-sm text-foreground cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Author</label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full px-3 py-2 bg-input-bg border border-input-border rounded-[var(--radius)] text-sm text-foreground cursor-pointer"
              >
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 space-y-3 shadow-sm">
            <h2 className="text-base font-bold text-foreground">Featured Image</h2>
            <Input
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              helperText="Paste direct image URL."
            />
            {featuredImage && (
              <div className="rounded-[var(--radius)] overflow-hidden border border-border mt-2 aspect-video bg-surface">
                <img src={featuredImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 space-y-3 shadow-sm">
            <h2 className="text-base font-bold text-foreground">Tags</h2>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
              {tags.map((t) => {
                const selected = selectedTagIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTagToggle(t.id)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-surface border-border-light text-muted hover:text-foreground"
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
