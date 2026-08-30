import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider, themeScript } from "@/context/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techsurround.com";

export const metadata: Metadata = {
  title: {
    default: "TechSurround — Technology, Explained Simply",
    template: "%s | TechSurround",
  },
  description:
    "Your trusted source for technology news, cyber security, mobile arrivals, trending apps, gadgets, AI, and technology tools. Stay informed with TechSurround.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "TechSurround",
    title: "TechSurround — Technology, Explained Simply",
    description:
      "Your trusted source for technology news, cyber security, mobile arrivals, trending apps, gadgets, AI, and technology tools.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechSurround — Technology, Explained Simply",
    description:
      "Your trusted source for technology news, cyber security, mobile arrivals, trending apps, gadgets, AI, and technology tools.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
