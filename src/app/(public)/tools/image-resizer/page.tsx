'use client';

import React, { useState, useRef, useEffect } from "react";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/Breadcrumb";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

export default function ImageResizerPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("image");
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [format, setFormat] = useState<string>("image/jpeg");
  const [quality, setQuality] = useState<number>(0.9);
  const [resizedDataUrl, setResizedDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [fileSize, setFileSize] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name.replace(/\.[^/.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setOrigWidth(img.naturalWidth);
        setOrigHeight(img.naturalHeight);
        setTargetWidth(img.naturalWidth);
        setTargetHeight(img.naturalHeight);
        setImageSrc(src);
        setResizedDataUrl(null);
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

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockAspectRatio && origWidth > 0) {
      setTargetHeight(Math.round((val / origWidth) * origHeight));
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockAspectRatio && origHeight > 0) {
      setTargetWidth(Math.round((val / origHeight) * origWidth));
    }
  };

  const handleResize = () => {
    if (!imageSrc || targetWidth <= 0 || targetHeight <= 0) return;
    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const dataUrl = canvas.toDataURL(format, quality);
        setResizedDataUrl(dataUrl);

        // Calculate approx file size in KB
        const head = `data:${format};base64,`;
        const sizeBytes = Math.round((dataUrl.length - head.length) * 3/4);
        setFileSize((sizeBytes / 1024).toFixed(1) + " KB");
      }
      setIsProcessing(false);
    };
    img.src = imageSrc;
  };

  const handleDownload = () => {
    if (!resizedDataUrl) return;
    const ext = format === "image/png" ? "png" : format === "image/webp" ? "webp" : "jpg";
    const a = document.createElement("a");
    a.href = resizedDataUrl;
    a.download = `${fileName}-resized-${targetWidth}x${targetHeight}.${ext}`;
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
            { name: "Image Resizer" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Image Resizer
          </h1>
          <p className="mt-2 text-muted">
            Resize, crop, and convert images directly in your browser with high quality.
          </p>
        </div>

        {/* Upload Dropzone */}
        {!imageSrc ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary/60 rounded-[var(--radius-xl)] p-12 text-center bg-card-bg cursor-pointer transition-colors"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              🖼️
            </div>
            <p className="text-base font-semibold text-foreground">
              Click to upload or drag & drop image here
            </p>
            <p className="text-xs text-muted mt-1">
              Supports JPG, PNG, WEBP, GIF, SVG (Processed 100% on your device)
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Control Panel */}
            <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 shadow-[var(--card-shadow)]">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-border-light">
                <div>
                  <h2 className="font-bold text-foreground">Original Dimensions</h2>
                  <p className="text-xs text-muted">
                    {origWidth} × {origHeight} px
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setImageSrc(null);
                    setResizedDataUrl(null);
                  }}
                >
                  Change Image
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={targetWidth}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-input-bg border border-input-border rounded-[var(--radius)] text-foreground text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    value={targetHeight}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-input-bg border border-input-border rounded-[var(--radius)] text-foreground text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="lockRatio"
                  checked={lockAspectRatio}
                  onChange={(e) => setLockAspectRatio(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
                <label htmlFor="lockRatio" className="text-sm text-foreground cursor-pointer">
                  Maintain aspect ratio
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Output Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full px-3 py-2 bg-input-bg border border-input-border rounded-[var(--radius)] text-foreground text-sm cursor-pointer"
                  >
                    <option value="image/jpeg">JPG / JPEG</option>
                    <option value="image/png">PNG</option>
                    <option value="image/webp">WebP</option>
                  </select>
                </div>

                {format !== "image/png" && (
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">
                      Quality: {Math.round(quality * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="w-full mt-2 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-border-light flex gap-3">
                <Button variant="primary" onClick={handleResize} loading={isProcessing}>
                  Process Resize
                </Button>
              </div>
            </div>

            {/* Preview & Download */}
            {resizedDataUrl && (
              <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 shadow-[var(--card-shadow)] text-center animate-in fade-in duration-300">
                <h3 className="font-bold text-foreground mb-1">Resized Output</h3>
                <p className="text-xs text-muted mb-4">
                  {targetWidth} × {targetHeight} px • Approx {fileSize}
                </p>

                <div className="max-h-96 overflow-auto bg-surface rounded-[var(--radius)] p-4 flex items-center justify-center border border-border-light mb-6">
                  <img
                    src={resizedDataUrl}
                    alt="Resized preview"
                    className="max-h-80 object-contain rounded"
                  />
                </div>

                <Button variant="primary" size="lg" onClick={handleDownload}>
                  Download Resized Image
                </Button>
              </div>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
