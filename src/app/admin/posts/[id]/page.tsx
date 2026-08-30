'use client';

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import RichTextEditor from "@/components/admin/RichTextEditor";
import LoadingState from "@/components/ui/LoadingState";
import { slugify } from "@/lib/config";

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

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const DRAFT_EDIT_KEY = `techsurround_edit_post_draft_${id}`;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  // Autosave Draft info
  const [autoSaveTime, setAutoSaveTime] = useState<string | null>(null);

  // Quick tag creation
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [authors, setAuthors] = useState<{ id: string; name: string }[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const [postRes, catRes, autRes, tagRes] = await Promise.all([
          fetch(`/api/posts/${id}`),
          fetch("/api/categories"),
          fetch("/api/authors"),
          fetch("/api/tags"),
        ]);

        const postData = await postRes.json();
        const catData = await catRes.json();
        const autData = await autRes.json();
        const tagData = await tagRes.json();

        setCategories(catData.categories || []);
        setAuthors(autData.authors || []);
        setTags(tagData.tags || []);

        if (postData.post) {
          const p = postData.post;
          // Check local draft first
          const savedDraft = localStorage.getItem(DRAFT_EDIT_KEY);
          if (savedDraft) {
            try {
              const draft = JSON.parse(savedDraft);
              setTitle(draft.title || p.title || "");
              setSlug(draft.slug || p.slug || "");
              setExcerpt(draft.excerpt || p.excerpt || "");
              setContent(draft.content || p.content || "");
              setFeaturedImage(draft.featuredImage || p.featuredImage || "");
              setCategoryId(draft.categoryId || p.categoryId || "");
              setAuthorId(draft.authorId || p.authorId || "");
              setStatus(draft.status || p.status || "draft");
              setIsFeatured(draft.isFeatured ?? p.isFeatured ?? false);
              setIsTrending(draft.isTrending ?? p.isTrending ?? false);
              setSeoTitle(draft.seoTitle || p.seoTitle || "");
              setSeoDescription(draft.seoDescription || p.seoDescription || "");
              setFocusKeyword(draft.focusKeyword || p.focusKeyword || "");
              setCanonicalUrl(draft.canonicalUrl || p.canonicalUrl || "");
              setSelectedTagIds(draft.selectedTagIds || p.tags?.map((t: any) => t.tagId) || []);
              setAutoSaveTime(draft.savedAt || "restored");
              setLoading(false);
              return;
            } catch (e) {
              console.error("Draft parse error:", e);
            }
          }

          setTitle(p.title || "");
          setSlug(p.slug || "");
          setExcerpt(p.excerpt || "");
          setContent(p.content || "");
          setFeaturedImage(p.featuredImage || "");
          setCategoryId(p.categoryId || "");
          setAuthorId(p.authorId || "");
          setStatus(p.status || "draft");
          setIsFeatured(p.isFeatured || false);
          setIsTrending(p.isTrending || false);
          setSeoTitle(p.seoTitle || "");
          setSeoDescription(p.seoDescription || "");
          setFocusKeyword(p.focusKeyword || "");
          setCanonicalUrl(p.canonicalUrl || "");
          setSelectedTagIds(p.tags?.map((t: any) => t.tagId) || []);
        }
      } catch (err) {
        console.error("Failed to load post data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, DRAFT_EDIT_KEY]);

  // Autosave edit draft
  const saveDraft = useCallback(() => {
    if (!title && !content) return;

    const timeStr = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const draftData = {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      categoryId,
      authorId,
      status,
      isFeatured,
      isTrending,
      selectedTagIds,
      seoTitle,
      seoDescription,
      focusKeyword,
      canonicalUrl,
      savedAt: timeStr,
    };

    try {
      localStorage.setItem(DRAFT_EDIT_KEY, JSON.stringify(draftData));
      setAutoSaveTime(timeStr);
    } catch (err) {
      console.warn("Autosave storage full or disabled:", err);
    }
  }, [
    title,
    slug,
    excerpt,
    content,
    featuredImage,
    categoryId,
    authorId,
    status,
    isFeatured,
    isTrending,
    selectedTagIds,
    seoTitle,
    seoDescription,
    focusKeyword,
    canonicalUrl,
    DRAFT_EDIT_KEY,
  ]);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      saveDraft();
    }, 600);
    return () => clearTimeout(timer);
  }, [saveDraft, loading]);

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
      prev.includes(tagId) ? prev.filter((i) => i !== tagId) : [...prev, tagId]
    );
  };

  const handleCreateCustomTag = async (tagNameToCreate?: string) => {
    const nameToUse = (tagNameToCreate || newTagName).trim();
    if (!nameToUse) return;

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
      const res = await fetch(`/api/posts/${id}`, {
        method: "PUT",
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
        setError(data.error || "Failed to update post.");
        setSaving(false);
        return;
      }

      // Clear draft on successful save
      localStorage.removeItem(DRAFT_EDIT_KEY);

      router.push("/admin/posts");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading article editor..." />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin/posts" className="text-xs text-muted hover:text-foreground">
            ← Back to Articles
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight mt-1">
            Edit Article
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {autoSaveTime && (
            <span className="text-xs text-success font-medium hidden sm:inline-flex items-center gap-1.5 bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
              Auto-saved ({autoSaveTime})
            </span>
          )}

          <Link href="/admin/posts">
            <Button type="button" variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="primary" size="sm" loading={saving}>
            Save Changes
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-[var(--radius)] text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 space-y-4 shadow-sm">
            <Input
              label="Article Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Input
              label="URL Slug"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              required
            />

            <Textarea
              label="Short Excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
            />
          </div>

          {/* Editor with Fixed Stationary Toolbar */}
          <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-foreground">
                Article Content (Rich Text)
              </label>
              <span className="text-xs text-muted">Toolbar stays fixed • Content scrolls inside</span>
            </div>

            <RichTextEditor
              content={content}
              onChange={setContent}
              height="500px"
              autoSaveTime={autoSaveTime}
            />
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
            />
            <Textarea
              label="SEO Meta Description"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Focus Keyword"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
              />
              <Input
                label="Canonical URL"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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
                  <img src={featuredImage} alt="Preview" className="w-full h-full object-cover" />
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

            <div className="pt-2 border-t border-border-light">
              <label className="block text-[11px] text-muted mb-1">Or paste Image URL:</label>
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://..."
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
