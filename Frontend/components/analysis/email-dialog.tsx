"use client";

import * as React from "react";
import { X, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";

export interface AiNegotiationEmail {
  subject: string;
  body: string;
}

interface EmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  acceptedClauses: Array<{ title: string; redline: string }>;
  contractTitle?: string;
  aiNegotiationEmail?: AiNegotiationEmail | null;
}

export function EmailDialog({
  isOpen,
  onClose,
  acceptedClauses = [],
  contractTitle = "Master Services Agreement",
  aiNegotiationEmail,
}: EmailDialogProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const currentSubject = React.useMemo(() => {
    if (aiNegotiationEmail?.subject) {
      return aiNegotiationEmail.subject;
    }
    return `Proposed Adjustments - ${contractTitle}`;
  }, [aiNegotiationEmail, contractTitle]);

  const currentBody = React.useMemo(() => {
    if (aiNegotiationEmail?.body) {
      return aiNegotiationEmail.body;
    }

    const clausePoints =
      acceptedClauses && acceptedClauses.length > 0
        ? acceptedClauses
            .map((c, i) => `${i + 1}. ${c.title}:\n   "${c.redline}"`)
            .join("\n\n")
        : `1. Limitation of Liability:\n   "The Contractor's total liability under this Agreement shall not exceed the fees paid in the preceding twelve months."\n\n2. Intellectual Property:\n   "IP rights transfer upon full payment of relevant invoices."`;

    return `Hi [Client Name],

Thanks so much for sending over the ${contractTitle}! I'm excited about partnering together on this project.

I reviewed the terms and everything looks mostly great. To ensure we're both aligned and covered from an independent contractor perspective, I have proposed a few standard adjustments below:

${clausePoints}

Please let me know if these work for your team or if you'd like me to update the Word document directly. Looking forward to kicking things off!

Best regards,
[Your Name]`;
  }, [aiNegotiationEmail, acceptedClauses, contractTitle]);

  if (!isOpen) return null;

  const fullEmailToCopy = `Subject: ${currentSubject}\n\n${currentBody}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="w-full max-w-160 rounded-2xl bg-(--surface) border border-(--border) p-6 sm:p-8 space-y-5 shadow-2xl animate-scale-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-(--border)">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[rgba(134,168,255,0.12)] border border-[rgba(134,168,255,0.25)] flex items-center justify-center text-(--primary) shrink-0">
              <Mail className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h2 id="email-dialog-title" className="text-lg font-sans font-bold text-white">
                Negotiation email draft
              </h2>
              <p className="text-xs text-zinc-400">
                AI-generated negotiation strategy based on full contract analysis.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-(--surface-raised) min-h-9 min-w-9 flex items-center justify-center interactive-transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subject Line Bar */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-(--surface-raised) border border-(--border)">
          <span className="text-xs font-bold text-zinc-400 font-sans uppercase shrink-0">
            Subject:
          </span>
          <span className="text-sm font-sans font-medium text-white truncate">
            {currentSubject}
          </span>
        </div>

        {/* Email Draft Box in Crisp Serif Font */}
        <div className="flex-1 overflow-y-auto rounded-xl bg-(--surface-raised) border border-(--border) p-4 sm:p-5 font-serif text-sm sm:text-base leading-relaxed text-zinc-100 whitespace-pre-wrap select-text">
          {currentBody}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4 pt-3 border-t border-(--border)">
          <span className="text-xs text-zinc-400">
            Ready to paste into your email client.
          </span>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onClose} className="min-h-11 font-bold">
              Done
            </Button>
            <CopyButton
              textToCopy={fullEmailToCopy}
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
