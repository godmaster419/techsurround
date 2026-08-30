'use client';

import React, { useState, useRef } from "react";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/Breadcrumb";
import Button from "@/components/ui/Button";

interface Preset {
  label: string;
  width: number;
  height: number;
  icon: string;
  desc: string;
}

const PRESETS: Preset[] = [
  { label: "Tech Article Hero (16:9)", width: 1200, height: 675, icon: "🌟", desc: "Google Discover & Hero cards" },
  { label: "Article Mid-Image (16:9)", width: 800, height: 450, icon: "📰", desc: "Standard inside-article visual" },
  { label: "Square / Mobile (1:1)", width: 800, height: 800, icon: "📱", desc: "Device specs & app icons" },
  { label: "Wide Editorial Banner (21:9)", width: 1400, height: 600, icon: "🖼️", desc: "Ultra-wide header banner" },
  { label: "Dual Column Image (4:3)", width: 800, height: 600, icon: "👥", desc: "Side-by-side comparison" },
  { label: "YouTube / Video (16:9)", width: 1280, height: 720, icon: "📺", desc: "HD Video thumbnail" },
  { label: "Social Media Post (1:1)", width: 1080, height: 1080, icon: "📸", desc: "Instagram & Twitter square" },
  { label: "Social Header Banner", width: 1500, height: 500, icon: "🐦", desc: "Twitter / Facebook cover" },
];

export default function ImageResizerPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("techsurround-image");
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);
  const [origFileSize, setOrigFileSize] = useState<string>("");
  const [targetWidth, setTargetWidth] = useState<number>(1200);
  const [targetHeight, setTargetHeight] = useState<number>(675);
  const [fitMode, setFitMode] = useState<"cover" | "contain" | "stretch">("cover");
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [format, setFormat] = useState<string>("image/webp");
  const [quality, setQuality] = useState<number>(0.85);
  const [resizedDataUrl, setResizedDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resizedFileSize, setResizedFileSize] = useState<string>("");
  const [savedPercent, setSavedPercent] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name.replace(/\.[^/.]+$/, ""));
    setOrigFileSize((file.size / 1024).toFixed(1) + " KB");

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setOrigWidth(img.naturalWidth);
        setOrigHeight(img.naturalHeight);
        // Default target to 16:9 Hero or natural size if smaller
        setTargetWidth(1200);
        setTargetHeight(675);
        setImageSrc(src);
        setResizedDataUrl(null);
        // Auto process immediately
        processImage(src, img.naturalWidth, img.naturalHeight, 1200, 675, "cover", "image/webp", 0.85, file.size);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const applyPreset = (preset: Preset) => {
    setTargetWidth(preset.width);
    setTargetHeight(preset.height);
    if (imageSrc) {
      processImage(imageSrc, origWidth, origHeight, preset.width, preset.height, fitMode, format, quality);
    }
  };

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockAspectRatio && origWidth > 0) {
      const newHeight = Math.round((val / origWidth) * origHeight);
      setTargetHeight(newHeight);
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockAspectRatio && origHeight > 0) {
      const newWidth = Math.round((val / origHeight) * origWidth);
      setTargetWidth(newWidth);
    }
  };

  const processImage = (
    src: string,
    srcW: number,
    srcH: number,
    tw: number,
    th: number,
    mode: "cover" | "contain" | "stretch",
    fmt: string,
    qual: number,
    rawSizeBytes?: number
  ) => {
    if (!src || tw <= 0 || th <= 0) return;
    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = tw;
      canvas.height = th;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Background fill for contain mode or transparent PNGs
        if (fmt !== "image/png") {
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(0, 0, tw, th);
        }

        if (mode === "stretch") {
          ctx.drawImage(img, 0, 0, tw, th);
        } else if (mode === "contain") {
          const ratio = Math.min(tw / srcW, th / srcH);
          const nw = srcW * ratio;
          const nh = srcH * ratio;
          const nx = (tw - nw) / 2;
          const ny = (th - nh) / 2;
          ctx.drawImage(img, nx, ny, nw, nh);
        } else {
          // COVER (Smart Center-Crop)
          const ratio = Math.max(tw / srcW, th / srcH);
          const nw = srcW * ratio;
          const nh = srcH * ratio;
          const nx = (tw - nw) / 2;
          const ny = (th - nh) / 2;
          ctx.drawImage(img, nx, ny, nw, nh);
        }

        const dataUrl = canvas.toDataURL(fmt, qual);
        setResizedDataUrl(dataUrl);

        // Size stats
        const head = `data:${fmt};base64,`;
        const sizeBytes = Math.round(((dataUrl.length - head.length) * 3) / 4);
        const kb = (sizeBytes / 1024).toFixed(1);
        setResizedFileSize(`${kb} KB`);

        if (rawSizeBytes && rawSizeBytes > 0) {
          const pct = Math.round(((rawSizeBytes - sizeBytes) / rawSizeBytes) * 100);
          if (pct > 0) setSavedPercent(`${pct}% smaller`);
          else setSavedPercent("");
        }
      }
      setIsProcessing(false);
    };
    img.src = src;
  };

  const handleManualProcess = () => {
    if (!imageSrc) return;
    processImage(imageSrc, origWidth, origHeight, targetWidth, targetHeight, fitMode, format, quality);
  };

  const handleDownload = () => {
    if (!resizedDataUrl) return;
    const ext = format === "image/png" ? "png" : format === "image/webp" ? "webp" : "jpg";
    const a = document.createElement("a");
    a.href = resizedDataUrl;
    a.download = `${fileName}-optimized-${targetWidth}x${targetHeight}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <section className="py-8 md:py-12">
      <Container narrow>
        <Breadcrumb
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Smart Image Converter & Resizer" },
          ]}
        />

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 border border-primary/20">
            ⚡ Next-Gen WebP Converter & Auto-Cropper
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Smart Image Converter & Resizer
          </h1>
          <p className="mt-2 text-muted text-sm sm:text-base">
            Automatically convert any raw photo to high-speed WebP/JPG and resize to exact standard article dimensions with zero quality loss.
          </p>
        </div>

        {/* Upload Dropzone */}
        {!imageSrc ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary/60 rounded-[var(--radius-xl)] p-12 text-center bg-card-bg cursor-pointer transition-colors shadow-sm"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
              🖼️
            </div>
            <p className="text-base font-bold text-foreground">
              Click to Upload Photo or Drag & Drop Here
            </p>
            <p className="text-xs text-muted mt-1.5">
              Supports PNG, JPG, JPEG, WEBP, GIF, SVG • Processed 100% locally on your browser
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1-CLICK PRESETS */}
            <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border-light pb-3">
                <div>
                  <h2 className="font-bold text-foreground text-sm">⚡ 1-Click Standard Tech & Editorial Presets</h2>
                  <p className="text-xs text-muted">Click any preset to automatically fit and resize instantly.</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setImageSrc(null);
                    setResizedDataUrl(null);
                  }}
                >
                  Upload New Image
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PRESETS.map((p) => {
                  const isSelected = targetWidth === p.width && targetHeight === p.height;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className={`p-3 rounded-[var(--radius)] text-left border transition-all text-xs flex flex-col justify-between ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs scale-[1.02]"
                          : "bg-surface border-border hover:border-primary/50 text-foreground"
                      }`}
                    >
                      <span className="text-base mb-1">{p.icon}</span>
                      <span className="font-bold block leading-tight">{p.label}</span>
                      <span className={`text-[11px] mt-1 ${isSelected ? "text-primary-foreground/80" : "text-muted"}`}>
                        {p.width} × {p.height} px
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CUSTOM SETTINGS & CONTROLS */}
            <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 shadow-sm space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Target Width (px)
                  </label>
                  <input
                    type="number"
                    value={targetWidth}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-input-bg border border-input-border rounded-[var(--radius)] text-foreground text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Target Height (px)
                  </label>
                  <input
                    type="number"
                    value={targetHeight}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-input-bg border border-input-border rounded-[var(--radius)] text-foreground text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Smart Crop & Fit Mode
                  </label>
                  <select
                    value={fitMode}
                    onChange={(e) => {
                      const mode = e.target.value as "cover" | "contain" | "stretch";
                      setFitMode(mode);
                      if (imageSrc) {
                        processImage(imageSrc, origWidth, origHeight, targetWidth, targetHeight, mode, format, quality);
                      }
                    }}
                    className="w-full px-3 py-2 bg-input-bg border border-input-border rounded-[var(--radius)] text-foreground text-sm cursor-pointer"
                  >
                    <option value="cover">Smart Center-Crop (Best for Articles)</option>
                    <option value="contain">Fit Full Image (With padding)</option>
                    <option value="stretch">Exact Stretch</option>
                  </select>
                </div>
              </div>

              {/* Format & Compression */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border-light">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Convert Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => {
                      setFormat(e.target.value);
                      if (imageSrc) {
                        processImage(imageSrc, origWidth, origHeight, targetWidth, targetHeight, fitMode, e.target.value, quality);
                      }
                    }}
                    className="w-full px-3 py-2 bg-input-bg border border-input-border rounded-[var(--radius)] text-foreground text-sm cursor-pointer"
                  >
                    <option value="image/webp">WebP (Recommended • Ultra Fast & Light)</option>
                    <option value="image/jpeg">JPG / JPEG (Standard)</option>
                    <option value="image/png">PNG (High Lossless)</option>
                  </select>
                </div>

                {format !== "image/png" && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-foreground">
                        Compression Quality
                      </label>
                      <span className="text-xs font-mono text-primary font-bold">
                        {Math.round(quality * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.4"
                      max="1"
                      step="0.05"
                      value={quality}
                      onChange={(e) => {
                        const q = parseFloat(e.target.value);
                        setQuality(q);
                        if (imageSrc) {
                          processImage(imageSrc, origWidth, origHeight, targetWidth, targetHeight, fitMode, format, q);
                        }
                      }}
                      className="w-full mt-2 cursor-pointer accent-primary"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border-light flex gap-3">
                <Button variant="primary" onClick={handleManualProcess} loading={isProcessing}>
                  ⚡ Re-Process Image
                </Button>
              </div>
            </div>

            {/* LIVE PREVIEW & DOWNLOAD */}
            {resizedDataUrl && (
              <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 shadow-sm text-center animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-border-light">
                  <div className="text-left">
                    <h3 className="font-bold text-foreground text-sm">Converted & Resized Output</h3>
                    <p className="text-xs text-muted">
                      Original: {origWidth}×{origHeight} px ({origFileSize}) ➡️ <strong>{targetWidth}×{targetHeight} px ({resizedFileSize})</strong>
                    </p>
                  </div>
                  {savedPercent && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/30">
                      🚀 {savedPercent}
                    </span>
                  )}
                </div>

                <div className="max-h-[450px] overflow-auto bg-surface rounded-[var(--radius)] p-4 flex items-center justify-center border border-border-light mb-6">
                  <img
                    src={resizedDataUrl}
                    alt="Resized preview"
                    className="max-h-[400px] object-contain rounded shadow-sm"
                  />
                </div>

                <div className="flex justify-center gap-3">
                  <Button variant="primary" size="lg" onClick={handleDownload}>
                    💾 Download Optimized ({resizedFileSize})
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
