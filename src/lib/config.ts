import React from "react";

// --- Types ---
export interface CategoryInfo {
  name: string;
  slug: string;
  description: string;
}

// --- Categories ---
export const CATEGORIES: CategoryInfo[] = [
  {
    name: "Technology",
    slug: "technology",
    description: "Latest technology news, trends, and innovations shaping the digital world.",
  },
  {
    name: "Cyber Crime",
    slug: "cyber-crime",
    description: "Coverage of cyber crimes, data breaches, hacking incidents, and digital fraud.",
  },
  {
    name: "Cyber Security",
    slug: "cyber-security",
    description: "Cyber security news, threat analysis, vulnerability reports, and protection strategies.",
  },
  {
    name: "New Mobile Arrivals",
    slug: "new-mobile-arrivals",
    description: "Latest smartphones and mobile device launches, specifications, and pricing.",
  },
  {
    name: "New Tech Arrivals",
    slug: "new-tech-arrivals",
    description: "New technology product launches, gadget releases, and hardware announcements.",
  },
  {
    name: "Trending Apps",
    slug: "trending-apps",
    description: "Trending applications, popular app updates, and emerging digital tools.",
  },
  {
    name: "AI",
    slug: "ai",
    description: "Artificial intelligence news, machine learning developments, and AI innovations.",
  },
  {
    name: "Gadgets",
    slug: "gadgets",
    description: "Gadget reviews, tech accessory news, and consumer electronics coverage.",
  },
  {
    name: "Mobile & Apps",
    slug: "mobile-apps",
    description: "Mobile technology, app reviews, smartphone tips, and mobile ecosystem coverage.",
  },
  {
    name: "Software",
    slug: "software",
    description: "Software news, application updates, SaaS platforms, and development tools.",
  },
  {
    name: "Tools",
    slug: "tools",
    description: "Free browser-based technology tools — image resizer, PDF maker, and more.",
  },
];

// --- Navigation Structure ---
export interface NavItem {
  name: string;
  href: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const PRIMARY_NAV: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Technology", href: "/technology" },
  { name: "Cyber Crime", href: "/cyber-crime" },
  { name: "Cyber Security", href: "/cyber-security" },
  { name: "New Mobile Arrivals", href: "/new-mobile-arrivals" },
  { name: "AI", href: "/ai" },
  { name: "Gadgets", href: "/gadgets" },
  { name: "Tools", href: "/tools" },
];

export const MORE_NAV: NavItem[] = [
  { name: "New Tech Arrivals", href: "/new-tech-arrivals" },
  { name: "Trending Apps", href: "/trending-apps" },
  { name: "Mobile & Apps", href: "/mobile-apps" },
  { name: "Software", href: "/software" },
];

export const MOBILE_NAV_GROUPS: NavGroup[] = [
  {
    title: "Main",
    items: [
      { name: "Home", href: "/" },
      { name: "Technology", href: "/technology" },
      { name: "Cyber Security", href: "/cyber-security" },
      { name: "Cyber Crime", href: "/cyber-crime" },
    ],
  },
  {
    title: "Mobile",
    items: [
      { name: "New Mobile Arrivals", href: "/new-mobile-arrivals" },
      { name: "Mobile & Apps", href: "/mobile-apps" },
      { name: "Gadgets", href: "/gadgets" },
    ],
  },
  {
    title: "Technology",
    items: [
      { name: "New Tech Arrivals", href: "/new-tech-arrivals" },
      { name: "AI", href: "/ai" },
      { name: "Software", href: "/software" },
      { name: "Trending Apps", href: "/trending-apps" },
    ],
  },
  {
    title: "Tools",
    items: [
      { name: "Tools", href: "/tools" },
      { name: "Image Resizer", href: "/tools/image-resizer" },
      { name: "PDF Maker", href: "/tools/pdf-maker" },
    ],
  },
  {
    title: "Company",
    items: [
      { name: "About Us", href: "/about-us" },
      { name: "Contact Us", href: "/contact-us" },
    ],
  },
];

// --- Tools ---
export interface ToolInfo {
  name: string;
  slug: string;
  description: string;
  icon: string; // emoji or icon name
  href: string;
}

export const TOOLS: ToolInfo[] = [
  {
    name: "Image Resizer",
    slug: "image-resizer",
    description: "Resize images to any dimension while maintaining quality. Supports JPEG, PNG, and WebP.",
    icon: "🖼️",
    href: "/tools/image-resizer",
  },
  {
    name: "PDF Maker",
    slug: "pdf-maker",
    description: "Create PDF documents with text and images. Simple, fast, and completely free.",
    icon: "📄",
    href: "/tools/pdf-maker",
  },
];

// --- Footer Links ---
export const FOOTER_LINKS = {
  about: [
    { name: "About Us", href: "/about-us" },
    { name: "Contact Us", href: "/contact-us" },
    { name: "Editorial Policy", href: "/editorial-policy" },
  ],
  categories: [
    { name: "Technology", href: "/technology" },
    { name: "Cyber Security", href: "/cyber-security" },
    { name: "AI", href: "/ai" },
    { name: "Gadgets", href: "/gadgets" },
    { name: "Mobile & Apps", href: "/mobile-apps" },
  ],
  tools: [
    { name: "All Tools", href: "/tools" },
    { name: "Image Resizer", href: "/tools/image-resizer" },
    { name: "PDF Maker", href: "/tools/pdf-maker" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Conditions", href: "/terms-and-conditions" },
    { name: "Disclaimer", href: "/disclaimer" },
  ],
};

// --- Helpers ---
export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const slugify = generateSlug;

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + "…";
}

