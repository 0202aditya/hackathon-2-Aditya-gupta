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
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ContractReviewItem {
  id: string;
  title: string;
  type: string;
  date: string;
  riskLevel: RiskLevel;
  riskScore: number;
  clauseCount?: number;
}

const MOCK_REVIEWS: ContractReviewItem[] = [
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

interface DbAnalysisItem {
  id: string;
  title?: string;
  contract_type?: string;
  created_at: string;
  overall_risk?: string;
  risk_score?: number;
}

function normalizeRiskScore(score: number, riskLevel: RiskLevel | string): number {
  if (riskLevel === "high" && score <= 40) {
    return 100 - score;
  }
  if (riskLevel === "low" && score >= 60) {
    return 100 - score;
  }
  return score;
}

export default function DashboardPage() {
  const router = useRouter();
  const [reviews, setReviews] = React.useState<ContractReviewItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isUsingMocks, setIsUsingMocks] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    async function loadInitialReviews() {
      try {
        const res = await fetch("/api/analyses");
        if (!res.ok) {
          throw new Error("Failed to fetch analyses");
        }
        const data = await res.json();
        const list: DbAnalysisItem[] = data.analyses || [];

        if (isMounted) {
          if (list.length > 0) {
            setReviews(
              list.map((item) => ({
                id: item.id,
                title: item.title || "Untitled Contract",
                type: item.contract_type || "Agreement",
                date: new Date(item.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
                riskLevel: (item.overall_risk as RiskLevel) || "medium",
                riskScore: normalizeRiskScore(item.risk_score || 50, item.overall_risk || "medium"),
              }))
            );
          } else {
            setReviews([]);
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (isUsingMocks || id === "acme-msa") {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setDeletingId(null);
      return;
    }

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/analyses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setDeletingId(null);
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleMocks = async () => {
    if (isUsingMocks) {
      setIsLoading(true);
      try {
        const res = await fetch("/api/analyses");
        if (res.ok) {
          const data = await res.json();
          const list: DbAnalysisItem[] = data.analyses || [];
          setReviews(
            list.map((item) => ({
              id: item.id,
              title: item.title || "Untitled Contract",
              type: item.contract_type || "Agreement",
              date: new Date(item.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              riskLevel: (item.overall_risk as RiskLevel) || "medium",
              riskScore: item.risk_score || 50,
            }))
          );
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
        setIsUsingMocks(false);
      }
    } else {
      setReviews(MOCK_REVIEWS);
      setIsUsingMocks(true);
    }
  };

  return (
    <AppShell>
      <div className="max-w-280 mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-(--border)">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="heading-2 text-(--foreground)">Your reviews</h1>
              {userEmail && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-(--surface-raised) border border-(--border) text-zinc-300 font-sans font-medium flex items-center gap-1.5" title={`Account: ${userEmail}`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{userEmail}</span>
                </span>
              )}
            </div>
            <p className="text-sm text-(--muted) mt-1">
              Review what you signed, see flagged risks, and check replacement language.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleMocks}
              className="text-xs font-sans text-(--muted) hover:text-(--foreground) underline p-2"
              title="Toggle preview demo data"
            >
              {isUsingMocks ? "Show my actual reviews" : "Preview sample reviews"}
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
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-(--primary)" />
            <p className="text-sm text-(--muted)">Loading your reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No contracts reviewed yet."
            description="Upload your first contract to see which clauses to change, identify one-sided risks, and get ready-to-send wording."
            actionLabel="Review a contract"
            onAction={() => router.push("/analyses/new")}
          />
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl bg-(--surface) border border-(--border) divide-y divide-(--border) overflow-hidden shadow-lg">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-(--surface-raised)/40 interactive-transition"
                >
                  {/* Left: Title, Type, and Metadata */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link
                        href={`/analyses/${review.id}`}
                        className="text-base sm:text-lg font-sans font-bold text-(--foreground) hover:text-(--primary) truncate interactive-transition"
                      >
                        {review.title}
                      </Link>
                      <span className="text-xs px-2 py-0.5 rounded bg-(--surface-raised) border border-(--border) text-(--muted) font-sans">
                        {review.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-(--muted) flex-wrap font-sans">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{review.date}</span>
                      </span>
                      {review.clauseCount && (
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          <span>{review.clauseCount} clauses analyzed</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Risk Badge, Score, and Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <RiskBadge level={review.riskLevel} />
                      <span className="block text-xs text-(--muted) font-mono mt-1">
                        Score: {review.riskScore}/100
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/analyses/${review.id}`}>
                        <Button variant="secondary" size="sm" className="min-h-11 gap-1.5">
                          <span>Open</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingId(review.id)}
                        className="min-h-11 text-(--muted) hover:text-(--danger) hover:border-(--danger)/50"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={!!deletingId}
          title="Delete contract review?"
          description="Are you sure you want to delete this analysis? All saved redlines and obligations for this contract will be permanently removed."
          confirmLabel={isDeleting ? "Deleting..." : "Delete review"}
          cancelLabel="Cancel"
          isDestructive={true}
          onConfirm={() => {
            if (deletingId) handleDelete(deletingId);
          }}
          onClose={() => setDeletingId(null)}
        />
      </div>
    </AppShell>
  );
}
