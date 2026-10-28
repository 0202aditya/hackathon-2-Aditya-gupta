import * as React from "react";
import { FileText, LucideIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-10 text-center flex flex-col items-center justify-center max-w-[680px] mx-auto",
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center mb-5 text-[var(--primary)]">
        <Icon className="w-7 h-7" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h3 className="heading-3 text-[var(--foreground)] mb-2">{title}</h3>
      <p className="text-base leading-relaxed text-[var(--muted)] max-w-[480px] mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

