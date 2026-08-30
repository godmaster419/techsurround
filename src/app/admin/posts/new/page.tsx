'use client';

import React, { useEffect, useRef, useState } from "react";
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
  slug: string;
}

const POPULAR_TRENDING_HASHTAGS = [
  "TechNews",
  "CyberSecurity",
  "ArtificialIntelligence",
  "AI",
  "Smartphone",
  "CyberCrime",
  "Gadgets",
  "Apple",
  "Google",
  "Samsung",
  "OpenAI",
  "Software",
  "TrendingApps",
  "5G",
  "TechSurround",
];

export default function NewPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // SEO & Keywords
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");

  // Quick tag creation
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);

  // Upload status
  const [uploadingImage, setUploadingImage] = useState(false);

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [authors, setAuthors] = useState<AuthorOption[]>([]);
  const [tags, setTags] = useState<TagOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadMeta = async () => {
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

      if (catData.categories?.length > 0 && !categoryId) {
        setCategoryId(catData.categories[0].id);
      }
      if (autData.authors?.length > 0 && !authorId) {
        setAuthorId(autData.authors[0].id);
      }
    } catch (err) {
      console.error("Failed to load options:", err);
    }
  };

  useEffect(() => {
    loadMeta();
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(slugify(val));
    if (!seoTitle) setSeoTitle(val);
  };

  // Direct Featured Image File Upload
  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to upload image.");
        setUploadingImage(false);
        return;
      }

      setFeaturedImage(data.url);
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Error uploading file.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  // Create custom tag inline on the fly
  const handleCreateCustomTag = async (tagNameToCreate?: string) => {
    const nameToUse = (tagNameToCreate || newTagName).trim();
    if (!nameToUse) return;

    // Check if already exists in loaded tags
    const existing = tags.find(
      (t) => t.name.toLowerCase() === nameToUse.toLowerCase() || t.slug === slugify(nameToUse)
    );
    if (existing) {
      if (!selectedTagIds.includes(existing.id)) {
        setSelectedTagIds((prev) => [...prev, existing.id]);
      }
      setNewTagName("");
      return;
    }

    setCreatingTag(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameToUse,
          slug: slugify(nameToUse),
        }),
      });

      const data = await res.json();
      if (res.ok && data.tag) {
        setTags((prev) => [...prev, data.tag]);
        setSelectedTagIds((prev) => [...prev, data.tag.id]);
        setNewTagName("");
      }
    } catch (err) {
      console.error("Tag creation failed:", err);
    } finally {
      setCreatingTag(false);
    }
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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-16">
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
        {/* Main 2 columns: Title, Excerpt, Content, SEO */}
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

          {/* Editor */}
          <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 space-y-3 shadow-sm">
            <label className="block text-sm font-semibold text-foreground">
              Article Content (Rich Text)
            </label>
            <RichTextEditor content={content} onChange={setContent} />
          </div>

          {/* SEO & Keywords Section */}
          <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 space-y-4 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-foreground">Google SEO & Search Visibility</h2>
              <p className="text-xs text-muted mt-0.5">Optimize search snippet, target keywords, and rankings.</p>
            </div>

            <Input
              label="SEO Title"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Custom search title (defaults to Article Title)"
            />
            <Textarea
              label="SEO Meta Description"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Google snippet description (150-160 characters recommended)"
              rows={2}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Focus Keyword"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                placeholder="e.g., quantum computing, cyber crime"
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

        {/* Sidebar 1 column: Publishing, Category, Featured Image with Direct Upload, Trending Hashtags */}
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
                  className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
                Feature in Homepage Hero
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer"
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

          {/* DIRECT FEATURED IMAGE UPLOAD */}
          <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 space-y-4 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-foreground">Featured Image</h2>
              <p className="text-xs text-muted">Upload directly from device or paste link.</p>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFeaturedImageUpload}
              accept="image/*"
              className="hidden"
            />

            {featuredImage ? (
              <div className="space-y-3">
                <div className="rounded-[var(--radius-lg)] overflow-hidden border border-border aspect-video bg-surface relative group">
                  <img src={featuredImage} alt="Featured Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Image
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setFeaturedImage("")}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/60 rounded-[var(--radius-lg)] p-6 text-center bg-surface cursor-pointer transition-colors"
              >
                {uploadingImage ? (
                  <div className="py-4 text-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs text-muted">Uploading image...</p>
                  </div>
                ) : (
                  <>
                    <span className="text-2xl block mb-1">🖼️</span>
                    <p className="text-xs font-semibold text-foreground">Click to Upload from Device</p>
                    <p className="text-[11px] text-muted mt-0.5">JPG, PNG, WebP (Max 10MB)</p>
                  </>
                )}
              </div>
            )}

            {/* Optional URL input */}
            <div className="pt-2 border-t border-border-light">
              <label className="block text-[11px] text-muted mb-1">Or paste Image URL:</label>
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-2.5 py-1.5 bg-input-bg border border-input-border rounded text-xs text-foreground placeholder:text-muted"
              />
            </div>
          </div>

          {/* TRENDING HASHTAGS & TAG MANAGEMENT */}
          <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 space-y-4 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-foreground">Tags & Trending Hashtags</h2>
              <p className="text-xs text-muted">Select or click popular hashtags for Google search discovery.</p>
            </div>

            {/* Quick Add Trending Hashtags */}
            <div>
              <span className="text-xs font-semibold text-muted block mb-1.5">🔥 Popular Tech Hashtags:</span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TRENDING_HASHTAGS.map((hashtag) => (
                  <button
                    key={hashtag}
                    type="button"
                    onClick={() => handleCreateCustomTag(hashtag)}
                    className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors"
                  >
                    #{hashtag} +
                  </button>
                ))}
              </div>
            </div>

            {/* Active Selected Tags & All Tags */}
            <div className="pt-2 border-t border-border-light">
              <span className="text-xs font-semibold text-muted block mb-1.5">All Tags:</span>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {tags.map((t) => {
                  const selected = selectedTagIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTagToggle(t.id)}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                        selected
                          ? "bg-primary text-primary-foreground border-primary font-semibold"
                          : "bg-surface border-border-light text-muted hover:text-foreground"
                      }`}
                    >
                      #{t.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inline Custom Tag Input */}
            <div className="pt-2 border-t border-border-light flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateCustomTag();
                  }
                }}
                placeholder="Type new #hashtag..."
                className="flex-1 px-2.5 py-1.5 bg-input-bg border border-input-border rounded text-xs text-foreground placeholder:text-muted"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCreateCustomTag()}
                loading={creatingTag}
              >
                + Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
