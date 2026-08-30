'use client';

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import LoadingState from "@/components/ui/LoadingState";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    siteName: "TechSurround",
    siteDescription: "",
    contactEmail: "",
    defaultSeoTitle: "",
    defaultSeoDescription: "",
    socialTwitter: "",
    socialFacebook: "",
    socialLinkedin: "",
    socialYoutube: "",
    googleVerification: "",
    analyticsId: "",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.settings) {
          setForm({
            siteName: data.settings.siteName || "TechSurround",
            siteDescription: data.settings.siteDescription || "",
            contactEmail: data.settings.contactEmail || "",
            defaultSeoTitle: data.settings.defaultSeoTitle || "",
            defaultSeoDescription: data.settings.defaultSeoDescription || "",
            socialTwitter: data.settings.socialTwitter || "",
            socialFacebook: data.settings.socialFacebook || "",
            socialLinkedin: data.settings.socialLinkedin || "",
            socialYoutube: data.settings.socialYoutube || "",
            googleVerification: data.settings.googleVerification || "",
            analyticsId: data.settings.analyticsId || "",
          });
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        setError("Failed to save settings.");
        setSaving(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading site settings..." />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Site Configuration & SEO
          </h1>
          <p className="text-sm text-muted">
            Manage global metadata, contact details, social profiles, and analytics integrations.
          </p>
        </div>
        <Button type="submit" variant="primary" size="md" loading={saving}>
          Save Settings
        </Button>
      </div>

      {success && (
        <div className="p-3 bg-success/15 border border-success/30 rounded text-sm text-success font-medium">
          ✓ Settings saved successfully!
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
          {error}
        </div>
      )}

      {/* General Settings */}
      <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-foreground">General Platform Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Site Name"
            value={form.siteName}
            onChange={(e) => handleChange("siteName", e.target.value)}
            required
          />
          <Input
            label="Public Contact Email"
            value={form.contactEmail}
            onChange={(e) => handleChange("contactEmail", e.target.value)}
            placeholder="contact@techsurround.com"
          />
        </div>

        <Textarea
          label="Site Tagline / Description"
          value={form.siteDescription}
          onChange={(e) => handleChange("siteDescription", e.target.value)}
          placeholder="Technology, Explained Simply."
          rows={2}
        />
      </div>

      {/* SEO Defaults */}
      <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-foreground">Default SEO Metadata</h2>
        <Input
          label="Default SEO Title Tag"
          value={form.defaultSeoTitle}
          onChange={(e) => handleChange("defaultSeoTitle", e.target.value)}
          placeholder="TechSurround — Technology, Explained Simply"
        />
        <Textarea
          label="Default Meta Description"
          value={form.defaultSeoDescription}
          onChange={(e) => handleChange("defaultSeoDescription", e.target.value)}
          placeholder="Your trusted source for technology news, cyber security, mobile arrivals..."
          rows={3}
        />
      </div>

      {/* Social Links */}
      <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-foreground">Social Media Profiles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="X / Twitter URL"
            value={form.socialTwitter}
            onChange={(e) => handleChange("socialTwitter", e.target.value)}
            placeholder="https://x.com/techsurround"
          />
          <Input
            label="LinkedIn URL"
            value={form.socialLinkedin}
            onChange={(e) => handleChange("socialLinkedin", e.target.value)}
            placeholder="https://linkedin.com/company/techsurround"
          />
          <Input
            label="Facebook URL"
            value={form.socialFacebook}
            onChange={(e) => handleChange("socialFacebook", e.target.value)}
            placeholder="https://facebook.com/techsurround"
          />
          <Input
            label="YouTube URL"
            value={form.socialYoutube}
            onChange={(e) => handleChange("socialYoutube", e.target.value)}
            placeholder="https://youtube.com/@techsurround"
          />
        </div>
      </div>

      {/* Verification & Analytics */}
      <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-foreground">Integrations & Verification</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Google Site Verification Token"
            value={form.googleVerification}
            onChange={(e) => handleChange("googleVerification", e.target.value)}
            placeholder="google-site-verification=..."
          />
          <Input
            label="Google Analytics Measurement ID"
            value={form.analyticsId}
            onChange={(e) => handleChange("analyticsId", e.target.value)}
            placeholder="G-XXXXXXXXXX"
          />
        </div>
      </div>
    </form>
  );
}
