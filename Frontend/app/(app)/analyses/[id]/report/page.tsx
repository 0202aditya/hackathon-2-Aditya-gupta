"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RiskBadge, RiskLevel } from "@/components/ui/risk-badge";
import { ScoreRing } from "@/components/analysis/score-ring";

interface ReportClause {
  id: string;
  title?: string;
  clause_type?: string;
  risk_level: RiskLevel;
  explanation?: string;
  original_text: string;
  suggested_redline?: string;
  edited_redline?: string;
}

interface ReportMissing {
  title: string;
  severity: string;
  description: string;
  suggestedClause: string;
}

interface ReportObligation {
  type?: string;
  description: string;
}

interface ReportAnalysis {
  title?: string;
  risk_score?: number;
  overall_risk?: string;
  summary?: string;
  clauses?: ReportClause[];
  missing_protections?: ReportMissing[];
  obligations?: ReportObligation[];
  deal_context?: {
    contractType?: string;
    customContractType?: string;
    paymentStructure?: string;
    customPaymentStructure?: string;
    paymentRange?: string;
    customPaymentRange?: string;
    clientType?: string;
    customClientType?: string;
    workDescription?: string;
    duration?: string;
    customDuration?: string;
    priorities?: string[];
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
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

export default function AnalysisReportPage({ params }: PageProps) {
  const { id } = React.use(params);
  const [analysis, setAnalysis] = React.useState<ReportAnalysis | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/analyses/${id}`);
        if (res.ok) {
          const data = await res.json();
          setAnalysis(data.analysis);
        }
      } catch (err) {
        console.error("Report fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-(--background) flex items-center justify-center p-4">
        <p className="text-sm text-(--muted)">Generating report view...</p>
      </div>
    );
  }

  const title = analysis?.title || "Contract Risk Assessment Report";
  const overallRisk = (analysis?.overall_risk as RiskLevel) || "high";
  const rawScore = analysis?.risk_score ?? 85;
  const score = normalizeRiskScore(rawScore, overallRisk);
  const summary = analysis?.summary || "Executive summary of contract review.";
  const clauses = analysis?.clauses || [];
  const missing = analysis?.missing_protections || [];
  const obligations = analysis?.obligations || [];

  const dc = analysis?.deal_context;

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) p-4 sm:p-8">
      {/* Top action toolbar (hidden when printing) */}
      <div className="max-w-280 mx-auto mb-8 flex items-center justify-between gap-4 print:hidden">
        <Link href={`/analyses/${id}`}>
          <Button variant="outline" size="sm" className="gap-2 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Workspace</span>
          </Button>
        </Link>

        <Button variant="primary" size="sm" onClick={handlePrint} className="gap-2 font-bold text-sm">
          <Printer className="w-4 h-4" />
          <span>Save as PDF / Print</span>
        </Button>
      </div>

      {/* Printable Report Document */}
      <article className="max-w-280 mx-auto w-full rounded-2xl bg-(--surface) border border-(--border) p-8 sm:p-12 space-y-10 shadow-2xl print:max-w-none print:w-full print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        
        {/* Report Header */}
        <header className="border-b border-(--border) pb-8 space-y-4 print:border-gray-300">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-2 min-w-0 flex-1">
              <span className="text-sm uppercase tracking-wider text-(--primary) font-bold print:text-blue-700 block">
                Contract Risk Assessment & Redline Report
              </span>
              <h1 className="text-2xl sm:text-4xl font-bold font-serif text-(--foreground) print:text-black leading-tight">
                {title}
              </h1>
            </div>

            <ScoreRing score={score} size={78} strokeWidth={6} />
          </div>

          <div className="flex items-center gap-6 text-sm text-(--muted) font-mono print:text-gray-600 flex-wrap">
            <span>Date: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            <span>&bull;</span>
            <span className="uppercase font-bold">Risk Level: {overallRisk}</span>
            <span>&bull;</span>
            <span>Safety Score: {score}/100</span>
          </div>
        </header>

        {/* Executive Summary */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-(--foreground) print:text-black">
            Executive Summary
          </h2>
          <div className="p-6 sm:p-7 rounded-2xl bg-(--surface-raised) border border-(--border) text-base sm:text-lg font-sans leading-relaxed text-zinc-200 print:text-black print:bg-gray-50 print:border-gray-200">
            {summary}
          </div>
        </section>

        {/* Deal Context Parameters (if present) */}
        {dc && (
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-(--foreground) print:text-black">
              Commercial Deal Context
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="p-4 rounded-xl bg-(--surface-raised) border border-(--border) space-y-1 print:bg-gray-50 print:border-gray-200">
                <span className="text-xs text-zinc-400 font-sans block print:text-gray-600">Contract Type</span>
                <span className="font-bold text-white print:text-black block text-sm">
                  {dc.customContractType || dc.contractType || "Not specified"}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-(--surface-raised) border border-(--border) space-y-1 print:bg-gray-50 print:border-gray-200">
                <span className="text-xs text-zinc-400 font-sans block print:text-gray-600">Payment & Value</span>
                <span className="font-bold text-white print:text-black block text-sm">
                  {dc.customPaymentRange || dc.paymentRange || "Not specified"}
                  {(dc.customPaymentStructure || dc.paymentStructure) ? ` • ${dc.customPaymentStructure || dc.paymentStructure}` : ""}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-(--surface-raised) border border-(--border) space-y-1 print:bg-gray-50 print:border-gray-200">
                <span className="text-xs text-zinc-400 font-sans block print:text-gray-600">Client Profile</span>
                <span className="font-bold text-white print:text-black block text-sm">
                  {dc.customClientType || dc.clientType || "Not specified"}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-(--surface-raised) border border-(--border) space-y-1 print:bg-gray-50 print:border-gray-200">
                <span className="text-xs text-zinc-400 font-sans block print:text-gray-600">Duration</span>
                <span className="font-bold text-white print:text-black block text-sm">
                  {dc.customDuration || dc.duration || "Not specified"}
                </span>
              </div>
            </div>
            {dc.workDescription && (
              <div className="p-4 rounded-xl bg-(--surface-raised) border border-(--border) text-sm print:bg-gray-50 print:border-gray-200 space-y-1">
                <span className="text-xs text-zinc-400 font-sans font-bold uppercase tracking-wider block print:text-gray-600">
                  Stated Scope of Work
                </span>
                <p className="text-sm sm:text-base text-zinc-200 print:text-black leading-relaxed">
                  &ldquo;{dc.workDescription}&rdquo;
                </p>
              </div>
            )}
          </section>
        )}

        {/* Clause Analysis */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-(--foreground) print:text-black">
            Identified Clause Risks & Redlines
          </h2>

          <div className="space-y-6">
            {clauses.map((clause, index) => (
              <div
                key={clause.id || index}
                className="p-6 sm:p-8 rounded-2xl bg-(--surface-raised) border border-(--border) space-y-4 break-inside-avoid print:bg-white print:border-gray-300"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold font-mono text-(--muted)">
                      #{index + 1}
                    </span>
                    <h3 className="font-bold text-lg sm:text-xl text-(--foreground) print:text-black">
                      {clause.title || clause.clause_type}
                    </h3>
                  </div>
                  <RiskBadge level={clause.risk_level} />
                </div>

                {clause.explanation && (
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed print:text-gray-800">
                    <strong className="text-(--foreground) font-bold print:text-black">Issue: </strong>
                    {clause.explanation}
                  </p>
                )}

                <div className="p-4 sm:p-5 rounded-xl bg-(--surface) border border-(--border) print:bg-gray-100 print:border-gray-200 space-y-2">
                  <span className="text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-(--danger) block">
                    Original Contract Text
                  </span>
                  <p className="text-sm sm:text-base font-serif leading-relaxed line-through text-zinc-400 print:text-red-700">
                    &ldquo;{clause.original_text}&rdquo;
                  </p>
                </div>

                {clause.suggested_redline && (
                  <div className="p-4 sm:p-5 rounded-xl bg-[rgba(134,168,255,0.08)] border border-[rgba(134,168,255,0.25)] print:bg-green-50 print:border-green-300 space-y-2">
                    <span className="text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-(--primary) print:text-green-800 block">
                      Proposed Redline Replacement
                    </span>
                    <p className="text-sm sm:text-base font-serif leading-relaxed font-semibold text-(--foreground) print:text-green-950">
                      &ldquo;{clause.edited_redline || clause.suggested_redline}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Missing Protections */}
        {missing.length > 0 && (
          <section className="space-y-4 break-inside-avoid">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-(--foreground) print:text-black">
              Recommended Missing Safeguards
            </h2>

            <div className="space-y-4">
              {missing.map((item, i) => (
                <div
                  key={i}
                  className="p-5 sm:p-6 rounded-xl bg-(--surface-raised) border border-(--border) space-y-2.5 print:bg-gray-50 print:border-gray-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold text-base sm:text-lg text-(--foreground) print:text-black">
                      {item.title}
                    </h3>
                    <span className="text-xs uppercase font-bold text-(--primary) px-2.5 py-1 rounded bg-(--surface) border border-(--border)">
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed print:text-gray-700">
                    {item.description}
                  </p>
                  <p className="text-sm sm:text-base font-serif italic text-(--foreground)/95 pt-2 leading-relaxed print:text-gray-800">
                    &ldquo;{item.suggestedClause}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Deliverables & Obligations */}
        {obligations.length > 0 && (
          <section className="space-y-4 break-inside-avoid">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-(--foreground) print:text-black">
              Key Obligations & Milestones
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {obligations.map((o, i) => (
                <div
                  key={i}
                  className="p-4 sm:p-5 rounded-xl bg-(--surface-raised) border border-(--border) space-y-1.5 print:bg-gray-50 print:border-gray-200"
                >
                  <span className="font-mono text-xs text-(--primary) font-bold uppercase block">
                    {o.type || "Obligation"}
                  </span>
                  <p className="text-sm sm:text-base font-bold text-(--foreground) print:text-black leading-relaxed">
                    {o.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Legal Disclaimer Footer */}
        <footer className="pt-6 border-t border-(--border) text-center text-sm text-(--muted) print:text-gray-500 print:border-gray-300">
          This report was generated by Contract Auto-Redline for negotiation preparation. It does not constitute formal legal counsel.
        </footer>
      </article>
    </div>
  );
}
