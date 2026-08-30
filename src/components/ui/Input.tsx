import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-3 py-2
          bg-input-bg border rounded-[var(--radius)]
          text-foreground text-sm
          placeholder:text-muted-foreground
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-input-focus/30 focus:border-input-focus
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-destructive focus:ring-destructive/30 focus:border-destructive" : "border-input-border"}
          ${className}
        `.trim()}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
}
