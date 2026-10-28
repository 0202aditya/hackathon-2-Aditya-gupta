import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, label, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-sans font-bold text-[var(--foreground)]"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            "w-full min-h-11 px-3.5 py-2.5 rounded-lg bg-[var(--surface-raised)] border text-base font-sans text-[var(--foreground)] placeholder:text-[var(--muted)]/60 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--primary)] focus-visible:outline-offset-[3px] disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-[var(--risk-high)] focus-visible:outline-[var(--risk-high)]"
              : "border-[var(--border)] hover:border-[var(--border-strong)] focus:border-[var(--border-strong)]",
            className
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="flex items-center gap-1.5 text-sm font-sans text-[var(--risk-high)] pt-0.5"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

