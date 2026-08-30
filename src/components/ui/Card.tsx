import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: boolean;
  as?: "div" | "article" | "section";
}

export default function Card({
  children,
  className = "",
  hover = true,
  padding = true,
  as: Component = "div",
}: CardProps) {
  return (
    <Component
      className={`
        bg-card-bg border border-card-border
        rounded-[var(--radius-lg)] overflow-hidden
        shadow-[var(--card-shadow)]
        ${hover ? "transition-shadow duration-200 hover:shadow-[var(--card-shadow-hover)]" : ""}
        ${padding ? "p-4 sm:p-5" : ""}
        ${className}
      `.trim()}
    >
      {children}
    </Component>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return <div className={`mb-3 ${className}`}>{children}</div>;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={className}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div className={`mt-3 pt-3 border-t border-border-light flex items-center gap-3 ${className}`}>
      {children}
    </div>
  );
}
