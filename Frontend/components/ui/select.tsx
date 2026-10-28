import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, id, options, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-sans font-bold text-(--foreground)"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            className={cn(
              "w-full min-h-11 px-3.5 py-2.5 rounded-lg bg-(--surface-raised) border text-base font-sans text-(--foreground) appearance-none cursor-pointer pr-10 transition-colors focus-visible:outline-2 focus-visible:outline-(--primary) focus-visible:outline-offset-[3px] disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-(--risk-high) focus-visible:outline-(--risk-high)"
                : "border-(--border) hover:border-(--border-strong) focus:border-(--border-strong)",
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : undefined}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-(--surface-raised) text-(--foreground)"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-(--muted) pointer-events-none"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </div>
        {error && (
          <p
            id={`${selectId}-error`}
            className="flex items-center gap-1.5 text-sm font-sans text-(--risk-high) pt-0.5"
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
Select.displayName = "Select";

