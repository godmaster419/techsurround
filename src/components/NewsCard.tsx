import React from "react";
import Link from "next/link";
import Badge from "./ui/Badge";

interface NewsCardProps {
  title: string;
  excerpt: string;
  slug: string;
  categoryName: string;
  categorySlug: string;
  image?: string | null;
  date: string;
  readingTime?: number;
  author?: string;
  featured?: boolean;
  className?: string;
}

export default function NewsCard({
  title,
  excerpt,
  slug,
  categoryName,
  categorySlug,
  image,
  date,
  readingTime,
  author,
  featured = false,
  className = "",
}: NewsCardProps) {
  const articleUrl = `/${categorySlug}/${slug}`;

  return (
    <article
      className={`
        group bg-card-bg border border-card-border
        rounded-[var(--radius-lg)] overflow-hidden
        shadow-[var(--card-shadow)]
        transition-all duration-200
        hover:shadow-[var(--card-shadow-hover)]
        ${featured ? "md:col-span-2 md:grid md:grid-cols-2" : ""}
        ${className}
      `.trim()}
    >
      {/* Image */}
      <Link href={articleUrl} className="block relative overflow-hidden">
        <div className={`relative ${featured ? "h-48 md:h-full" : "h-48"} bg-surface`}>
          {image ? (
            <img
              src={image}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-surface">
              <svg className="w-10 h-10 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col">
        <div className="mb-2">
          <Link href={`/${categorySlug}`}>
            <Badge variant="primary">{categoryName}</Badge>
          </Link>
        </div>

        <Link href={articleUrl} className="group/title">
          <h3
            className={`
              font-bold text-foreground line-clamp-2
              group-hover/title:text-primary transition-colors
              ${featured ? "text-lg sm:text-xl" : "text-base"}
            `.trim()}
          >
            {title}
          </h3>
        </Link>

        <p className="mt-2 text-sm text-muted line-clamp-2 flex-1">
          {excerpt}
        </p>

        <div className="mt-3 pt-3 border-t border-border-light flex items-center gap-3 text-xs text-muted-foreground">
          <time dateTime={new Date(date).toISOString()}>
            {new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
          {readingTime && (
            <>
              <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground" />
              <span>{readingTime} min read</span>
            </>
          )}
          {author && (
            <>
              <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground" />
              <span>{author}</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
