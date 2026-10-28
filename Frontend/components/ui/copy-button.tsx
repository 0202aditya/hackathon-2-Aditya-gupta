"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  textToCopy: string;
  label?: string;
  copiedLabel?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function CopyButton({
  textToCopy,
  label = "Copy wording",
  copiedLabel = "Copied",
  variant = "secondary",
  size = "default",
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    } catch {
      // Fallback for environments where clipboard API might be restricted
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      type="button"
      variant={copied ? "primary" : variant}
      size={size}
      onClick={handleCopy}
      className={cn(
        "interactive-transition min-h-11",
        copied && "bg-(--risk-low) text-(--primary-foreground) hover:bg-(--risk-low)",
        className
      )}
      aria-live="polite"
      {...props}
    >
      {copied ? (
        <>
          <Check className="w-5 h-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <span>{copiedLabel}</span>
        </>
      ) : (
        <>
          <Copy className="w-5 h-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}

