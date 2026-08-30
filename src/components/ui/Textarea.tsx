import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Textarea({
  label,
  error,
  helperText,
  id,
  className = "",
  ...props
}: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`
          w-full px-3 py-2
          bg-input-bg border rounded-[var(--radius)]
          text-foreground text-sm
          placeholder:text-muted-foreground
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-input-focus/30 focus:border-input-focus
          disabled:opacity-50 disabled:cursor-not-allowed
          resize-y min-h-[100px]
          ${error ? "border-destructive focus:ring-destructive/30 focus:border-destructive" : "border-input-border"}
          ${className}
        `.trim()}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${textareaId}-error`} className="mt-1.5 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${textareaId}-helper`} className="mt-1.5 text-xs text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
}
