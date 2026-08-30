'use client';

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import LoadingState from "@/components/ui/LoadingState";
import { slugify } from "@/lib/config";

interface AppItem {
  id: string;
  name: string;
  slug: string;
  category?: string;
  platform?: string;
  developer?: string;
  icon?: string;
}

export default function AdminTrendingAppsPage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    developer: "",
    category: "Productivity",
    platform: "Android, iOS, Web",
    icon: "",
    shortDescription: "",
    androidUrl: "",
    iosUrl: "",
    officialWebsite: "",
  });

  const loadApps = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/trending-apps");
      const data = await res.json();
      setApps(data.apps || []);
    } catch (err) {
      console.error("Failed to load apps:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleNameChange = (val: string) => {
    setForm((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug || slugify(val),
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      setError("Name and slug are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/trending-apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create app.");
        setSaving(false);
        return;
      }

      setForm({
        name: "",
        slug: "",
        developer: "",
        category: "Productivity",
        platform: "Android, iOS, Web",
        icon: "",
        shortDescription: "",
        androidUrl: "",
        iosUrl: "",
        officialWebsite: "",
      });
      loadApps();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
          Trending Apps Management
        </h1>
        <p className="text-sm text-muted">
          Catalog and publish mobile applications, software tools, and utilities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 shadow-sm h-fit">
          <h2 className="text-base font-bold text-foreground mb-4">Add Trending App</h2>

          {error && (
            <div className="p-3 mb-4 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-3.5">
            <Input
              label="App Name"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Notion, Arc Browser"
              required
            />

            <Input
              label="URL Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
              placeholder="notion"
              required
            />

            <Input
              label="Developer / Publisher"
              value={form.developer}
              onChange={(e) => setForm({ ...form, developer: e.target.value })}
              placeholder="e.g., Notion Labs, Inc."
            />

            <Input
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g., AI & Utilities"
            />

            <Input
              label="Platform Support"
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              placeholder="Android, iOS, Web"
            />

            <Input
              label="Icon Image URL"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="https://..."
            />

            <Textarea
              label="Summary"
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              placeholder="Short description of what the app does..."
              rows={2}
            />

            <Input
              label="Play Store URL"
              value={form.androidUrl}
              onChange={(e) => setForm({ ...form, androidUrl: e.target.value })}
              placeholder="https://play.google.com/..."
            />

            <Input
              label="App Store URL"
              value={form.iosUrl}
              onChange={(e) => setForm({ ...form, iosUrl: e.target.value })}
              placeholder="https://apps.apple.com/..."
            />

            <Button type="submit" variant="primary" size="sm" className="w-full mt-2" loading={saving}>
              Add App Entry
            </Button>
          </form>
        </div>

        {/* Existing Apps Table */}
        <div className="lg:col-span-2 bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-4">
            Cataloged Apps ({apps.length})
          </h2>

          {loading ? (
            <LoadingState message="Loading apps..." />
          ) : apps.length > 0 ? (
            <div className="divide-y divide-border-light">
              {apps.map((a) => (
                <div key={a.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0">
                      {a.icon ? (
                        <img src={a.icon} alt={a.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">📱</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.developer || "Unknown developer"}</p>
                      <div className="flex gap-2 mt-1">
                        {a.category && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border-light text-muted">
                            {a.category}
                          </span>
                        )}
                        {a.platform && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            {a.platform}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <a
                    href={`/trending-apps/${a.slug}`}
                    target="_blank"
                    className="text-xs text-primary font-medium hover:underline shrink-0"
                  >
                    View Live ↗
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No trending apps cataloged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
