const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techsurround.com";

// --- Organization Schema ---
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TechSurround",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [],
  };
}

// --- WebSite Schema with SearchAction ---
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TechSurround",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// --- Article Schema ---
export function generateArticleSchema({
  title,
  description,
  image,
  authorName,
  publishedAt,
  updatedAt,
  url,
}: {
  title: string;
  description: string;
  image?: string | null;
  authorName?: string;
  publishedAt: string;
  updatedAt?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description,
    image: image ? [image] : undefined,
    author: authorName
      ? { "@type": "Person", name: authorName }
      : { "@type": "Organization", name: "TechSurround" },
    publisher: {
      "@type": "Organization",
      name: "TechSurround",
      logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
    },
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

// --- WebPage Schema ---
export function generateWebPageSchema({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    publisher: {
      "@type": "Organization",
      name: "TechSurround",
    },
  };
}

// --- Person Schema ---
export function generatePersonSchema({
  name,
  image,
  bio,
  url,
}: {
  name: string;
  image?: string | null;
  bio?: string | null;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    image: image || undefined,
    description: bio || undefined,
    url,
  };
}
