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
}

interface PageProps {
  params: Promise<{ id: string }>;
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
  const score = analysis?.risk_score ?? 15;
  const overallRisk = (analysis?.overall_risk as RiskLevel) || "high";
  const summary = analysis?.summary || "Executive summary of contract review.";
  const clauses = analysis?.clauses || [];
  const missing = analysis?.missing_protections || [];
  const obligations = analysis?.obligations || [];

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) p-4 sm:p-8">
      {/* Top action toolbar (hidden when printing) */}
      <div className="max-w-210 mx-auto mb-8 flex items-center justify-between gap-4 print:hidden">
        <Link href={`/analyses/${id}`}>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Workspace</span>
          </Button>
        </Link>

        <Button variant="primary" size="sm" onClick={handlePrint} className="gap-2 font-bold">
          <Printer className="w-4 h-4" />
          <span>Save as PDF / Print</span>
        </Button>
      </div>

      {/* Printable Report Document */}
      <article className="max-w-210 mx-auto rounded-2xl bg-(--surface) border border-(--border) p-8 sm:p-12 space-y-10 shadow-2xl print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        
        {/* Report Header */}
        <header className="border-b border-(--border) pb-8 space-y-4 print:border-gray-300">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-(--primary) font-bold print:text-blue-700">
                Contract Risk Assessment & Redline Report
              </span>
              <h1 className="heading-2 text-(--foreground) print:text-black">
                {title}
              </h1>
            </div>

            <ScoreRing score={score} size={68} strokeWidth={6} />
          </div>

          <div className="flex items-center gap-6 text-xs text-(--muted) font-mono print:text-gray-600">
            <span>Date: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            <span>&bull;</span>
            <span className="uppercase font-bold">Risk Level: {overallRisk}</span>
            <span>&bull;</span>
            <span>Safety Score: {score}/100</span>
          </div>
        </header>

        {/* Executive Summary */}
        <section className="space-y-3">
          <h2 className="heading-3 text-(--foreground) print:text-black">
            Executive Summary
          </h2>
          <div className="p-5 rounded-xl bg-(--surface-raised) border border-(--border) text-sm font-sans leading-relaxed print:bg-gray-50 print:border-gray-200">
            {summary}
          </div>
        </section>

        {/* Clause Analysis */}
        <section className="space-y-6">
          <h2 className="heading-3 text-(--foreground) print:text-black">
            Identified Clause Risks & Redlines
          </h2>

          <div className="space-y-6">
            {clauses.map((clause, index) => (
              <div
                key={clause.id || index}
                className="p-5 rounded-xl bg-(--surface-raised) border border-(--border) space-y-3 break-inside-avoid print:bg-white print:border-gray-300"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono text-(--muted)">
                      #{index + 1}
                    </span>
                    <h3 className="font-bold text-sm text-(--foreground) print:text-black">
                      {clause.title || clause.clause_type}
                    </h3>
                  </div>
                  <RiskBadge level={clause.risk_level} />
                </div>

                {clause.explanation && (
                  <p className="text-xs text-(--muted) print:text-gray-700">
                    <strong className="text-(--foreground) print:text-black">Issue: </strong>
                    {clause.explanation}
                  </p>
                )}

                <div className="text-xs font-serif p-3 rounded-lg bg-(--surface) border border-(--border) print:bg-gray-100 print:border-gray-200">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-(--danger) block mb-1">
                    Original Contract Text
                  </span>
                  <p className="line-through text-(--muted) print:text-red-700">
                    &ldquo;{clause.original_text}&rdquo;
                  </p>
                </div>

                {clause.suggested_redline && (
                  <div className="text-xs font-serif p-3 rounded-lg bg-[rgba(134,168,255,0.06)] border border-[rgba(134,168,255,0.2)] print:bg-green-50 print:border-green-300">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-(--primary) print:text-green-800 block mb-1">
                      Proposed Redline Replacement
                    </span>
                    <p className="text-(--foreground) font-bold print:text-green-900">
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
            <h2 className="heading-3 text-(--foreground) print:text-black">
              Recommended Missing Safeguards
            </h2>

            <div className="space-y-3">
              {missing.map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-(--surface-raised) border border-(--border) space-y-1.5 print:bg-gray-50 print:border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-(--foreground) print:text-black">
                      {item.title}
                    </h3>
                    <span className="text-[10px] uppercase font-bold text-(--primary)">
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-xs text-(--muted) print:text-gray-600">
                    {item.description}
                  </p>
                  <p className="text-xs font-serif italic text-(--foreground)/90 pt-1 print:text-gray-800">
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
            <h2 className="heading-3 text-(--foreground) print:text-black">
              Key Obligations & Milestones
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {obligations.map((o, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-lg bg-(--surface-raised) border border-(--border) text-xs space-y-1 print:bg-gray-50 print:border-gray-200"
                >
                  <span className="font-mono text-[10px] text-(--primary) font-bold uppercase block">
                    {o.type || "Obligation"}
                  </span>
                  <p className="text-(--foreground) font-bold print:text-black">
                    {o.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Legal Disclaimer Footer */}
        <footer className="pt-6 border-t border-(--border) text-center text-xs text-(--muted) print:text-gray-500 print:border-gray-300">
          This report was generated by Contract Auto-Redline for negotiation preparation. It does not constitute formal legal counsel.
        </footer>
      </article>
    </div>
  );
}
