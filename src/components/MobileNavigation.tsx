'use client';

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_NAV_GROUPS } from "@/lib/config";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Focus trap and escape key
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();

        if (e.key === "Tab" && navRef.current) {
          const focusable = navRef.current.querySelectorAll<HTMLElement>(
            'a, button, [tabindex]:not([tabindex="-1"])'
          );
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
        previousFocus.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-40 bg-overlay
          transition-opacity duration-300
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `.trim()}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Navigation panel */}
      <nav
        ref={navRef}
        className={`
          fixed top-0 right-0 z-50
          h-full w-[min(320px,85vw)]
          bg-surface-elevated border-l border-border
          shadow-2xl overflow-y-auto
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `.trim()}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="text-lg font-bold text-foreground tracking-tight">Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded-[var(--radius)] text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation groups */}
        <div className="py-3">
          {MOBILE_NAV_GROUPS.map((group, gi) => (
            <div key={group.title}>
              {gi > 0 && <div className="mx-5 my-2 border-t border-border-light" />}
              <div className="px-5 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </span>
              </div>
              <ul>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`
                          block px-5 py-2.5 text-sm font-medium
                          transition-colors duration-150
                          ${
                            isActive
                              ? "text-primary bg-primary/5 border-r-2 border-primary"
                              : "text-foreground hover:bg-surface-hover hover:text-primary"
                          }
                        `.trim()}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}
