import React from "react";

type BadgeVariant = "default" | "primary" | "secondary" | "accent" | "outline" | "destructive" | "success" | "warning";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-badge-bg text-badge-text",
  primary: "bg-primary/10 text-primary",
  secondary: "bg-surface-elevated text-muted",
  accent: "bg-accent/10 text-accent",
  outline: "border border-border text-muted bg-transparent",
  destructive: "bg-destructive/10 text-destructive",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

export default function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5
        text-xs font-semibold rounded-full
        whitespace-nowrap
        ${variantClasses[variant]}
        ${className}
      `.trim()}
    >
      {children}
    </span>
  );
}
