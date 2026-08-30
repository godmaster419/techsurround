import React from "react";
import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  description?: string;
  href?: string;
  linkText?: string;
  className?: string;
}

export default function SectionHeader({
  title,
  description,
  href,
  linkText = "View All",
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex items-end justify-between gap-4 mb-6 ${className}`}>
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted max-w-xl">{description}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="text-sm font-medium text-primary hover:text-primary-hover transition-colors whitespace-nowrap flex items-center gap-1"
        >
          {linkText}
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}
