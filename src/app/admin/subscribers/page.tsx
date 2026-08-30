'use client';

import React, { useEffect, useState } from "react";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";

interface SubscriberItem {
  id: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubs() {
      try {
        const res = await fetch("/api/newsletter");
        const data = await res.json();
        setSubscribers(data.subscribers || []);
      } catch (err) {
        console.error("Failed to load subscribers:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSubs();
  }, []);

  const handleExportCSV = () => {
    if (subscribers.length === 0) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Email,Status,Subscribed Date\n" +
      subscribers
        .map((s) => `"${s.email}","${s.status}","${new Date(s.createdAt).toISOString()}"`)
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `techsurround-subscribers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Newsletter Subscribers
          </h1>
          <p className="text-sm text-muted">
            Audience list and email newsletter subscriber database.
          </p>
        </div>
        {subscribers.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            📥 Export as CSV
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingState message="Loading subscribers..." />
      ) : subscribers.length > 0 ? (
        <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface border-b border-border-light text-xs font-semibold text-muted">
              <tr>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {subscribers.map((s) => (
                <tr key={s.id} className="hover:bg-surface-hover/50">
                  <td className="py-3.5 px-4 font-semibold text-foreground">{s.email}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 text-[11px] font-bold uppercase rounded ${
                        s.status === "active"
                          ? "bg-success/15 text-success"
                          : "bg-muted-foreground/15 text-muted"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-xs text-muted">
                    {new Date(s.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No subscribers yet"
          message="Subscribers who sign up on the public newsletter form will appear here."
        />
      )}
    </div>
  );
}
