import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "main" | "article";
  narrow?: boolean;
}

export default function Container({
  children,
  className = "",
  as: Component = "div",
  narrow = false,
}: ContainerProps) {
  return (
    <Component
      className={`
        mx-auto w-full px-4 sm:px-6 lg:px-8
        ${narrow ? "max-w-4xl" : "max-w-7xl"}
        ${className}
      `.trim()}
    >
      {children}
    </Component>
  );
}
