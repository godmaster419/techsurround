import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export default function Select({
  label,
  error,
  helperText,
  options,
  placeholder = "Select...",
  id,
  className = "",
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          w-full px-3 py-2
          bg-input-bg border rounded-[var(--radius)]
          text-foreground text-sm
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-input-focus/30 focus:border-input-focus
          disabled:opacity-50 disabled:cursor-not-allowed
          appearance-none cursor-pointer
          ${error ? "border-destructive focus:ring-destructive/30 focus:border-destructive" : "border-input-border"}
          ${className}
        `.trim()}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${selectId}-error`} className="mt-1.5 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${selectId}-helper`} className="mt-1.5 text-xs text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
}
