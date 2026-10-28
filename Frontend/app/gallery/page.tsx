"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { RiskBadge } from "@/components/ui/risk-badge";
import { CopyButton } from "@/components/ui/copy-button";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ScoreRing } from "@/components/analysis/score-ring";
import {
  FileSearch,
  Sparkles,
  Info,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

export default function GalleryPage() {
  const [demoActionFired, setDemoActionFired] = React.useState(false);

  const errorStatesMicrocopy = [
    {
      situation: "File can't be read",
      text: "We couldn't read this file. It may be a scan with no selectable text. Try a text-based PDF, a Word file, or paste the text.",
      badge: "Extraction error",
    },
    {
      situation: "File too large",
      text: "This file is over 10 MB. Try a smaller file or paste the text.",
      badge: "Validation error",
    },
    {
      situation: "Wrong file type",
      text: "Only PDF and Word files are supported.",
      badge: "Validation error",
    },
    {
      situation: "Analysis failed",
      text: "The analysis didn't finish. Nothing was lost. Try again.",
      badge: "AI pipeline error",
      hasButton: true,
      buttonText: "Try again",
    },
    {
      situation: "Daily limit reached",
      text: "You've used today's reviews. Your limit resets tomorrow.",
      badge: "Quota limit",
    },
    {
      situation: "Network error",
      text: "Can't connect right now. Check your connection and try again.",
      badge: "Connection error",
    },
  ];

  return (
    <AppShell userEmail="freelancer@example.com">
      <div className="max-w-[1120px] mx-auto w-full px-4 sm:px-6 py-8 space-y-12">
        {/* Step 1 Foundation Header */}
        <header className="border-b border-[var(--border)] pb-6">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-lg bg-[rgba(134,168,255,0.15)] text-[var(--primary)] text-sm font-sans font-bold border border-[rgba(134,168,255,0.3)]">
              UI Design Spec Verification Gallery
            </span>
            <span className="text-meta text-[var(--muted)]">
              Steps 1 through 6 Completed
            </span>
          </div>
          <h1 className="heading-2 text-[var(--foreground)]">
            Design System & Screen Directory
          </h1>
          <p className="text-base text-[var(--muted)] max-w-[680px] mt-2">
            Interactive reference and complete sitemap for all screens built with dark theme, Two Voices typography, shadcn components, and spec microcopy.
          </p>
        </header>

        {/* Section 0: All App Screens Sitemap */}
        <section className="space-y-4">
          <h2 className="heading-3 text-[var(--foreground)] flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-[var(--primary)]" />
            <span>Interactive App Screen Directory</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Landing Page", href: "/", desc: "Hero, 3 steps, StrikeReveal, What You Get, Privacy", badge: "Step 2" },
              { title: "Sign In", href: "/sign-in", desc: "400px centered panel, email/password form, errors", badge: "Step 3" },
              { title: "Sign Up", href: "/sign-up", desc: "Registration form with 8+ char password validation", badge: "Step 3" },
              { title: "Onboarding", href: "/onboarding", desc: "Business profile setup, dropdowns, skip action", badge: "Step 3" },
              { title: "Dashboard", href: "/dashboard", desc: "Review rows, risk badges, open/delete, empty state", badge: "Step 4" },
              { title: "New Review", href: "/analyses/new", desc: "File dropzone, paste text, profile summary, privacy", badge: "Step 4" },
              { title: "Analyzing State", href: "/analyses/acme-msa?analyzing=true", desc: "3 real stages progress animation", badge: "Step 5" },
              { title: "Results Workspace", href: "/analyses/acme-msa", desc: "2-pane layout, diff mark-up, redlines, email draft", badge: "Step 5" },
              { title: "Settings", href: "/settings", desc: "Profile editor, anonymous logging, delete account", badge: "Step 6" },
            ].map((scr) => (
              <Link
                key={scr.href}
                href={scr.href}
                className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--surface-raised)] interactive-transition space-y-2 group shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-base text-[var(--foreground)] group-hover:text-[var(--primary)] interactive-transition">
                      {scr.title}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--muted)]">
                      {scr.badge}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-[var(--muted)]">
                    {scr.desc}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--primary)] font-bold pt-2">
                  <span>Open screen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 1: Microcopy for States (Section 8) */}
        <section className="space-y-4">
          <h2 className="heading-3 text-[var(--foreground)] flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[var(--risk-medium)]" />
            <span>Microcopy for States (Section 8 of Spec)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {errorStatesMicrocopy.map((st) => (
              <div
                key={st.situation}
                className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[var(--foreground)]">
                    {st.situation}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[rgba(255,122,122,0.12)] border border-[rgba(255,122,122,0.25)] text-[var(--risk-high)] font-bold">
                    {st.badge}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[var(--muted)]">
                  {st.text}
                </p>
                {st.hasButton && (
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="min-h-9 text-xs">
                      {st.buttonText}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Color Palette Tokens */}
        <section className="space-y-4">
          <h2 className="heading-3 text-[var(--foreground)] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--primary)]" />
            <span>Color Tokens</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { token: "--background", name: "Jet zinc", hex: "#09090B", bg: "bg-[#09090B]", border: true },
              { token: "--surface", name: "Zinc surface", hex: "#121215", bg: "bg-[#121215]", border: true },
              { token: "--surface-raised", name: "Elevated zinc", hex: "#1C1C22", bg: "bg-[#1C1C22]", border: true },
              { token: "--border", name: "Zinc border", hex: "#27272F", bg: "bg-[#27272F]", border: false },
              { token: "--border-strong", name: "Zinc strong", hex: "#3F3F4E", bg: "bg-[#3F3F4E]", border: false },
              { token: "--foreground", name: "Crisp white", hex: "#F4F4F5", bg: "bg-[#F4F4F5]", textDark: true },
              { token: "--muted", name: "Zinc muted", hex: "#A1A1AA", bg: "bg-[#A1A1AA]", textDark: true },
              { token: "--primary", name: "Electric Cobalt", hex: "#3B82F6", bg: "bg-[#3B82F6]", textDark: true },
              { token: "--risk-high", name: "Crimson", hex: "#EF4444", bg: "bg-[#EF4444]", textDark: true },
              { token: "--risk-medium", name: "Amber", hex: "#F59E0B", bg: "bg-[#F59E0B]", textDark: true },
              { token: "--risk-low", name: "Emerald", hex: "#10B981", bg: "bg-[#10B981]", textDark: true },
            ].map((c) => (
              <div
                key={c.token}
                className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-2"
              >
                <div
                  className={`h-12 w-full rounded-lg ${c.bg} ${c.border ? "border border-[var(--border-strong)]" : ""}`}
                />
                <div>
                  <p className="font-bold text-sm leading-tight text-[var(--foreground)]">
                    {c.name}
                  </p>
                  <p className="text-meta text-[var(--muted)] font-mono">{c.hex}</p>
                  <p className="text-xs text-[var(--muted)]/70 font-mono">{c.token}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: RiskBadges & ScoreRing */}
        <section className="space-y-4">
          <h2 className="heading-3 text-[var(--foreground)] flex items-center gap-2">
            <Info className="w-5 h-5 text-[var(--primary)]" />
            <span>Risk Badges & Score Gauge</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
              <h3 className="text-base font-bold text-[var(--foreground)]">
                Risk Badges
              </h3>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <RiskBadge level="high" />
                <RiskBadge level="medium" />
                <RiskBadge level="low" />
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <RiskBadge level="high" label="High Risk" score={78} />
                <RiskBadge level="medium" label="Medium Risk" score={52} />
                <RiskBadge level="low" label="Low Risk" score={15} />
              </div>
            </div>

            <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
              <h3 className="text-base font-bold text-[var(--foreground)]">
                ScoreRing Component
              </h3>
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-3">
                  <ScoreRing score={78} size={56} />
                  <span className="text-xs font-bold text-[var(--risk-high)]">High (78)</span>
                </div>
                <div className="flex items-center gap-3">
                  <ScoreRing score={52} size={56} />
                  <span className="text-xs font-bold text-[var(--risk-medium)]">Med (52)</span>
                </div>
                <div className="flex items-center gap-3">
                  <ScoreRing score={15} size={56} />
                  <span className="text-xs font-bold text-[var(--risk-low)]">Low (15)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: CopyButton & EmptyState */}
        <section className="space-y-4">
          <h2 className="heading-3 text-[var(--foreground)]">
            CopyButton & EmptyState
          </h2>
          <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-6">
            <div className="flex items-center gap-4 flex-wrap">
              <CopyButton
                textToCopy="The Contractor's total liability under this Agreement shall not exceed the fees paid in the preceding twelve months."
                label="Copy suggested wording"
              />
              <CopyButton
                textToCopy="Payment terms: Net 30 days upon invoice receipt."
                label="Copy clause"
                variant="outline"
              />
            </div>

            <EmptyState
              icon={FileSearch}
              title="No contracts reviewed yet"
              description="Upload your first contract to see which clauses to change, identify one-sided risks, and receive balanced redlines."
              actionLabel="Review a contract"
              onAction={() => setDemoActionFired(true)}
            />
            {demoActionFired && (
              <p className="text-center text-sm text-[var(--risk-low)] font-bold">
                Action triggered successfully!
              </p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
