import React from "react";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export default function LoadingState({ message = "Loading...", className = "" }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`} role="status">
      <div className="relative">
        <div className="w-10 h-10 border-3 border-border rounded-full" />
        <div className="absolute top-0 left-0 w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="mt-4 text-sm text-muted">{message}</p>
      <span className="sr-only">{message}</span>
    </div>
  );
}

// Skeleton variants for cards
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card-bg border border-card-border rounded-[var(--radius-lg)] overflow-hidden">
          <div className="skeleton h-48 w-full" />
          <div className="p-4 space-y-3">
            <div className="skeleton h-4 w-20 rounded" />
            <div className="skeleton h-5 w-full rounded" />
            <div className="skeleton h-5 w-3/4 rounded" />
            <div className="skeleton h-4 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
