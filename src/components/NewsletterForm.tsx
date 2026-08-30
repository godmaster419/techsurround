'use client';

import React, { useState } from "react";

interface NewsletterFormProps {
  variant?: "light" | "dark";
  className?: string;
}

export default function NewsletterForm({ variant = "light", className = "" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setErrorMsg("Please enter your email address.");
      setStatus("error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setEmail("");
    } catch {
      setErrorMsg("Unable to subscribe. Please try again later.");
      setStatus("error");
    }
  };

  const isDark = variant === "dark";

  if (status === "success") {
    return (
      <div className={`flex items-center gap-2 py-2 ${className}`}>
        <svg className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span className={`text-sm ${isDark ? "text-white" : "text-foreground"}`}>
          Thank you for subscribing!
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`${className}`}>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") {
              setStatus("idle");
              setErrorMsg("");
            }
          }}
          placeholder="Enter your email"
          className={`
            flex-1 min-w-0 px-3.5 py-2.5 text-sm rounded-[var(--radius)]
            border transition-colors
            focus:outline-none focus:ring-2
            ${
              isDark
                ? "bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-primary/40 focus:border-primary"
                : "bg-input-bg border-input-border text-foreground placeholder:text-muted-foreground focus:ring-input-focus/30 focus:border-input-focus"
            }
          `.trim()}
          aria-label="Email for newsletter"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-[var(--radius)] hover:bg-primary-hover transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </div>
      {errorMsg && (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {errorMsg}
        </p>
      )}
    </form>
  );
}
