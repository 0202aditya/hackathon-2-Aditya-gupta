"use client";

import * as React from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete review",
  cancelLabel = "Keep it",
  isDestructive = true,
}: ConfirmDialogProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div
        className="w-full max-w-[420px] rounded-2xl bg-(--surface) border border-(--border) p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[rgba(255,122,122,0.12)] border border-[rgba(255,122,122,0.3)] flex items-center justify-center text-(--risk-high) shrink-0">
              <AlertTriangle className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <h2 id="dialog-title" className="text-lg font-sans font-bold text-(--foreground)">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-(--muted) hover:text-(--foreground) hover:bg-(--surface-raised) min-h-9 min-w-9 flex items-center justify-center interactive-transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm leading-relaxed text-(--muted)">
          {description}
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-(--border)">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="min-h-11 px-4"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "destructive" : "primary"}
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="min-h-11 px-4"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

