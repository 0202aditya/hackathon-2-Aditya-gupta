"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { RiskBadge, RiskLevel } from "@/components/ui/risk-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  FileText,
  Trash2,
  ExternalLink,
  Plus,
  Calendar,
  Layers,
} from "lucide-react";

interface ContractReviewItem {
  id: string;
  title: string;
  type: string;
  date: string;
  riskLevel: RiskLevel;
  riskScore: number;
  clauseCount: number;
}

const INITIAL_REVIEWS: ContractReviewItem[] = [
  {
    id: "acme-msa",
    title: "Acme Corp Master Services Agreement",
    type: "Service Agreement",
    date: "Oct 24, 2026",
    riskLevel: "high",
    riskScore: 78,
    clauseCount: 14,
  },
  {
    id: "fintech-nda",
    title: "Fintech Platform Non-Disclosure Agreement",
    type: "NDA",
    date: "Oct 18, 2026",
    riskLevel: "medium",
    riskScore: 54,
    clauseCount: 8,
  },
  {
    id: "consulting-sow",
    title: "Consulting SOW & IP Assignment",
    type: "SOW",
    date: "Oct 12, 2026",
    riskLevel: "high",
    riskScore: 82,
    clauseCount: 11,
  },
  {
    id: "retainer-dev",
    title: "Standard Development Retainer",
    type: "Service Agreement",
    date: "Oct 05, 2026",
    riskLevel: "low",
    riskScore: 22,
    clauseCount: 6,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [reviews, setReviews] = React.useState<ContractReviewItem[]>(INITIAL_REVIEWS);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleDelete = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setDeletingId(null);
  };

  const handleReset = () => {
    setReviews(INITIAL_REVIEWS);
  };

  const handleClearAll = () => {
    setReviews([]);
  };

  return (
    <AppShell userEmail="contractor@example.com">
      <div className="max-w-[1120px] mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
          <div>
            <h1 className="heading-2 text-[var(--foreground)]">Your reviews</h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Review what you signed, see flagged risks, and check replacement language.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Helper to toggle empty vs populated for UI testing */}
            <button
              type="button"
              onClick={reviews.length === 0 ? handleReset : handleClearAll}
              className="text-xs font-sans text-[var(--muted)] hover:text-[var(--foreground)] underline p-2"
              title="Toggle mock empty state"
            >
              {reviews.length === 0 ? "Show mock reviews" : "Preview empty state"}
            </button>

            <Link href="/analyses/new">
              <Button variant="primary" className="min-h-11 gap-2">
                <Plus className="w-5 h-5" strokeWidth={2} />
                <span>Review a contract</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Reviews List or Empty State */}
        {reviews.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No contracts reviewed yet."
            description="Upload your first contract to see which clauses to change, identify one-sided risks, and get ready-to-send wording."
            actionLabel="Review a contract"
            onAction={() => router.push("/analyses/new")}
          />
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden shadow-lg">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--surface-raised)]/40 interactive-transition"
                >
                  {/* Left: Title, Type, and Metadata */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link
                        href={`/analyses/${review.id}`}
                        className="font-serif font-semibold text-lg text-[var(--foreground)] hover:text-[var(--primary)] interactive-transition truncate"
                      >
                        {review.title}
                      </Link>
                      <span className="text-xs px-2 py-0.5 rounded bg-[var(--surface-raised)] text-[var(--muted)] border border-[var(--border)] font-sans">
                        {review.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[var(--muted)] font-sans">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{review.date}</span>
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{review.clauseCount} clauses analyzed</span>
                      </span>
                    </div>
                  </div>

                  {/* Right: Risk Badge & Actions */}
                  <div className="flex items-center gap-4 shrink-0">
                    <RiskBadge
                      level={review.riskLevel}
                      score={review.riskScore}
                    />

                    <div className="flex items-center gap-1">
                      <Link href={`/analyses/${review.id}`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="min-h-11 gap-1.5 text-xs font-bold"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Open</span>
                        </Button>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setDeletingId(review.id)}
                        className="p-2.5 rounded-lg text-[var(--muted)] hover:text-[var(--risk-high)] hover:bg-[rgba(255,122,122,0.12)] min-h-11 min-w-11 flex items-center justify-center interactive-transition cursor-pointer"
                        title="Delete review"
                        aria-label={`Delete ${review.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Footer Disclaimer */}
        <footer className="text-center text-xs text-[var(--muted)] font-sans pt-6">
          General information only. Not legal advice.
        </footer>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && handleDelete(deletingId)}
        title="Delete this review?"
        description="Delete this review? This permanently removes the analysis and cannot be undone."
        confirmLabel="Delete review"
        cancelLabel="Keep it"
        isDestructive={true}
      />
    </AppShell>
  );
}
