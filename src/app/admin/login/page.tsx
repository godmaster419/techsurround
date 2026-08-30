'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface">
      <div className="w-full max-w-md bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-primary/10 text-primary mb-3">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            TechSurround CMS
          </h1>
          <p className="text-sm text-muted mt-1">Sign in to manage your platform</p>
        </div>

        {error && (
          <div className="p-3 mb-5 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-[var(--radius)]" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@techsurround.com"
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          <Button type="submit" variant="primary" size="md" className="w-full mt-2" loading={loading}>
            Sign In to Dashboard
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border-light text-center">
          <a href="/" className="text-xs text-muted hover:text-foreground transition-colors">
            ← Back to TechSurround
          </a>
        </div>
      </div>
    </div>
  );
}
