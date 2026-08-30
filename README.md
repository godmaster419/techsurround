# TechSurround — Modern Technology News & Tools Platform

TechSurround is a complete, production-grade technology publication and digital utility platform built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Prisma ORM**.

---

## 🌟 Key Features

### 📰 Public Tech Publication
- **Editorial Homepage:** Featuring hero article showcase, latest tech news, trending stories, smartphone highlights, categorized channels, trending applications, and client-side utilities.
- **Categorized News Channels:** Technology, Cyber Security, Cyber Crime, AI, Gadgets, Mobile & Apps, Software, New Tech Arrivals, New Mobile Arrivals, Trending Apps, and Tools.
- **Full Article Reader:** Responsive typography, estimated reading time, author profile cards, automated table of contents, tag indexing, social sharing, and related article recommendations.
- **Global Search:** Instant multi-category search across articles, mobile devices, and trending applications.
- **Theme Support:** Dark Mode & Light Mode with anti-flash script and system preference sync.

### 📱 New Mobile Arrivals Database
- **Device Catalog:** High-res device cards, brand filter pills, and pricing tags.
- **Detailed Specification Sheets:** Display, Performance, Camera system, Battery & charging, 5G/Connectivity, SIM, Software/OS, Build materials & IP rating, Audio, and Biometrics.

### 🛠️ Privacy-First Technology Tools (100% Client-Side)
- **Image Resizer:** Client-side HTML5 canvas image resizing, aspect ratio locking, quality control slider, and format conversion (PNG, JPG, WebP).
- **PDF Maker:** Instant document and notes to PDF generator powered by `jspdf` with layout orientation and typography settings.

### 🛡️ CMS & Admin Management Portal
- **Dashboard Metrics:** Live stats for articles, categories, devices, apps, subscribers, and contact inquiries.
- **Article Authoring:** Powered by **TipTap** WYSIWYG editor with live preview, headings, blockquotes, code blocks, and image insertion.
- **Taxonomy & Profiles:** Category, tag, and author bio manager.
- **Device & App Manager:** Comprehensive entry forms for new smartphones and trending apps.
- **Audience & Inquiries:** Contact message viewer with mailto responses, and newsletter subscribers database with one-click CSV export.
- **Platform Settings:** Modify site metadata, SEO defaults, social handles, and Google verification tokens.

### 🚀 SEO & Schema.org Integration
- **JSON-LD Structured Data:** `NewsArticle`, `Organization`, `WebSite`, `Person`, and `BreadcrumbList`.
- **Dynamic XML Sitemap:** Automatically generated at `/sitemap.xml`.
- **Search Engine Directives:** Managed via `/robots.txt`.

---

## 📦 Tech Stack

- **Framework:** Next.js 16 (App Router + Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + Vanilla CSS Variables Design System
- **Database & ORM:** SQLite (dev) / PostgreSQL (production) with Prisma ORM
- **Editor:** TipTap (Headless, Extensible)
- **Auth:** JWT Sessions in Secure HTTP-Only Cookies + bcrypt password hashing + Rate Limiting
- **Document Tools:** jsPDF

---

## 🚀 Getting Started

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/techsurround.git
cd techsurround

# Install dependencies
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Setup Database & Seed Initial Content
```bash
# Push schema to SQLite / PostgreSQL
npx prisma db push

# Seed initial categories, admin account, and demo articles
npx tsx src/lib/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```

Visit:
- **Public Website:** `http://localhost:3000`
- **Admin CMS Portal:** `http://localhost:3000/admin`

---

## 🔐 Default Admin Credentials

- **Email:** `admin@techsurround.com`
- **Password:** `admin123`

*(Note: Change your password in production settings)*

---

## 🌐 Production Deployment

### Deploy on Vercel
1. Push your repository to GitHub.
2. Import project into Vercel.
3. Configure `DATABASE_URL` (e.g. Neon PostgreSQL, Supabase, or Railway).
4. Set `AUTH_SECRET` to a strong random string.
5. Deploy!

---

## 📄 License

MIT License © TechSurround.
