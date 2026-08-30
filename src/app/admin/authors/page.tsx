'use client';

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import LoadingState from "@/components/ui/LoadingState";
import { slugify } from "@/lib/config";

interface AuthorItem {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  image?: string;
  twitter?: string;
  linkedin?: string;
  _count?: { posts: number };
}

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<AuthorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadAuthors = async () => {
    try {
      const res = await fetch("/api/authors");
      const data = await res.json();
      setAuthors(data.authors || []);
    } catch (err) {
      console.error("Failed to load authors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthors();
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
      const res = await fetch("/api/authors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, bio, image, twitter, linkedin }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create author.");
        setSaving(false);
        return;
      }

      setName("");
      setSlug("");
      setBio("");
      setImage("");
      setTwitter("");
      setLinkedin("");
      loadAuthors();
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
          Author Profiles
        </h1>
        <p className="text-sm text-muted">
          Manage writers, editors, and publication contributors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 shadow-sm h-fit">
          <h2 className="text-base font-bold text-foreground mb-4">Add New Author</h2>

          {error && (
            <div className="p-3 mb-4 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Author Name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Alex Johnson"
              required
            />

            <Input
              label="URL Slug"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="alex-johnson"
              required
            />

            <Textarea
              label="Biography"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short author bio..."
              rows={3}
            />

            <Input
              label="Avatar Image URL"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
            />

            <Input
              label="X / Twitter URL"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="https://x.com/..."
            />

            <Input
              label="LinkedIn URL"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />

            <Button type="submit" variant="primary" size="sm" className="w-full" loading={saving}>
              Create Author Profile
            </Button>
          </form>
        </div>

        <div className="md:col-span-2 bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-4">
            Active Authors ({authors.length})
          </h2>

          {loading ? (
            <LoadingState message="Loading authors..." />
          ) : (
            <div className="divide-y divide-border-light">
              {authors.map((a) => (
                <div key={a.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center font-bold text-primary border border-border">
                      {a.image ? (
                        <img src={a.image} alt={a.name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        a.name[0]
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{a.name}</p>
                      <p className="text-xs text-muted line-clamp-1">{a.bio || "No bio provided"}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-primary/10 text-primary">
                      {a._count?.posts ?? 0} articles
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
