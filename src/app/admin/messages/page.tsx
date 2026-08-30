'use client';

import React, { useEffect, useState } from "react";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";

interface MessageItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await fetch("/api/contact");
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMessages();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
          Inquiries & Contact Messages
        </h1>
        <p className="text-sm text-muted">
          Messages received through the public Contact Us form.
        </p>
      </div>

      {loading ? (
        <LoadingState message="Loading messages..." />
      ) : messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] p-6 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-light pb-3">
                <div>
                  <span className="font-bold text-foreground text-sm">{m.name}</span>
                  <span className="text-xs text-muted ml-2">&lt;{m.email}&gt;</span>
                </div>
                <span className="text-xs text-muted">
                  {new Date(m.createdAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Subject</p>
                <p className="font-bold text-foreground text-base mt-0.5">{m.subject}</p>
              </div>

              <div className="p-4 rounded-[var(--radius)] bg-surface text-sm text-foreground whitespace-pre-wrap">
                {m.message}
              </div>

              <div className="pt-2">
                <a
                  href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  Reply via Email ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Inbox is empty"
          message="No contact messages have been received yet."
        />
      )}
    </div>
  );
}
