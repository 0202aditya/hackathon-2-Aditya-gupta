"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { RiskBadge, RiskLevel } from "@/components/ui/risk-badge";
import { CopyButton } from "@/components/ui/copy-button";
import { ScoreRing } from "@/components/analysis/score-ring";
import { EmailDialog } from "@/components/analysis/email-dialog";
import {
  Check,
  X,
  Edit3,
  ArrowRight,
  Download,
  Mail,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Clock,
  Printer,
} from "lucide-react";
import { generateRedlineDocx } from "@/lib/export/docx-generator";

type DecisionStatus = "pending" | "accepted" | "rejected" | "edited";

interface ClauseItem {
  id: string;
  title: string;
  riskLevel: RiskLevel;
  explanation: string;
  impact: string;
  originalText: string;
  suggestedRedline?: string;
  decision: DecisionStatus;
  editedRedline?: string;
  isDiffSnippet?: {
    del: string;
    ins: string;
  };
}

interface MissingProtection {
  title: string;
  description: string;
  severity: "critical" | "recommended" | "optional";
  suggestedClause: string;
}

interface DbClause {
  id: string;
  title?: string;
  clause_type?: string;
  risk_level?: string;
  explanation?: string;
  impact?: string;
  original_text?: string;
  suggested_redline?: string;
  user_decision?: string;
  edited_redline?: string;
}

interface DbObligation {
  description?: string;
  due_date?: string;
  type?: "contractor" | "client" | "mutual";
}

const MOCK_CLAUSES: ClauseItem[] = [
  {
    id: "c1",
    title: "Limitation of Liability",
    riskLevel: "high",
    explanation:
      "You agree to be fully liable for all direct, indirect, and consequential damages with zero dollar cap.",
    impact:
      "A single client grievance could result in catastrophic financial liability exceeding your entire net worth.",
    originalText:
      "The Contractor shall be liable for all damages, losses, and expenses arising out of the performance of the Services, without limitation.",
    suggestedRedline:
      "The Contractor's total aggregate liability arising out of or related to this Agreement shall not exceed the total fees paid to Contractor in the twelve (12) months preceding the claim.",
    decision: "pending",
    isDiffSnippet: {
      del: "without limitation",
      ins: "not to exceed the total fees paid to Contractor in the preceding twelve months",
    },
  },
  {
    id: "c2",
    title: "Indemnification & Defense",
    riskLevel: "high",
    explanation:
      "Requires you to pay client's legal defense upfront for any third-party claims, even without negligence.",
    impact:
      "You could be forced to hire lawyers to defend the client even if you did nothing wrong.",
    originalText:
      "Contractor agrees to indemnify, defend, and hold harmless Client from any claims, suits, or demands whatsoever arising out of Contractor's work.",
    suggestedRedline:
      "Contractor agrees to indemnify Client against final third-party judgments arising solely from Contractor's proven gross negligence or willful misconduct.",
    decision: "pending",
    isDiffSnippet: {
      del: "any claims, suits, or demands whatsoever",
      ins: "final third-party judgments arising solely from Contractor's proven gross negligence",
    },
  },
  {
    id: "c3",
    title: "Intellectual Property Ownership",
    riskLevel: "high",
    explanation:
      "Assigns all code and inventions to the client upon creation, even if the client never pays you.",
    impact:
      "If the client ghosts or cancels payment, they legally own your code and you cannot withhold or reuse it.",
    originalText:
      "All work product, code, documentation, and inventions shall be deemed work made for hire and owned exclusively by Client from the moment of creation.",
    suggestedRedline:
      "Ownership of deliverables shall transfer to Client exclusively upon receipt of full and final payment. Contractor retains all rights to pre-existing libraries and tools.",
    decision: "pending",
    isDiffSnippet: {
      del: "from the moment of creation",
      ins: "exclusively upon receipt of full and final payment",
    },
  },
  {
    id: "c4",
    title: "Payment Terms & Acceptance",
    riskLevel: "medium",
    explanation:
      "Net 60 payment terms with undefined subjective client approval criteria.",
    impact:
      "Client can delay payment for months by simply withholding informal sign-off.",
    originalText:
      "Payment shall be made Net 60 days following Client's subjective satisfaction and written acceptance of the Deliverables.",
    suggestedRedline:
      "Payment shall be made Net 15 days upon receipt of invoice. Deliverables shall be deemed accepted if no written feedback is provided within five (5) business days.",
    decision: "pending",
    isDiffSnippet: {
      del: "Net 60 days following Client's subjective satisfaction",
      ins: "Net 15 days upon invoice; deemed accepted if no notice within 5 business days",
    },
  },
  {
    id: "c5",
    title: "Termination for Convenience",
    riskLevel: "medium",
    explanation:
      "Client can terminate the agreement immediately with 24 hours notice with zero cancellation compensation.",
    impact:
      "You could reserve weeks of your schedule only to be cancelled without notice or pay.",
    originalText:
      "Client may terminate this Agreement at any time for any reason upon one (1) day written notice without penalty.",
    suggestedRedline:
      "Client may terminate this Agreement for convenience upon fourteen (14) days written notice, provided Client pays Contractor for all work completed plus a 20% kill fee.",
    decision: "pending",
    isDiffSnippet: {
      del: "one (1) day written notice",
      ins: "fourteen (14) days written notice, with payment for work completed",
    },
  },
  {
    id: "c6",
    title: "Confidentiality & Non-Disclosure",
    riskLevel: "low",
    explanation:
      "Standard mutual confidentiality obligation. Reasonable protections for both parties.",
    impact:
      "Standard industry practice. Protects your confidential discussions and client trade secrets equally.",
    originalText:
      "Both parties agree to treat proprietary technical and business information as strictly confidential during the term and for three years thereafter.",
    decision: "pending",
  },
];

function AnalysisResultsContent({ analysisId }: { analysisId: string }) {
  const searchParams = useSearchParams();
  const isAnalyzingInitial = searchParams.get("analyzing") === "true";

  const [analyzingStage, setAnalyzingStage] = React.useState<number>(isAnalyzingInitial ? 1 : 4);
  const [contractTitle, setContractTitle] = React.useState<string>("Acme Corp Master Services Agreement");
  const [contractType, setContractType] = React.useState<string>("Service Agreement");
  const [overallScore, setOverallScore] = React.useState<number>(78);
  const [overallRisk, setOverallRisk] = React.useState<RiskLevel>("high");
  const [summary, setSummary] = React.useState<string>(
    "Uncapped liability and perpetual IP assignment create critical exposure for independent software development."
  );

  const [clauses, setClauses] = React.useState<ClauseItem[]>(MOCK_CLAUSES);
  const [missingProtections, setMissingProtections] = React.useState<MissingProtection[]>([
    {
      title: "Late Payment Interest",
      severity: "recommended",
      description: "Protects cash flow if the client delays invoicing.",
      suggestedClause: "Invoices overdue beyond 30 days shall accrue interest at 1.5% per month.",
    },
    {
      title: "Kill Fee & Cancellation",
      severity: "critical",
      description: "Compensates for reserved scheduling if client abruptly cancels.",
      suggestedClause: "If project is terminated without cause, Client pays for all work performed plus a 20% cancellation fee.",
    },
    {
      title: "Revision Limits Cap",
      severity: "optional",
      description: "Prevents scope creep and endless review cycles.",
      suggestedClause: "Fees include two (2) rounds of revision. Additional revisions billed at standard hourly rates.",
    },
  ]);
  const [obligations, setObligations] = React.useState<{
    title: string;
    dueDate: string;
    party: "contractor" | "client" | "mutual";
    description: string;
  }[]>([
    {
      title: "Auto-Renewal Notice Window",
      dueDate: "Dec 15, 2026",
      party: "mutual",
      description: "Must give 30 days written notice to prevent automatic 12-month extension.",
    },
    {
      title: "Phase 1 Final Acceptance",
      dueDate: "Nov 30, 2026",
      party: "client",
      description: "Client has 10 business days to request revisions before automatic sign-off.",
    },
    {
      title: "Invoice Milestone Submission",
      dueDate: "Nov 15, 2026",
      party: "contractor",
      description: "Submit 50% midpoint invoice for milestone completion.",
    },
  ]);

  const [selectedId, setSelectedId] = React.useState<string>("c1");
  const [filter, setFilter] = React.useState<"all" | "high" | "medium" | "low">("all");
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedText, setEditedText] = React.useState("");
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = React.useState(false);
  const [exportNotification, setExportNotification] = React.useState<string | null>(null);

  const [isLoadingFromDb, setIsLoadingFromDb] = React.useState(analysisId !== "acme-msa");
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  // Load live analysis from Supabase API if not the demo id
  React.useEffect(() => {
    if (analysisId === "acme-msa") {
      return;
    }

    let isMounted = true;

    async function fetchAnalysis() {
      try {
        const res = await fetch(`/api/analyses/${analysisId}`);
        if (!res.ok) {
          throw new Error("Could not find this contract analysis.");
        }
        const data = await res.json();
        const a = data.analysis;

        if (!isMounted) return;

        setContractTitle(a.title || "Contract Analysis");
        setContractType(a.contract_type || "Agreement");
        setOverallScore(a.risk_score || 50);
        setOverallRisk((a.overall_risk as RiskLevel) || "medium");
        setSummary(a.summary || "");

        if (a.missing_protections && Array.isArray(a.missing_protections)) {
          setMissingProtections(a.missing_protections);
        }

        if (a.obligations && Array.isArray(a.obligations)) {
          setObligations(
            (a.obligations as DbObligation[]).map((o: DbObligation) => ({
              title: o.description?.split(":")[0] || "Obligation",
              dueDate: o.due_date || "Milestone",
              party: o.type || "contractor",
              description: o.description?.split(":")[1]?.trim() || o.description || "",
            }))
          );
        }

        if (a.clauses && Array.isArray(a.clauses) && a.clauses.length > 0) {
          const mappedClauses: ClauseItem[] = (a.clauses as DbClause[]).map((c: DbClause) => ({
            id: c.id,
            title: c.title || c.clause_type || "Clause",
            riskLevel: (c.risk_level as RiskLevel) || "medium",
            explanation: c.explanation || "",
            impact: c.impact || "",
            originalText: c.original_text || "",
            suggestedRedline: c.suggested_redline || "",
            decision: (c.user_decision as DecisionStatus) || "pending",
            editedRedline: c.edited_redline || undefined,
          }));
          setClauses(mappedClauses);
          setSelectedId(mappedClauses[0].id);
        }
      } catch (err: unknown) {
        console.error("Failed to load analysis:", err);
        const message = err instanceof Error ? err.message : "Failed to load analysis.";
        if (isMounted) setFetchError(message);
      } finally {
        if (isMounted) setIsLoadingFromDb(false);
      }
    }

    fetchAnalysis();

    return () => {
      isMounted = false;
    };
  }, [analysisId]);

  // Simulate analyzing progression if arriving with ?analyzing=true
  React.useEffect(() => {
    if (isAnalyzingInitial) {
      const timer1 = setTimeout(() => setAnalyzingStage(2), 900);
      const timer2 = setTimeout(() => setAnalyzingStage(3), 1800);
      const timer3 = setTimeout(() => setAnalyzingStage(4), 2700);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isAnalyzingInitial]);

  const selectedClause = clauses.find((c) => c.id === selectedId) || clauses[0];

  const filteredClauses = clauses.filter((c) => {
    if (filter === "all") return true;
    return c.riskLevel === filter;
  });

  // Decision Handlers: updates state and syncs to Supabase database
  const handleDecision = React.useCallback(
    async (id: string, decision: DecisionStatus, newText?: string) => {
      setClauses((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            return {
              ...c,
              decision,
              editedRedline: newText !== undefined ? newText : c.editedRedline,
            };
          }
          return c;
        })
      );
      setIsEditing(false);

      // Save decision to Supabase if live analysis
      if (analysisId !== "acme-msa") {
        try {
          await fetch(`/api/analyses/${analysisId}/clauses/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_decision: decision,
              edited_redline: newText,
            }),
          });
        } catch (err) {
          console.error("Failed to persist clause decision:", err);
        }
      }
    },
    [analysisId]
  );

  // Jump to Next Unresolved Issue
  const handleNextIssue = () => {
    const nextUnresolved = clauses.find(
      (c) =>
        (c.riskLevel === "high" || c.riskLevel === "medium") &&
        c.decision === "pending" &&
        c.id !== selectedId
    );
    if (nextUnresolved) {
      setSelectedId(nextUnresolved.id);
    } else {
      const anyOther = clauses.find((c) => c.id !== selectedId);
      if (anyOther) setSelectedId(anyOther.id);
    }
  };

  // Keyboard navigation: J/K to move, A to accept, C to copy
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        isEmailModalOpen
      ) {
        return;
      }

      if (e.key === "j" || e.key === "J") {
        const currentIndex = filteredClauses.findIndex((c) => c.id === selectedId);
        if (currentIndex < filteredClauses.length - 1) {
          setSelectedId(filteredClauses[currentIndex + 1].id);
        }
      } else if (e.key === "k" || e.key === "K") {
        const currentIndex = filteredClauses.findIndex((c) => c.id === selectedId);
        if (currentIndex > 0) {
          setSelectedId(filteredClauses[currentIndex - 1].id);
        }
      } else if (e.key === "a" || e.key === "A") {
        if (selectedClause?.suggestedRedline) {
          handleDecision(selectedClause.id, "accepted");
        }
      } else if (e.key === "c" || e.key === "C") {
        if (selectedClause?.suggestedRedline) {
          navigator.clipboard.writeText(
            selectedClause.editedRedline || selectedClause.suggestedRedline
          );
        }
      } else if (e.key === "?") {
        setShowKeyboardHelp((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredClauses, selectedId, selectedClause, isEmailModalOpen, handleDecision]);

  const acceptedClauses = clauses
    .filter((c) => c.decision === "accepted" || c.decision === "edited")
    .map((c) => ({
      title: c.title,
      redline: c.editedRedline || c.suggestedRedline || "",
    }));

  const handleExportDocx = async () => {
    try {
      setExportNotification("Generating Word (.docx) with redline markup...");
      const blob = await generateRedlineDocx({
        contractTitle,
        overallScore,
        overallRisk,
        summary,
        clauses: clauses.map((c) => ({
          title: c.title,
          originalText: c.originalText,
          suggestedRedline: c.suggestedRedline,
          editedRedline: c.editedRedline,
          explanation: c.explanation,
          decision: c.decision,
          riskLevel: c.riskLevel,
        })),
        missingProtections,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${contractTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}_Redline.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportNotification("Word document downloaded successfully!");
      setTimeout(() => setExportNotification(null), 3500);
    } catch (err) {
      console.error("Export docx error:", err);
      setExportNotification("Failed to generate Word document.");
    }
  };

  const handleExportPdf = () => {
    window.open(`/analyses/${analysisId}/report`, "_blank");
  };

  // Error Loading Screen
  if (fetchError) {
    return (
      <AppShell userEmail="contractor@example.com">
        <div className="min-h-[70vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-(--surface) border border-(--border) p-8 text-center space-y-5">
            <AlertCircle className="w-12 h-12 text-(--danger) mx-auto" />
            <h1 className="heading-3 text-(--foreground)">Analysis Not Found</h1>
            <p className="text-sm text-(--muted)">{fetchError}</p>
            <Link href="/dashboard">
              <Button variant="primary" className="w-full justify-center">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  // Loading Screen
  if (isLoadingFromDb || analyzingStage < 4) {
    return (
      <AppShell userEmail="contractor@example.com">
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <div className="w-full max-w-[480px] rounded-2xl bg-(--surface) border border-(--border) p-8 sm:p-10 text-center space-y-8 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[rgba(134,168,255,0.12)] border border-[rgba(134,168,255,0.25)] flex items-center justify-center text-(--primary) mx-auto animate-pulse">
              <Sparkles className="w-8 h-8" strokeWidth={1.75} />
            </div>

            <div className="space-y-2">
              <h1 className="heading-3 text-(--foreground)">Analyzing your contract</h1>
              <p className="text-sm text-(--muted)">
                Our Gemini AI engine is reviewing clause terms against freelancer protections.
              </p>
            </div>

            <div className="space-y-4 text-left border-t border-b border-(--border) py-6">
              {[
                { stage: 1, label: "Reading & extracting contract text" },
                { stage: 2, label: "Identifying risks & predatory clauses" },
                { stage: 3, label: "Generating redlines & obligations" },
              ].map((s) => {
                const isComplete = analyzingStage > s.stage;
                const isCurrent = analyzingStage === s.stage;
                return (
                  <div key={s.stage} className="flex items-center gap-3">
                    {isComplete ? (
                      <div className="w-6 h-6 rounded-full bg-[rgba(95,211,160,0.15)] text-(--risk-low) border border-[rgba(95,211,160,0.3)] flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-6 h-6 rounded-full border-2 border-(--primary) border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-(--border) bg-(--surface-raised) shrink-0" />
                    )}
                    <span
                      className={`text-sm font-sans ${
                        isCurrent
                          ? "font-bold text-(--primary)"
                          : isComplete
                          ? "text-(--foreground)"
                          : "text-(--muted)"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // Count high, medium, low clauses
  const highCount = clauses.filter((c) => c.riskLevel === "high").length;
  const mediumCount = clauses.filter((c) => c.riskLevel === "medium").length;
  const lowCount = clauses.filter((c) => c.riskLevel === "low").length;

  return (
    <AppShell userEmail="contractor@example.com">
      <div className="max-w-[1240px] mx-auto w-full px-4 sm:px-6 py-6 space-y-8">
        
        {/* Sticky Top Summary Bar */}
        <section className="sticky top-0 z-20 rounded-2xl bg-(--surface) border border-(--border) p-4 sm:p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Title & Score */}
            <div className="flex items-start sm:items-center gap-4">
              <ScoreRing score={overallScore} size={60} strokeWidth={5} />
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Link href="/dashboard" className="text-xs text-(--muted) hover:text-(--foreground) flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </Link>
                  <span className="text-xs text-(--border)">/</span>
                  <h1 className="heading-3 text-(--foreground) truncate">
                    {contractTitle}
                  </h1>
                  <span className="text-xs px-2 py-0.5 rounded bg-(--surface-raised) border border-(--border) text-(--muted) font-sans">
                    {contractType}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-(--muted) line-clamp-1">
                  <span className={`font-bold mr-1.5 ${overallRisk === 'high' ? 'text-(--risk-high)' : overallRisk === 'medium' ? 'text-(--risk-medium)' : 'text-(--risk-low)'}`}>
                    {overallRisk.toUpperCase()} risk ({overallScore}/100):
                  </span>
                  {summary}
                </p>
              </div>
            </div>

            {/* Count Chips & Action Buttons */}
            <div className="flex items-center justify-between lg:justify-end gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold badge-risk-high">
                  {highCount} high
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold badge-risk-medium">
                  {mediumCount} medium
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold badge-risk-low">
                  {lowCount} low
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsEmailModalOpen(true)}
                  className="min-h-11 gap-1.5 font-bold"
                >
                  <Mail className="w-4 h-4" />
                  <span>Write email ({acceptedClauses.length})</span>
                </Button>

                <div className="relative group">
                  <Button variant="secondary" size="sm" className="min-h-11 gap-1.5">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </Button>
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-(--surface-raised) border border-(--border) shadow-2xl py-1.5 hidden group-hover:block z-30">
                    <button
                      type="button"
                      onClick={handleExportDocx}
                      className="w-full text-left px-3.5 py-2 text-xs font-sans text-(--foreground) hover:bg-(--surface) hover:text-(--primary) interactive-transition flex items-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5 text-(--primary)" />
                      <span>Word (.docx) with redlines</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportPdf}
                      className="w-full text-left px-3.5 py-2 text-xs font-sans text-(--foreground) hover:bg-(--surface) hover:text-(--primary) interactive-transition flex items-center gap-2"
                    >
                      <Printer className="w-3.5 h-3.5 text-(--risk-low)" />
                      <span>PDF risk report</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {exportNotification && (
            <div className="mt-3 p-2.5 rounded-lg bg-[rgba(134,168,255,0.12)] border border-[rgba(134,168,255,0.25)] text-xs font-sans text-(--primary) flex items-center justify-between animate-fade-in">
              <span>{exportNotification}</span>
              <button
                type="button"
                onClick={() => setExportNotification(null)}
                className="text-(--muted) hover:text-(--foreground)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </section>

        {/* Workspace: 2-Pane Interactive Clause Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Pane (5 cols): Clauses List */}
          <aside className="lg:col-span-5 rounded-2xl bg-(--surface) border border-(--border) overflow-hidden shadow-lg flex flex-col max-h-[820px]">
            {/* Filter Bar */}
            <div className="p-4 border-b border-(--border) flex items-center justify-between gap-2 bg-(--surface) shrink-0">
              <div className="flex items-center gap-1">
                {(["all", "high", "medium", "low"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFilter(lvl)}
                    className={`px-2.5 py-1 rounded-md text-xs font-sans font-bold capitalize interactive-transition ${
                      filter === lvl
                        ? "bg-(--surface-raised) text-(--foreground) border border-(--border)"
                        : "text-(--muted) hover:text-(--foreground)"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextIssue}
                className="text-xs h-8 gap-1 font-bold"
              >
                <span>Next issue</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>

            {/* Scrollable Clause Rows */}
            <div className="overflow-y-auto divide-y divide-(--border) flex-1">
              {filteredClauses.map((clause) => {
                const isSelected = clause.id === selectedId;
                return (
                  <button
                    key={clause.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(clause.id);
                      setIsEditing(false);
                    }}
                    className={`w-full text-left p-4 interactive-transition flex items-start justify-between gap-3 ${
                      isSelected
                        ? "bg-(--surface-raised) border-l-[3px] border-l-(--primary)"
                        : "hover:bg-(--surface-raised)/50"
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <RiskBadge level={clause.riskLevel} />
                        <h2 className="text-sm font-sans font-bold text-(--foreground) truncate">
                          {clause.title}
                        </h2>
                      </div>
                      <p className="text-xs text-(--muted) line-clamp-2 leading-relaxed">
                        {clause.explanation}
                      </p>
                    </div>

                    <div className="shrink-0 mt-1">
                      {clause.decision === "accepted" && (
                        <span className="w-6 h-6 rounded-full bg-[rgba(95,211,160,0.15)] text-(--risk-low) border border-[rgba(95,211,160,0.3)] flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </span>
                      )}
                      {clause.decision === "edited" && (
                        <span className="w-6 h-6 rounded-full bg-[rgba(134,168,255,0.15)] text-(--primary) border border-[rgba(134,168,255,0.3)] flex items-center justify-center">
                          <Edit3 className="w-3 h-3" />
                        </span>
                      )}
                      {clause.decision === "rejected" && (
                        <span className="w-6 h-6 rounded-full bg-[rgba(255,107,107,0.15)] text-(--risk-high) border border-[rgba(255,107,107,0.3)] flex items-center justify-center">
                          <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Pane (7 cols): Detailed Clause Inspector */}
          <main className="lg:col-span-7 rounded-2xl bg-(--surface) border border-(--border) p-6 sm:p-8 space-y-6 shadow-lg min-h-[640px]">
            {selectedClause ? (
              <div className="space-y-6">
                
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-(--border) pb-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <RiskBadge level={selectedClause.riskLevel} />
                      <h2 className="heading-3 text-(--foreground)">
                        {selectedClause.title}
                      </h2>
                    </div>
                    <p className="text-sm text-(--muted)">
                      {selectedClause.explanation}
                    </p>
                  </div>

                  <CopyButton
                    textToCopy={
                      selectedClause.editedRedline ||
                      selectedClause.suggestedRedline ||
                      selectedClause.originalText
                    }
                    label="Copy"
                    size="sm"
                  />
                </div>

                {/* Practical Impact Callout */}
                <div className="rounded-xl bg-(--surface-raised) border border-(--border) p-4 space-y-1">
                  <span className="text-xs uppercase tracking-wider font-bold text-(--muted)">
                    What this means for you
                  </span>
                  <p className="text-sm font-sans text-(--foreground) leading-relaxed">
                    {selectedClause.impact}
                  </p>
                </div>

                {/* As Written (Original Clause) */}
                <div className="space-y-2">
                  <span className="text-xs font-sans font-bold uppercase tracking-wider text-(--muted)">
                    As written in contract
                  </span>
                  <div className="p-4 rounded-xl bg-(--surface-raised) border border-(--border) font-serif text-sm leading-relaxed text-(--foreground)/80">
                    &ldquo;{selectedClause.originalText}&rdquo;
                  </div>
                </div>

                {/* Suggested Redline */}
                {selectedClause.suggestedRedline && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-sans font-bold uppercase tracking-wider text-(--primary) flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Recommended replacement</span>
                      </span>
                      <span className="text-xs text-(--muted)">
                        Legally balanced for contractors
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <textarea
                          rows={5}
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-(--surface-raised) border border-(--primary) text-sm font-serif text-(--foreground) leading-relaxed focus:outline-none"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              handleDecision(selectedClause.id, "edited", editedText)
                            }
                          >
                            Save revision
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-[rgba(134,168,255,0.06)] border border-[rgba(134,168,255,0.2)] font-serif text-sm leading-relaxed text-(--foreground) space-y-3">
                        <p>
                          &ldquo;
                          {selectedClause.editedRedline || selectedClause.suggestedRedline}
                          &rdquo;
                        </p>

                        {selectedClause.isDiffSnippet && (
                          <div className="pt-2 border-t border-[rgba(134,168,255,0.15)] text-xs font-sans space-y-1">
                            <p className="line-through text-(--danger)">
                              - {selectedClause.isDiffSnippet.del}
                            </p>
                            <p className="text-(--risk-low)">
                              + {selectedClause.isDiffSnippet.ins}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Decision Actions */}
                <div className="pt-4 border-t border-(--border) flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={selectedClause.decision === "accepted" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handleDecision(selectedClause.id, "accepted")}
                      className="min-h-11 gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>{selectedClause.decision === "accepted" ? "Accepted" : "Accept redline"}</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditedText(
                          selectedClause.editedRedline || selectedClause.suggestedRedline || ""
                        );
                        setIsEditing(true);
                      }}
                      className="min-h-11 gap-1.5"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </Button>

                    <Button
                      variant={selectedClause.decision === "rejected" ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => handleDecision(selectedClause.id, "rejected")}
                      className="min-h-11 gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Keep original</span>
                    </Button>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleNextIssue}
                    className="min-h-11 gap-1.5 text-xs font-bold"
                  >
                    <span>Next clause</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-sm text-(--muted)">
                Select a clause to review redlines
              </div>
            )}
          </main>
        </div>

        {/* Section: What the Contract Leaves Out (Missing Protections) */}
        <section className="rounded-2xl bg-(--surface) border border-(--border) p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="heading-3 text-(--foreground) flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-(--risk-medium)" />
              <span>What the contract leaves out</span>
            </h2>
            <p className="text-sm text-(--muted)">
              Provisions missing from the contract that you should consider asking to add.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {missingProtections.map((item) => (
              <div
                key={item.title}
                className="p-5 rounded-xl bg-(--surface-raised) border border-(--border) space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-(--foreground)">
                      {item.title}
                    </h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${item.severity === 'critical' ? 'badge-risk-high' : 'badge-risk-medium'}`}>
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-xs text-(--muted)">
                    {item.description}
                  </p>
                  <p className="font-serif text-xs leading-relaxed text-(--foreground)/80 italic pt-1">
                    &ldquo;{item.suggestedClause}&rdquo;
                  </p>
                </div>

                <CopyButton
                  textToCopy={item.suggestedClause}
                  label="Copy clause"
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Section: Key Obligations & Deliverables */}
        <section className="rounded-2xl bg-(--surface) border border-(--border) p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="heading-3 text-(--foreground) flex items-center gap-2">
              <Clock className="w-5 h-5 text-(--primary)" />
              <span>Key obligations & deliverables</span>
            </h2>
            <p className="text-sm text-(--muted)">
              Delivery milestones, payment windows, and contract requirements extracted from the text.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {obligations.map((d) => (
              <div
                key={d.title}
                className="p-5 rounded-xl bg-(--surface-raised) border border-(--border) space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-(--primary) uppercase">
                      {d.dueDate}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-(--surface) border border-(--border) text-(--muted) uppercase font-bold">
                      {d.party}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-(--foreground) mt-1">
                    {d.title}
                  </h3>
                  <p className="text-xs text-(--muted) mt-1 leading-relaxed">
                    {d.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Global Footer Legal Disclaimer & Keyboard Hints */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-(--muted) font-sans pt-6 border-t border-(--border)">
          <span>General information only. Not legal advice.</span>
          <button
            type="button"
            onClick={() => setShowKeyboardHelp((prev) => !prev)}
            className="hover:text-(--foreground) underline flex items-center gap-1.5"
          >
            <span>Shortcuts (J / K / A / C / ?)</span>
          </button>
        </footer>

        {showKeyboardHelp && (
          <div className="fixed bottom-6 right-6 z-40 p-4 rounded-xl bg-(--surface-raised) border border-(--border) shadow-2xl text-xs space-y-2 max-w-xs animate-in fade-in">
            <div className="flex items-center justify-between font-bold text-(--foreground) pb-1 border-b border-(--border)">
              <span>Keyboard Shortcuts</span>
              <button
                type="button"
                onClick={() => setShowKeyboardHelp(false)}
                className="text-(--muted) hover:text-(--foreground)"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1 text-(--muted)">
              <span><kbd className="font-mono text-(--foreground)">J</kbd> Next clause</span>
              <span><kbd className="font-mono text-(--foreground)">K</kbd> Prev clause</span>
              <span><kbd className="font-mono text-(--foreground)">A</kbd> Accept redline</span>
              <span><kbd className="font-mono text-(--foreground)">C</kbd> Copy text</span>
              <span><kbd className="font-mono text-(--foreground)">?</kbd> Toggle help</span>
            </div>
          </div>
        )}
      </div>

      {/* Negotiation Email Generator Dialog */}
      <EmailDialog
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        acceptedClauses={acceptedClauses}
        contractTitle={contractTitle}
      />
    </AppShell>
  );
}

export default function AnalysisResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-(--background)" />}>
      <AnalysisResultsContent analysisId={unwrappedParams.id} />
    </React.Suspense>
  );
}
