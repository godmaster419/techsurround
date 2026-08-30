'use client';

import React, { useState } from "react";
import jsPDF from "jspdf";

interface ArticlePdfDownloadProps {
  title: string;
  categoryName?: string;
  authorName?: string;
  publishedDate?: string;
  readingTime?: number;
  excerpt?: string;
  contentHtml?: string;
  articleUrl?: string;
  slug?: string;
  variant?: "button" | "card";
}

export default function ArticlePdfDownload({
  title,
  categoryName = "Technology",
  authorName = "TechSurround Editorial",
  publishedDate,
  readingTime = 4,
  excerpt = "",
  contentHtml = "",
  articleUrl = "",
  slug = "article",
  variant = "card",
}: ArticlePdfDownloadProps) {
  const [generating, setGenerating] = useState(false);

  const generateAndDownloadPdf = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 18;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // Helper for page break check
      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin - 15) {
          addFooter();
          doc.addPage();
          y = margin + 10;
          addHeader();
        }
      };

      const addHeader = () => {
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 8, "F");
        doc.setFillColor(13, 148, 136); // teal-600 accent strip
        doc.rect(0, 8, pageWidth, 1.5, "F");

        doc.setFontSize(7.5);
        doc.setTextColor(203, 213, 225);
        doc.setFont("helvetica", "bold");
        doc.text("TECHSURROUND — FUTURE OF TECHNOLOGY & INNOVATION", margin, 5.5);
      };

      const addFooter = () => {
        const pageCount = doc.getNumberOfPages();
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.setFont("helvetica", "normal");
        doc.text("Official Publication • techsurround.com", margin, pageHeight - 7);
        doc.text(
          `Page ${pageCount}`,
          pageWidth - margin - 12,
          pageHeight - 7
        );
      };

      // 1. Initial Page Header
      addHeader();
      y += 10;

      // 2. Category & Date Pill
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, y, 40, 6.5, 1.5, 1.5, "F");
      doc.setFontSize(7.5);
      doc.setTextColor(13, 148, 136);
      doc.setFont("helvetica", "bold");
      doc.text(categoryName.toUpperCase(), margin + 3, y + 4.5);

      if (publishedDate) {
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "normal");
        doc.text(publishedDate, margin + 46, y + 4.5);
      }
      y += 12;

      // 3. Article Title
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      const titleLines = doc.splitTextToSize(title, contentWidth);
      doc.text(titleLines, margin, y);
      y += titleLines.length * 7.5 + 2;

      // 4. Metadata Line (Author & Read Time)
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.text(
        `By ${authorName}   •   ${readingTime} min read   •   TechSurround Verified`,
        margin,
        y
      );
      y += 6;

      // Divider Line
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.4);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      // 5. Excerpt / Summary Box (if present)
      if (excerpt) {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        const excerptLines = doc.splitTextToSize(excerpt, contentWidth - 10);
        const boxHeight = excerptLines.length * 4.5 + 8;

        checkPageBreak(boxHeight);
        doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, "FD");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.setFont("helvetica", "italic");
        doc.text(excerptLines, margin + 5, y + 6);
        y += boxHeight + 8;
      }

      // 6. Parse Article Body (HTML to text sections)
      if (contentHtml) {
        // Strip tags and split into logical paragraph sections
        const cleanContent = contentHtml
          .replace(/<figcaption[^>]*>.*?<\/figcaption>/gi, "\n[Caption: $&]\n")
          .replace(/<h[2-4][^>]*>(.*?)<\/h[2-4]>/gi, "\n\n### $1\n\n")
          .replace(/<li[^>]*>(.*?)<\/li>/gi, "\n• $1")
          .replace(/<p[^>]*>/gi, "\n\n")
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<[^>]*>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();

        const blocks = cleanContent.split(/\n\n+/);

        for (const block of blocks) {
          const trimmed = block.trim();
          if (!trimmed) continue;

          // Headings (starts with ###)
          if (trimmed.startsWith("###")) {
            const headingText = trimmed.replace(/^###\s*/, "").replace(/\[Caption:.*?\]/g, "");
            checkPageBreak(16);
            y += 4;
            doc.setFontSize(12);
            doc.setTextColor(15, 23, 42);
            doc.setFont("helvetica", "bold");
            const hLines = doc.splitTextToSize(headingText, contentWidth);
            doc.text(hLines, margin, y);
            y += hLines.length * 5 + 3;
          } else {
            // Standard Paragraph
            doc.setFontSize(9.5);
            doc.setTextColor(51, 65, 85);
            doc.setFont("helvetica", "normal");

            const pLines = doc.splitTextToSize(trimmed, contentWidth);
            checkPageBreak(pLines.length * 4.8 + 4);
            doc.text(pLines, margin, y);
            y += pLines.length * 4.8 + 4;
          }
        }
      }

      // 7. QR / Article Source Link Box at end
      checkPageBreak(25);
      y += 6;
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "F");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "bold");
      doc.text("ORIGINAL ONLINE SOURCE & LATEST UPDATES", margin + 6, y + 6);
      doc.setFontSize(7.5);
      doc.setTextColor(13, 148, 136);
      doc.setFont("helvetica", "normal");
      doc.text(articleUrl || "https://techsurround.com", margin + 6, y + 12);

      // Add footer to final page
      addFooter();

      // Download file
      doc.save(`techsurround-${slug || "article"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={generateAndDownloadPdf}
        disabled={generating}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-elevated hover:bg-surface-hover text-xs font-semibold text-foreground border border-border transition-colors shadow-xs"
        title="Download high-resolution standard PDF"
      >
        {generating ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <span>📄</span>
            <span>Download PDF</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-br from-surface to-surface-elevated border border-card-border rounded-[var(--radius-xl)] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 not-prose my-8">
      <div className="flex items-start gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl shrink-0 border border-primary/20">
          📄
        </div>
        <div>
          <h3 className="font-extrabold text-foreground text-base tracking-tight">
            Read Offline: Download Standard Article PDF
          </h3>
          <p className="text-xs text-muted mt-1 leading-relaxed max-w-lg">
            Save a beautifully formatted, magazine-grade PDF of this article with all headings, analysis, and official TechSurround verification for offline reading or printing.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={generateAndDownloadPdf}
        disabled={generating}
        className="px-5 py-2.5 rounded-[var(--radius-lg)] bg-primary text-primary-foreground hover:bg-primary-hover font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-70 cursor-pointer"
      >
        {generating ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Generating Standard PDF...</span>
          </>
        ) : (
          <>
            <span>📥</span>
            <span>Download PDF (Instant)</span>
          </>
        )}
      </button>
    </div>
  );
}
