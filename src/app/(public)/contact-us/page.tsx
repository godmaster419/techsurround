'use client';

import React, { useState } from "react";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/Breadcrumb";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.subject.trim()) e.subject = "Subject is required.";
    if (!form.message.trim()) e.message = "Message is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    setServerError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "Failed to send message.");
        setStatus("error");
        return;
      }
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setServerError("Unable to send message. Please try again later.");
      setStatus("error");
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
    if (status === "error") setStatus("idle");
  };

  return (
    <section className="py-8 md:py-12">
      <Container narrow>
        <Breadcrumb items={[{ name: "Home", href: "/" }, { name: "Contact Us" }]} />

        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-2">
          Contact Us
        </h1>
        <p className="text-muted mb-8">
          Have a question, tip, or feedback? We&apos;d love to hear from you.
        </p>

        {status === "success" ? (
          <div className="p-6 bg-success/10 border border-success/20 rounded-[var(--radius-lg)] text-center">
            <svg className="w-10 h-10 text-success mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-lg font-bold text-foreground">Message Sent!</h2>
            <p className="text-sm text-muted mt-1">Thank you for reaching out. We&apos;ll get back to you soon.</p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={errors.name}
              placeholder="Your full name"
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={errors.email}
              placeholder="your@email.com"
              required
            />
            <Input
              label="Subject"
              value={form.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              error={errors.subject}
              placeholder="What is this about?"
              required
            />
            <Textarea
              label="Message"
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
              error={errors.message}
              placeholder="Your message..."
              rows={5}
              required
            />

            {serverError && (
              <p className="text-sm text-destructive" role="alert">{serverError}</p>
            )}

            <Button type="submit" loading={status === "loading"}>
              Send Message
            </Button>
          </form>
        )}
      </Container>
    </section>
  );
}
