import React from "react";
import Link from "next/link";
import Button from "./ui/Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  className?: string;
}

export default function Pagination({ currentPage, totalPages, basePath, className = "" }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    if (page === 1) return basePath;
    return `${basePath}?page=${page}`;
  };

  // Generate page numbers with ellipsis
  const getPages = () => {
    const pages: (number | "...")[] = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return pages;
  };

  return (
    <nav aria-label="Pagination" className={`flex items-center justify-center gap-1.5 ${className}`}>
      {/* Previous */}
      {currentPage > 1 ? (
        <Link href={getPageUrl(currentPage - 1)} aria-label="Previous page">
          <Button variant="outline" size="sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled aria-label="Previous page">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
      )}

      {/* Page numbers */}
      {getPages().map((page, index) =>
        page === "..." ? (
          <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground text-sm">
            …
          </span>
        ) : (
          <Link key={page} href={getPageUrl(page)} aria-label={`Page ${page}`}>
            <Button
              variant={page === currentPage ? "primary" : "outline"}
              size="sm"
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </Button>
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link href={getPageUrl(currentPage + 1)} aria-label="Next page">
          <Button variant="outline" size="sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled aria-label="Next page">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      )}
    </nav>
  );
}
