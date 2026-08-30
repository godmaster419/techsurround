'use client';

import React, { useState } from "react";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/Breadcrumb";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import jsPDF from "jspdf";

export default function PdfMakerPage() {
  const [docTitle, setDocTitle] = useState<string>("My Document");
  const [docAuthor, setDocAuthor] = useState<string>("TechSurround User");
  const [content, setContent] = useState<string>("");
  const [orientation, setOrientation] = useState<"p" | "l">("p");
  const [pageSize, setPageSize] = useState<string>("a4");
  const [fontSize, setFontSize] = useState<number>(12);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPdfBlobUrl, setGeneratedPdfBlobUrl] = useState<string | null>(null);

  const handleGeneratePdf = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation,
        unit: "mm",
        format: pageSize,
      });

      // Metadata
      doc.setProperties({
        title: docTitle,
        author: docAuthor,
        creator: "TechSurround PDF Maker",
      });

      // Header title
      doc.setFontSize(22);
      doc.setTextColor(20, 20, 20);
      doc.text(docTitle, 15, 20);

      if (docAuthor) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`By ${docAuthor} • Created with TechSurround`, 15, 27);
      }

      // Separator line
      doc.setDrawColor(220, 220, 220);
      doc.line(15, 30, orientation === "p" ? 195 : 280, 30);

      // Body text with automatic line wrapping and pagination
      doc.setFontSize(fontSize);
      doc.setTextColor(40, 40, 40);

      const maxLineWidth = orientation === "p" ? 180 : 265;
      const splitText = doc.splitTextToSize(content || "No content provided.", maxLineWidth);

      let cursorY = 38;
      const pageHeight = orientation === "p" ? 280 : 190;

      for (let i = 0; i < splitText.length; i++) {
        if (cursorY > pageHeight) {
          doc.addPage();
          cursorY = 20;
        }
        doc.text(splitText[i], 15, cursorY);
        cursorY += (fontSize * 0.45);
      }

      // Output
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      setGeneratedPdfBlobUrl(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedPdfBlobUrl) return;
    const a = document.createElement("a");
    a.href = generatedPdfBlobUrl;
    a.download = `${docTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "document"}.pdf`;
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
            { name: "PDF Maker" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            PDF Maker & Document Generator
          </h1>
          <p className="mt-2 text-muted">
            Create clean, formatted PDF documents from text instantly without uploading data to any external server.
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 shadow-[var(--card-shadow)] space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Document Title"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g., Project Proposal, Summary Notes"
              />
              <Input
                label="Author Name"
                value={docAuthor}
                onChange={(e) => setDocAuthor(e.target.value)}
                placeholder="e.g., John Doe"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Orientation
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as "p" | "l")}
                  className="w-full px-3 py-2 bg-input-bg border border-input-border rounded-[var(--radius)] text-foreground text-sm cursor-pointer"
                >
                  <option value="p">Portrait</option>
                  <option value="l">Landscape</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Page Size
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value)}
                  className="w-full px-3 py-2 bg-input-bg border border-input-border rounded-[var(--radius)] text-foreground text-sm cursor-pointer"
                >
                  <option value="a4">A4 Standard</option>
                  <option value="letter">US Letter</option>
                  <option value="legal">Legal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Font Size
                </label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-input-bg border border-input-border rounded-[var(--radius)] text-foreground text-sm cursor-pointer"
                >
                  <option value="10">Small (10pt)</option>
                  <option value="12">Standard (12pt)</option>
                  <option value="14">Medium (14pt)</option>
                  <option value="16">Large (16pt)</option>
                </select>
              </div>
            </div>

            <Textarea
              label="Document Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste or write your formatted document text, report, or article notes here..."
              rows={12}
            />

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-muted">
                {content.length} characters • {content.split(/\s+/).filter(Boolean).length} words
              </span>
              <Button variant="primary" onClick={handleGeneratePdf} loading={isGenerating}>
                Generate PDF Preview
              </Button>
            </div>
          </div>

          {/* PDF Preview Frame */}
          {generatedPdfBlobUrl && (
            <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 shadow-[var(--card-shadow)] text-center animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">Generated PDF Document</h3>
                <Button variant="primary" size="sm" onClick={handleDownload}>
                  Download PDF
                </Button>
              </div>

              <iframe
                src={generatedPdfBlobUrl}
                className="w-full h-[600px] border border-border rounded-[var(--radius-lg)] bg-surface"
                title="PDF Preview"
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
