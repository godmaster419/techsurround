import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/Breadcrumb";
import { TOOLS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Free Online Technology Tools — TechSurround",
  description: "Free browser-based technology tools including Image Resizer, PDF Maker, and more. Fast, private, client-side tools.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <section className="py-8 md:py-12">
      <Container>
        <Breadcrumb items={[{ name: "Home", href: "/" }, { name: "Tools" }]} />

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Technology Tools
          </h1>
          <p className="mt-2 text-muted max-w-2xl">
            Free, fast, and secure browser-based utilities. All processing happens locally in your browser — your files never leave your device.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              href={tool.href}
              className="group bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all flex flex-col justify-between hover:border-primary/50"
            >
              <div>
                <span className="text-4xl p-3 bg-surface rounded-[var(--radius-lg)] inline-block border border-border-light">
                  {tool.icon}
                </span>
                <h2 className="mt-4 text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {tool.name}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {tool.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border-light flex items-center justify-between">
                <span className="text-xs font-semibold text-success flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  100% Client-Side
                </span>
                <span className="text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Launch Tool →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
