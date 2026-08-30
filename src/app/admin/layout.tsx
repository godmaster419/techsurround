'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin", icon: "📊" },
  { name: "Articles", href: "/admin/posts", icon: "📝" },
  { name: "Categories", href: "/admin/categories", icon: "📁" },
  { name: "Tags", href: "/admin/tags", icon: "🏷️" },
  { name: "Authors", href: "/admin/authors", icon: "✍️" },
  { name: "Mobile Arrivals", href: "/admin/mobile-arrivals", icon: "📱" },
  { name: "Trending Apps", href: "/admin/trending-apps", icon: "🚀" },
  { name: "Messages", href: "/admin/messages", icon: "📬" },
  { name: "Subscribers", href: "/admin/subscribers", icon: "👥" },
  { name: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    // If on login page, don't require session check
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (!data.user) {
          router.push("/admin/login");
        } else {
          setUser(data.user);
        }
      } catch {
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-overlay lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-64 bg-surface-elevated border-r border-border
          flex flex-col justify-between transition-transform duration-300
          lg:translate-x-0 lg:static lg:z-auto
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div>
          {/* Brand header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-border">
            <Link href="/admin" className="font-extrabold text-lg text-foreground tracking-tight flex items-center gap-1.5">
              <span className="text-primary">TechSurround</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">CMS</span>
            </Link>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 text-muted hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {/* Nav items */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] text-sm font-medium transition-colors
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "text-muted hover:text-foreground hover:bg-surface-hover"
                    }
                  `}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User bar & logout */}
        <div className="p-4 border-t border-border bg-surface-hover/30">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{user?.name || "Admin"}</p>
              <p className="text-[11px] text-muted truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-muted hover:text-destructive transition-colors text-xs font-semibold rounded hover:bg-surface"
              title="Log out"
            >
              🚪 Exit
            </button>
          </div>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-surface-elevated border-b border-border flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-muted hover:text-foreground rounded-[var(--radius)] hover:bg-surface"
              aria-label="Open sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/" target="_blank" className="text-xs font-medium text-muted hover:text-primary transition-colors flex items-center gap-1">
              View Public Site ↗
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
