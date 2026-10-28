"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { RiskBadge, RiskLevel } from "@/components/ui/risk-badge";
import { CopyButton } from "@/components/ui/copy-button";
import { ScoreRing } from "@/components/analysis/score-ring";
import { EmailDialog } from "@/components/analysis/email-dialog";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Check,
  X,
  Edit3,
  ArrowRight,
  Download,
  Mail,
  Calendar as CalendarIcon,
  AlertCircle,
  Keyboard,
  Sparkles,
} from "lucide-react";

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
    title: "IP Assignment & Pre-Existing Tools",
    riskLevel: "high",
    explanation:
      "Assigns all copyright and patentable inventions to client upon creation without excluding your own reusable code or libraries.",
    impact:
      "You will lose the legal right to reuse your own starter code, libraries, and design systems for future clients.",
    originalText:
      "All work product, code, documentation, and inventions conceived by Contractor shall immediately become the sole property of Client as work made for hire.",
    suggestedRedline:
      "Client shall own custom deliverables upon receipt of full payment. Contractor retains all ownership of pre-existing tools, libraries, and frameworks.",
    decision: "pending",
    isDiffSnippet: {
      del: "immediately become the sole property of Client as work made for hire",
      ins: "become Client property upon receipt of full payment, excluding Contractor's pre-existing tools",
    },
  },
  {
    id: "c4",
    title: "Payment Terms & Withholding",
    riskLevel: "medium",
    explanation:
      "Net 60 payment terms with client right to withhold disputed fees indefinitely without milestones.",
    impact:
      "You may wait two full months to get paid, while client can freeze invoices arbitrarily.",
    originalText:
      "Invoices shall be paid within sixty (60) days of receipt. Client reserves the right to withhold disputed sums.",
    suggestedRedline:
      "Invoices shall be paid within thirty (30) days of receipt. Undisputed amounts must be released promptly on schedule.",
    decision: "pending",
    isDiffSnippet: {
      del: "within sixty (60) days",
      ins: "within thirty (30) days",
    },
  },
  {
    id: "c5",
    title: "Termination for Convenience",
    riskLevel: "medium",
    explanation:
      "Client can cancel on 24 hours notice without paying for work in progress.",
    impact:
      "You could invest weeks of effort and be terminated with no compensation.",
    originalText:
      "Client may terminate this Agreement at any time with one (1) day written notice.",
    suggestedRedline:
      "Either party may terminate upon fourteen (14) days written notice, with Client paying for all work completed up to the date of termination.",
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

function AnalysisResultsContent() {
  const searchParams = useSearchParams();
  const isAnalyzingInitial = searchParams.get("analyzing") === "true";

  const [analyzingStage, setAnalyzingStage] = React.useState<number>(isAnalyzingInitial ? 1 : 4);
  const [clauses, setClauses] = React.useState<ClauseItem[]>(MOCK_CLAUSES);
  const [selectedId, setSelectedId] = React.useState<string>("c1");
  const [filter, setFilter] = React.useState<"all" | "high" | "medium" | "low">("all");
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedText, setEditedText] = React.useState("");
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = React.useState(false);
  const [exportNotification, setExportNotification] = React.useState<string | null>(null);

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

  // Decision Handlers
  const handleDecision = (id: string, decision: DecisionStatus, newText?: string) => {
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
  };

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
      // Loop to first clause if all resolved
      const anyOther = clauses.find((c) => c.id !== selectedId);
      if (anyOther) setSelectedId(anyOther.id);
    }
  };

  // Keyboard navigation: J/K to move, A to accept, C to copy
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs/textareas
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
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
        if (selectedClause.suggestedRedline) {
          handleDecision(selectedClause.id, "accepted");
        }
      } else if (e.key === "c" || e.key === "C") {
        if (selectedClause.suggestedRedline) {
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
  }, [filteredClauses, selectedId, selectedClause]);

  const acceptedClauses = clauses
    .filter((c) => c.decision === "accepted" || c.decision === "edited")
    .map((c) => ({
      title: c.title,
      redline: c.editedRedline || c.suggestedRedline || "",
    }));

  const handleExport = (type: string) => {
    setExportNotification(`Exporting ${type} document with full redlines and legal disclaimer...`);
    setTimeout(() => setExportNotification(null), 3000);
  };

  // Analyzing Stage Screen
  if (analyzingStage < 4) {
    return (
      <AppShell userEmail="contractor@example.com">
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <div className="w-full max-w-[480px] rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-8 sm:p-10 text-center space-y-8 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[rgba(134,168,255,0.12)] border border-[rgba(134,168,255,0.25)] flex items-center justify-center text-[var(--primary)] mx-auto animate-pulse">
              <Sparkles className="w-8 h-8" strokeWidth={1.75} />
            </div>

            <div className="space-y-2">
              <h1 className="heading-3 text-[var(--foreground)]">Analyzing your contract</h1>
              <p className="text-sm text-[var(--muted)]">
                Our AI model is reviewing clause terms against your business rules.
              </p>
            </div>

            {/* 3 Real Stages */}
            <div className="space-y-4 text-left border-t border-b border-[var(--border)] py-6">
              {[
                { stage: 1, label: "Reading your contract" },
                { stage: 2, label: "Checking each clause" },
                { stage: 3, label: "Writing your redlines" },
              ].map((s) => {
                const isComplete = analyzingStage > s.stage;
                const isCurrent = analyzingStage === s.stage;
                return (
                  <div key={s.stage} className="flex items-center gap-3">
                    {isComplete ? (
                      <div className="w-6 h-6 rounded-full bg-[rgba(95,211,160,0.15)] text-[var(--risk-low)] border border-[rgba(95,211,160,0.3)] flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-6 h-6 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-[var(--border)] bg-[var(--surface-raised)] shrink-0" />
                    )}
                    <span
                      className={`text-sm font-sans ${
                        isCurrent
                          ? "font-bold text-[var(--primary)]"
                          : isComplete
                          ? "text-[var(--foreground)]"
                          : "text-[var(--muted)]"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-[var(--muted)] leading-relaxed">
              This usually takes under a minute. You can leave this page and come back from your dashboard.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell userEmail="contractor@example.com">
      <div className="max-w-[1240px] mx-auto w-full px-4 sm:px-6 py-6 space-y-8">
        
        {/* Sticky Top Summary Bar */}
        <section className="sticky top-0 z-20 rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4 sm:p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Title & Score */}
            <div className="flex items-start sm:items-center gap-4">
              <ScoreRing score={78} size={60} strokeWidth={5} />
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="heading-3 text-[var(--foreground)] truncate">
                    Acme Corp Master Services Agreement
                  </h1>
                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--muted)] font-sans">
                    Service Agreement
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--muted)] line-clamp-1">
                  <span className="text-[var(--risk-high)] font-bold mr-1.5">High risk (78):</span>
                  Uncapped liability and perpetual IP assignment create critical exposure.
                </p>
              </div>
            </div>

            {/* Count Chips & Action Buttons */}
            <div className="flex items-center justify-between lg:justify-end gap-3 flex-wrap">
              {/* Chips */}
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold badge-risk-high">
                  3 high
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold badge-risk-medium">
                  4 medium
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold badge-risk-low">
                  7 low
                </span>
              </div>

              {/* Actions */}
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

                {/* Export Dropdown simulation */}
                <div className="relative group">
                  <Button variant="secondary" size="sm" className="min-h-11 gap-1.5">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </Button>
                  <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] shadow-2xl py-1.5 hidden group-hover:block z-30">
                    <button
                      type="button"
                      onClick={() => handleExport("Word (.docx)")}
                      className="w-full text-left px-3.5 py-2 text-xs font-sans text-[var(--foreground)] hover:bg-[var(--surface)] hover:text-[var(--primary)] interactive-transition"
                    >
                      Word (.docx) with redlines
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExport("PDF report")}
                      className="w-full text-left px-3.5 py-2 text-xs font-sans text-[var(--foreground)] hover:bg-[var(--surface)] hover:text-[var(--primary)] interactive-transition"
                    >
                      PDF risk report
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExport("Calendar (.ics)")}
                      className="w-full text-left px-3.5 py-2 text-xs font-sans text-[var(--foreground)] hover:bg-[var(--surface)] hover:text-[var(--primary)] interactive-transition"
                    >
                      Calendar deadlines (.ics)
                    </button>
                  </div>
                </div>

                {/* Keyboard Help trigger */}
                <button
                  type="button"
                  onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                  className="p-2.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)] min-h-11 min-w-11 flex items-center justify-center interactive-transition"
                  title="Keyboard shortcuts (?)"
                  aria-label="Keyboard shortcuts"
                >
                  <Keyboard className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Export Toast Notification */}
          {exportNotification && (
            <div className="mt-3 p-2.5 rounded-lg bg-[rgba(95,211,160,0.12)] border border-[rgba(95,211,160,0.3)] text-[var(--risk-low)] text-xs font-sans font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{exportNotification}</span>
            </div>
          )}

          {/* Keyboard Shortcuts Popover */}
          {showKeyboardHelp && (
            <div className="mt-3 p-3 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-xs text-[var(--muted)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-mono">J</kbd> Next clause</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-mono">K</kbd> Prev clause</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-mono">A</kbd> Accept</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-mono">C</kbd> Copy wording</span>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyboardHelp(false)}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Close
              </button>
            </div>
          )}
        </section>

        {/* 2-Pane Desktop Workspace (340px Left Pane, Right Clause Detail) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Pane: Clause List & Filter Tabs (4 cols / ~340px) */}
          <aside className="lg:col-span-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4 space-y-4">
            
            {/* Filter Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">
              {(["all", "high", "medium", "low"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`py-1.5 rounded-md text-xs font-sans font-bold capitalize interactive-transition min-h-9 ${
                    filter === tab
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* List of Clauses */}
            <nav className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1" aria-label="Clauses List">
              {filteredClauses.map((clause) => {
                const isSelected = clause.id === selectedId;
                const Icon =
                  clause.riskLevel === "high"
                    ? ShieldAlert
                    : clause.riskLevel === "medium"
                    ? AlertTriangle
                    : CheckCircle2;

                const iconColor =
                  clause.riskLevel === "high"
                    ? "text-[#FF7A7A]"
                    : clause.riskLevel === "medium"
                    ? "text-[#F5C358]"
                    : "text-[#5FD3A0]";

                return (
                  <button
                    key={clause.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(clause.id);
                      setIsEditing(false);
                    }}
                    className={`relative w-full text-left p-3.5 rounded-xl interactive-transition flex items-center justify-between gap-3 min-h-12 cursor-pointer ${
                      isSelected
                        ? "bg-[var(--surface-raised)] text-[var(--foreground)] shadow-xs"
                        : "text-[var(--muted)] hover:bg-[var(--surface-raised)]/40 hover:text-[var(--foreground)]"
                    }`}
                  >
                    {/* Primary Left Indicator Bar */}
                    {isSelected && (
                      <span
                        className="absolute left-0 top-2 bottom-2 w-[3px] bg-[var(--primary)] rounded-r-full"
                        aria-hidden="true"
                      />
                    )}

                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} strokeWidth={2} />
                      <span className="text-sm font-sans font-bold truncate">
                        {clause.title}
                      </span>
                    </div>

                    {/* Decision Dot */}
                    <div className="shrink-0 flex items-center gap-1.5">
                      {clause.decision === "accepted" && (
                        <span className="w-2 h-2 rounded-full bg-[var(--risk-low)]" title="Accepted" />
                      )}
                      {clause.decision === "edited" && (
                        <span className="w-2 h-2 rounded-full bg-[var(--primary)]" title="Edited" />
                      )}
                      {clause.decision === "rejected" && (
                        <span className="w-2 h-2 rounded-full bg-[var(--risk-high)]" title="Rejected" />
                      )}
                      {clause.decision === "pending" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted)]/40" title="Pending" />
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right Pane: Clause Detail (8 cols) */}
          <main className="lg:col-span-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 sm:p-8 space-y-8 shadow-xl">
            
            {/* Header: Clause Title with Risk Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-[var(--muted)] font-bold">
                  Clause Detail
                </span>
                <h2 className="heading-2 text-[var(--foreground)]">
                  {selectedClause.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <RiskBadge level={selectedClause.riskLevel} />
                {selectedClause.decision === "edited" && (
                  <span className="text-xs px-2.5 py-1 rounded-md bg-[rgba(134,168,255,0.15)] text-[var(--primary)] font-bold border border-[rgba(134,168,255,0.3)]">
                    Edited
                  </span>
                )}
                {selectedClause.decision === "accepted" && (
                  <span className="text-xs px-2.5 py-1 rounded-md bg-[rgba(95,211,160,0.15)] text-[var(--risk-low)] font-bold border border-[rgba(95,211,160,0.3)]">
                    Accepted
                  </span>
                )}
                {selectedClause.decision === "rejected" && (
                  <span className="text-xs px-2.5 py-1 rounded-md bg-[rgba(255,122,122,0.15)] text-[var(--risk-high)] font-bold border border-[rgba(255,122,122,0.3)]">
                    Rejected
                  </span>
                )}
              </div>
            </div>

            {/* In Plain English (Explanation & Impact) */}
            <div className="rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] p-5 space-y-3">
              <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-[var(--primary)]">
                In Plain English
              </h3>
              <p className="text-base leading-relaxed text-[var(--foreground)] font-sans">
                {selectedClause.explanation}
              </p>
              <div className="pt-2 border-t border-[var(--border)]/60 text-sm leading-relaxed text-[var(--muted)] font-sans">
                <span className="font-bold text-[var(--risk-medium)] mr-1.5">Impact:</span>
                {selectedClause.impact}
              </div>
            </div>

            {/* Original Wording Block (Serif with Red Left Margin Bar) */}
            <div className="space-y-2">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-[var(--muted)]">
                Original Wording (From Contract)
              </span>
              <div className="rounded-xl bg-[var(--surface-raised)] border-l-4 border-l-[var(--risk-high)] border border-[var(--border)] p-5 font-serif text-base leading-relaxed text-[var(--foreground)]">
                &ldquo;{selectedClause.originalText}&rdquo;
              </div>
            </div>

            {/* Suggested Redline Block (Serif with Green Left Margin Bar) */}
            {selectedClause.suggestedRedline && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans font-bold uppercase tracking-wider text-[var(--risk-low)]">
                    Suggested Replacement Wording
                  </span>
                  {selectedClause.isDiffSnippet && (
                    <span className="text-xs text-[var(--muted)]">
                      Shown as diff against original
                    </span>
                  )}
                </div>

                {!isEditing ? (
                  <div className="rounded-xl bg-[var(--surface-raised)] border-l-4 border-l-[var(--risk-low)] border border-[var(--border)] p-5 font-serif text-base leading-relaxed text-[var(--foreground)] space-y-3">
                    <p className="text-[var(--risk-low)]">
                      &ldquo;{selectedClause.editedRedline || selectedClause.suggestedRedline}&rdquo;
                    </p>

                    {/* Diff demonstration snippet */}
                    {selectedClause.isDiffSnippet && !selectedClause.editedRedline && (
                      <div className="pt-2 border-t border-[var(--border)]/60 text-xs font-sans text-[var(--muted)]">
                        <span className="diff-del mr-2">{selectedClause.isDiffSnippet.del}</span>
                        <span className="diff-ins">{selectedClause.isDiffSnippet.ins}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Edit Mode: Textarea pre-filled with suggestion */
                  <div className="space-y-3">
                    <textarea
                      rows={4}
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--primary)] font-serif text-base leading-relaxed text-[var(--foreground)] focus:outline-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                        className="min-h-11"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleDecision(selectedClause.id, "edited", editedText)}
                        className="min-h-11"
                      >
                        Save redline
                      </Button>
                    </div>
                  </div>
                )}

                {/* Clause Action Row: Accept, Edit, Reject, Copy Wording */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      type="button"
                      variant={selectedClause.decision === "accepted" ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => handleDecision(selectedClause.id, "accepted")}
                      className="min-h-11 gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditedText(selectedClause.editedRedline || selectedClause.suggestedRedline || "");
                        setIsEditing(true);
                      }}
                      className="min-h-11 gap-1.5"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </Button>

                    <Button
                      type="button"
                      variant={selectedClause.decision === "rejected" ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => handleDecision(selectedClause.id, "rejected")}
                      className="min-h-11 gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </Button>

                    <CopyButton
                      textToCopy={selectedClause.editedRedline || selectedClause.suggestedRedline || ""}
                      label="Copy wording"
                      size="sm"
                    />
                  </div>

                  {/* Next Issue Jumper */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleNextIssue}
                    className="min-h-11 gap-1.5 text-xs font-bold text-[var(--primary)] hover:bg-[var(--surface-raised)]"
                  >
                    <span>Next issue</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Low-Risk Clauses Note */}
            {!selectedClause.suggestedRedline && (
              <div className="p-4 rounded-xl bg-[rgba(95,211,160,0.08)] border border-[rgba(95,211,160,0.25)] flex items-center gap-3 text-sm text-[var(--risk-low)] font-bold">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Low risk clause: Terms are balanced. No redline replacement needed.</span>
              </div>
            )}
          </main>
        </div>

        {/* Section: What the Contract Leaves Out (Missing Protections) */}
        <section className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="heading-3 text-[var(--foreground)] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[var(--risk-medium)]" />
              <span>What the contract leaves out</span>
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Provisions missing from the contract that you should consider asking to add.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Late Payment Interest",
                clause: "Invoices overdue beyond 30 days shall accrue interest at 1.5% per month.",
                description: "Protects cash flow if the client delays invoicing.",
              },
              {
                title: "Kill Fee & Cancellation",
                clause: "If project is terminated without cause, Client pays for all work performed plus a 20% cancellation fee.",
                description: "Compensates for reserved scheduling if client abruptly cancels.",
              },
              {
                title: "Revision Limits Cap",
                clause: "Fees include two (2) rounds of revision. Additional revisions billed at standard hourly rates.",
                description: "Prevents scope creep and endless review cycles.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-[var(--foreground)]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    {item.description}
                  </p>
                  <p className="font-serif text-xs leading-relaxed text-[var(--foreground)]/80 italic pt-1">
                    &ldquo;{item.clause}&rdquo;
                  </p>
                </div>

                <CopyButton
                  textToCopy={item.clause}
                  label="Copy clause"
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Section: Dates to Remember (Deadlines) */}
        <section className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="heading-3 text-[var(--foreground)] flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[var(--primary)]" />
              <span>Dates to remember</span>
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Key notice dates, renewal windows, and milestones extracted from the text.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                date: "Dec 15, 2026",
                title: "Auto-Renewal Notice Window",
                note: "Must give 30 days written notice to prevent automatic 12-month extension.",
              },
              {
                date: "Nov 30, 2026",
                title: "Phase 1 Final Acceptance",
                note: "Client has 10 business days to request revisions before automatic sign-off.",
              },
              {
                date: "Nov 15, 2026",
                title: "Invoice Milestone Submission",
                note: "Submit 50% midpoint invoice for milestone completion.",
              },
            ].map((d) => (
              <div
                key={d.title}
                className="p-5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] space-y-3 flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-[var(--primary)] uppercase">
                    {d.date}
                  </span>
                  <h3 className="font-bold text-sm text-[var(--foreground)] mt-1">
                    {d.title}
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                    {d.note}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(`Calendar event for ${d.title}`)}
                  className="w-full text-xs min-h-11 gap-1.5"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Add to calendar</span>
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Global Footer Legal Disclaimer */}
        <footer className="text-center text-xs text-[var(--muted)] font-sans pt-6 border-t border-[var(--border)]">
          General information only. Not legal advice.
        </footer>
      </div>

      {/* Negotiation Email Generator Dialog */}
      <EmailDialog
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        acceptedClauses={acceptedClauses}
        contractTitle="Acme Corp Master Services Agreement"
      />
    </AppShell>
  );
}

export default function AnalysisResultsPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
      <AnalysisResultsContent />
    </React.Suspense>
  );
}
