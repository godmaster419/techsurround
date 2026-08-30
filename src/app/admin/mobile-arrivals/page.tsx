'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";

interface MobileItem {
  id: string;
  brand: string;
  name: string;
  slug: string;
  price?: string;
  releaseDate?: string;
  primaryImage?: string;
}

export default function AdminMobileArrivalsPage() {
  const [arrivals, setArrivals] = useState<MobileItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadArrivals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mobile-arrivals?limit=50");
      const data = await res.json();
      setArrivals(data.arrivals || []);
    } catch (err) {
      console.error("Failed to load arrivals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArrivals();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/mobile-arrivals/${id}`, { method: "DELETE" });
      if (res.ok) {
        setArrivals(arrivals.filter((a) => a.id !== id));
      }
    } catch {
      alert("Delete failed.");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            New Mobile Arrivals
          </h1>
          <p className="text-sm text-muted">Manage smartphone database and full specification sheets.</p>
        </div>
        <Link href="/admin/mobile-arrivals/new">
          <Button variant="primary" size="md">
            + Add Smartphone / Device
          </Button>
        </Link>
      </div>

      {loading ? (
        <LoadingState message="Loading mobile arrivals..." />
      ) : arrivals.length > 0 ? (
        <div className="bg-card-bg border border-card-border rounded-[var(--radius-xl)] overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface border-b border-border-light text-xs font-semibold text-muted">
              <tr>
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Release</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {arrivals.map((d) => (
                <tr key={d.id} className="hover:bg-surface-hover/50">
                  <td className="py-3.5 px-4 font-semibold text-foreground flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-surface border border-border flex items-center justify-center p-1 overflow-hidden shrink-0">
                      {d.primaryImage ? (
                        <img src={d.primaryImage} alt={d.name} className="max-h-full object-contain" />
                      ) : (
                        "📱"
                      )}
                    </div>
                    <span>{d.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-muted font-medium">{d.brand}</td>
                  <td className="py-3.5 px-4 font-semibold text-foreground">{d.price || "—"}</td>
                  <td className="py-3.5 px-4 text-xs text-muted">{d.releaseDate || "—"}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(d.id, d.name)}
                      className="px-2 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No mobile devices added"
          message="Add your first smartphone specification entry."
          action={
            <Link href="/admin/mobile-arrivals/new">
              <Button variant="primary" size="sm">+ Add Smartphone</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
