'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { slugify } from "@/lib/config";

export default function NewMobileArrivalPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    brand: "",
    name: "",
    model: "",
    slug: "",
    price: "",
    currency: "$",
    releaseDate: "",
    launchStatus: "Announced",
    primaryImage: "",
    shortDescription: "",
    fullDescription: "",
    officialWebsite: "",

    // Display
    displaySize: "",
    displayType: "",
    displayResolution: "",
    displayRefreshRate: "",
    displayProtection: "",

    // Performance
    chipset: "",
    cpu: "",
    gpu: "",
    ram: "",
    storage: "",
    expandableStorage: "",

    // Camera
    mainCamera: "",
    ultraWide: "",
    telephoto: "",
    frontCamera: "",
    videoRecording: "",

    // Battery
    batteryCapacity: "",
    chargingSpeed: "",
    wirelessCharging: "",

    // Connectivity
    fiveG: "Yes",
    wifi: "Wi-Fi 6E / 7",
    bluetooth: "5.3",
    nfc: "Yes",
    usb: "Type-C",

    // OS
    os: "Android / iOS",
    ui: "",
    osVersion: "",

    // Design
    dimensions: "",
    weight: "",
    buildMaterial: "",
    colors: "",
    waterDustResistance: "IP68",

    // Security & Audio
    fingerprint: "Under-display",
    faceUnlock: "Yes",
    speakers: "Stereo",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "name" && !prev.slug) {
        updated.slug = slugify(`${prev.brand} ${value}`);
      }
      if (key === "brand" && !prev.slug) {
        updated.slug = slugify(`${value} ${prev.name}`);
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brand.trim() || !form.name.trim() || !form.slug.trim()) {
      setError("Brand, Name, and Slug are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/mobile-arrivals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create device.");
        setSaving(false);
        return;
      }

      router.push("/admin/mobile-arrivals");
      router.refresh();
    } catch {
      setError("Network error.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-16">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/mobile-arrivals" className="text-xs text-muted hover:text-foreground">
            ← Back to Mobile Arrivals
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight mt-1">
            Add Smartphone / Mobile Device
          </h1>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/mobile-arrivals">
            <Button type="button" variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="primary" size="sm" loading={saving}>
            Save Device
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-foreground">Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Brand"
            value={form.brand}
            onChange={(e) => handleChange("brand", e.target.value)}
            placeholder="e.g., Samsung, Apple, Google, Xiaomi"
            required
          />
          <Input
            label="Device Name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g., Galaxy S25 Ultra"
            required
          />
          <Input
            label="Model Number"
            value={form.model}
            onChange={(e) => handleChange("model", e.target.value)}
            placeholder="e.g., SM-S928B"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="URL Slug"
            value={form.slug}
            onChange={(e) => handleChange("slug", slugify(e.target.value))}
            placeholder="samsung-galaxy-s25-ultra"
            required
          />
          <Input
            label="Price"
            value={form.price}
            onChange={(e) => handleChange("price", e.target.value)}
            placeholder="1199"
          />
          <Input
            label="Currency Symbol"
            value={form.currency}
            onChange={(e) => handleChange("currency", e.target.value)}
            placeholder="$"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Release / Announcement Date"
            value={form.releaseDate}
            onChange={(e) => handleChange("releaseDate", e.target.value)}
            placeholder="January 2026"
          />
          <Input
            label="Primary Image URL"
            value={form.primaryImage}
            onChange={(e) => handleChange("primaryImage", e.target.value)}
            placeholder="https://..."
          />
          <Input
            label="Official Product Link"
            value={form.officialWebsite}
            onChange={(e) => handleChange("officialWebsite", e.target.value)}
            placeholder="https://..."
          />
        </div>

        <Textarea
          label="Short Overview"
          value={form.shortDescription}
          onChange={(e) => handleChange("shortDescription", e.target.value)}
          placeholder="Brief 1-2 sentence highlight of the smartphone..."
          rows={2}
        />
      </div>

      {/* Specifications Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Display */}
        <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground">Display Specs</h2>
          <Input
            label="Screen Size"
            value={form.displaySize}
            onChange={(e) => handleChange("displaySize", e.target.value)}
            placeholder="6.8 inches"
          />
          <Input
            label="Panel Type"
            value={form.displayType}
            onChange={(e) => handleChange("displayType", e.target.value)}
            placeholder="Dynamic LTPO AMOLED 2X"
          />
          <Input
            label="Resolution"
            value={form.displayResolution}
            onChange={(e) => handleChange("displayResolution", e.target.value)}
            placeholder="1440 x 3120 pixels"
          />
          <Input
            label="Refresh Rate"
            value={form.displayRefreshRate}
            onChange={(e) => handleChange("displayRefreshRate", e.target.value)}
            placeholder="120Hz adaptive"
          />
        </div>

        {/* Performance */}
        <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground">Performance Specs</h2>
          <Input
            label="Chipset"
            value={form.chipset}
            onChange={(e) => handleChange("chipset", e.target.value)}
            placeholder="Snapdragon 8 Elite / Apple A18 Pro"
          />
          <Input
            label="RAM"
            value={form.ram}
            onChange={(e) => handleChange("ram", e.target.value)}
            placeholder="12GB / 16GB LPDDR5X"
          />
          <Input
            label="Storage"
            value={form.storage}
            onChange={(e) => handleChange("storage", e.target.value)}
            placeholder="256GB / 512GB / 1TB UFS 4.0"
          />
          <Input
            label="Expandable Card Slot"
            value={form.expandableStorage}
            onChange={(e) => handleChange("expandableStorage", e.target.value)}
            placeholder="No / microSDXC"
          />
        </div>

        {/* Camera */}
        <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground">Camera Specs</h2>
          <Input
            label="Main Camera"
            value={form.mainCamera}
            onChange={(e) => handleChange("mainCamera", e.target.value)}
            placeholder="200 MP, f/1.7, OIS"
          />
          <Input
            label="Ultra-Wide"
            value={form.ultraWide}
            onChange={(e) => handleChange("ultraWide", e.target.value)}
            placeholder="50 MP, 120-degree"
          />
          <Input
            label="Telephoto"
            value={form.telephoto}
            onChange={(e) => handleChange("telephoto", e.target.value)}
            placeholder="50 MP 5x periscope optical zoom"
          />
          <Input
            label="Front Selfie Camera"
            value={form.frontCamera}
            onChange={(e) => handleChange("frontCamera", e.target.value)}
            placeholder="12 MP, f/2.2"
          />
        </div>

        {/* Battery & Charging */}
        <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground">Battery & Build</h2>
          <Input
            label="Battery Capacity"
            value={form.batteryCapacity}
            onChange={(e) => handleChange("batteryCapacity", e.target.value)}
            placeholder="5000 mAh"
          />
          <Input
            label="Charging Speed"
            value={form.chargingSpeed}
            onChange={(e) => handleChange("chargingSpeed", e.target.value)}
            placeholder="45W wired"
          />
          <Input
            label="Wireless Charging"
            value={form.wirelessCharging}
            onChange={(e) => handleChange("wirelessCharging", e.target.value)}
            placeholder="15W wireless (Qi2)"
          />
          <Input
            label="Water / Dust Rating"
            value={form.waterDustResistance}
            onChange={(e) => handleChange("waterDustResistance", e.target.value)}
            placeholder="IP68 dust/water resistant"
          />
        </div>
      </div>
    </form>
  );
}
