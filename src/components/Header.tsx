'use client';

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_NAV, MORE_NAV } from "@/lib/config";
import ThemeToggle from "./ThemeToggle";
import SearchBar from "./SearchBar";
import MobileNavigation from "./MobileNavigation";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close "More" dropdown on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close "More" on route change
  useEffect(() => {
    setMoreOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-header-bg backdrop-blur-md border-b border-header-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-foreground hover:opacity-80 transition-opacity shrink-0"
            >
              <span className="text-primary">Tech</span>
              <span>Surround</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Primary navigation">
              {PRIMARY_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-3 py-2 text-sm font-medium rounded-[var(--radius)]
                    transition-colors duration-150
                    ${
                      isActive(item.href)
                        ? "text-primary bg-primary/5"
                        : "text-muted hover:text-foreground hover:bg-surface-hover"
                    }
                  `.trim()}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.name}
                </Link>
              ))}

              {/* More dropdown */}
              <div ref={moreRef} className="relative">
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className={`
                    px-3 py-2 text-sm font-medium rounded-[var(--radius)]
                    transition-colors duration-150 flex items-center gap-1
                    ${moreOpen ? "text-primary bg-primary/5" : "text-muted hover:text-foreground hover:bg-surface-hover"}
                  `.trim()}
                  aria-expanded={moreOpen}
                  aria-haspopup="true"
                >
                  More
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {moreOpen && (
                  <div className="absolute top-full right-0 mt-1 w-52 bg-surface-elevated border border-border rounded-[var(--radius-lg)] shadow-lg py-1 z-50">
                    {MORE_NAV.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                          block px-4 py-2.5 text-sm
                          transition-colors duration-150
                          ${
                            isActive(item.href)
                              ? "text-primary bg-primary/5"
                              : "text-foreground hover:bg-surface-hover hover:text-primary"
                          }
                        `.trim()}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-1">
              {/* Search toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-[var(--radius)] text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                aria-label="Toggle search"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <ThemeToggle />

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-[var(--radius)] text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                aria-label="Open menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Expandable search bar */}
          {searchOpen && (
            <div className="pb-3 animate-in slide-in-from-top-2 duration-200">
              <SearchBar onClose={() => setSearchOpen(false)} autoFocus />
            </div>
          )}
        </div>
      </header>

      {/* Mobile navigation */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
