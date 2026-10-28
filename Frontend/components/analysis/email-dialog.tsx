"use client";

import * as React from "react";
import { X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";

interface EmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  acceptedClauses: Array<{ title: string; redline: string }>;
  contractTitle?: string;
}

export function EmailDialog({
  isOpen,
  onClose,
  acceptedClauses,
  contractTitle = "Master Services Agreement",
}: EmailDialogProps) {
  const [tone, setTone] = React.useState<"friendly" | "firm">("friendly");

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

  const generateEmailDraft = () => {
    const clausePoints = acceptedClauses.length > 0
      ? acceptedClauses.map((c, i) => `${i + 1}. ${c.title}:\n   "${c.redline}"`).join("\n\n")
      : `1. Liability Cap:\n   "The Contractor's total liability under this Agreement shall not exceed the fees paid in the preceding twelve months."\n\n2. Payment Terms:\n   "Invoices are payable within Net 30 days of receipt."`;

    if (tone === "friendly") {
      return `Hi [Client Name],

Thanks so much for sending over the ${contractTitle}! I'm really excited about partnering together on this project.

I reviewed the terms and everything looks mostly great. To ensure we're both aligned and covered from an independent contractor perspective, I have proposed a few standard adjustments below:

${clausePoints}

Please let me know if these work for your team or if you'd like me to update the Word document directly. Looking forward to kicking things off!

Best regards,
[Your Name]`;
    } else {
      return `Dear [Client Name],

Thank you for providing the ${contractTitle}. 

I have reviewed the agreement against our standard independent consulting guidelines. Before we can countersign and begin the engagement, the following provisions require revision:

${clausePoints}

These adjustments reflect standard industry liability allocation and operational terms. Please let me know once the updated draft is ready for review.

Sincerely,
[Your Name]`;
    }
  };

  const emailDraft = generateEmailDraft();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-[640px] rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[rgba(134,168,255,0.12)] border border-[rgba(134,168,255,0.25)] flex items-center justify-center text-[var(--primary)] shrink-0">
              <Mail className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h2 id="email-dialog-title" className="text-lg font-sans font-bold text-[var(--foreground)]">
                Negotiation email draft
              </h2>
              <p className="text-xs text-[var(--muted)]">
                This email covers the changes you accepted.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)] min-h-9 min-w-9 flex items-center justify-center interactive-transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tone Selector */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-[var(--muted)]">
            Select Tone:
          </span>
          <div className="flex items-center rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] p-1">
            <button
              type="button"
              onClick={() => setTone("friendly")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-sans font-bold interactive-transition min-h-9 ${
                tone === "friendly"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Friendly
            </button>
            <button
              type="button"
              onClick={() => setTone("firm")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-sans font-bold interactive-transition min-h-9 ${
                tone === "firm"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Firm
            </button>
          </div>
        </div>

        {/* Email Draft Box in Serif Font */}
        <div className="flex-1 overflow-y-auto rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] p-4 sm:p-5 font-serif text-sm leading-relaxed text-[var(--foreground)] whitespace-pre-wrap select-text">
          {emailDraft}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4 pt-3 border-t border-[var(--border)]">
          <span className="text-xs text-[var(--muted)]">
            Ready to paste into your email client.
          </span>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onClose} className="min-h-11">
              Done
            </Button>
            <CopyButton
              textToCopy={emailDraft}
              label="Copy email"
              variant="primary"
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
