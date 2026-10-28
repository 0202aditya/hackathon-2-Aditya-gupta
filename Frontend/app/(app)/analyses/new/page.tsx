"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { Input } from "@/components/ui/input";
import {
  FileText,
  ClipboardPaste,
  ShieldCheck,
  Briefcase,
  Edit2,
  Lock,
} from "lucide-react";

export default function NewAnalysisPage() {
  const router = useRouter();

  // Contract tab: "upload" | "paste"
  const [activeTab, setActiveTab] = React.useState<"upload" | "paste">("upload");
  const [selectedFile, setSelectedFile] = React.useState<{ name: string; size: string } | null>(null);
  const [pastedText, setPastedText] = React.useState("");

  // Business profile
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [businessProfile, setBusinessProfile] = React.useState({
    whatYouDo: "Full-stack developer",
    businessType: "Sole proprietor",
    typicalProjectValue: "$2,500 – $10,000",
    countryOrState: "California, USA",
    mustKeep: "Payment within 30 days, I keep my reusable boilerplate",
  });

  // Privacy toggles
  const [redactionEnabled, setRedactionEnabled] = React.useState(false);
  const [consentChecked, setConsentChecked] = React.useState(false);

  const hasContractInput =
    activeTab === "upload" ? !!selectedFile : pastedText.trim().length > 50;

  const isFormValid = hasContractInput && consentChecked;

  const getDisabledReason = () => {
    if (!hasContractInput && !consentChecked) {
      return "Add a contract file or paste text, and accept the AI processing notice.";
    }
    if (!hasContractInput) {
      return "Please upload a contract file or paste contract text above.";
    }
    if (!consentChecked) {
      return "Please confirm the AI processing notice before analyzing.";
    }
    return "";
  };

  const handleStartAnalysis = () => {
    if (!isFormValid) return;
    router.push("/analyses/acme-msa?analyzing=true");
  };

  return (
    <AppShell userEmail="contractor@example.com">
      <div className="max-w-[780px] mx-auto w-full px-4 sm:px-6 py-8 space-y-10">
        {/* Header */}
        <div className="border-b border-[var(--border)] pb-6 space-y-2">
          <span className="text-xs uppercase tracking-wider text-[var(--primary)] font-bold">
            Step 1 of Review
          </span>
          <h1 className="heading-2 text-[var(--foreground)]">
            Review a contract
          </h1>
          <p className="text-base leading-relaxed text-[var(--muted)]">
            Upload your document or paste text. We will analyze each clause for risk, extract obligations, and draft redlines.
          </p>
        </div>

        {/* Section 1: Your Contract */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="heading-3 text-[var(--foreground)] flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[var(--surface-raised)] border border-[var(--border)] text-sm flex items-center justify-center text-[var(--primary)] font-bold">
                1
              </span>
              <span>Your contract</span>
            </h2>

            {/* Tabs */}
            <div className="flex items-center rounded-lg bg-[var(--surface)] border border-[var(--border)] p-1">
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-sans font-bold interactive-transition min-h-9 ${
                  activeTab === "upload"
                    ? "bg-[var(--surface-raised)] text-[var(--foreground)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Upload file</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("paste")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-sans font-bold interactive-transition min-h-9 ${
                  activeTab === "paste"
                    ? "bg-[var(--surface-raised)] text-[var(--foreground)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <ClipboardPaste className="w-4 h-4" />
                <span>Paste text</span>
              </button>
            </div>
          </div>

          {activeTab === "upload" ? (
            <FileDropzone
              selectedFile={selectedFile}
              onFileSelect={(file) => setSelectedFile(file)}
              onRemoveFile={() => setSelectedFile(null)}
            />
          ) : (
            <div className="space-y-2">
              <textarea
                rows={8}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the full text of your agreement here..."
                className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] text-base font-serif text-[var(--foreground)] placeholder:text-[var(--muted)]/60 transition-colors hover:border-[var(--border-strong)] focus:border-[var(--border-strong)] focus-visible:outline-2 focus-visible:outline-[var(--primary)] focus-visible:outline-offset-[3px]"
              />
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span>Min 50 characters</span>
                <span>{pastedText.length} characters</span>
              </div>
            </div>
          )}
        </section>

        {/* Section 2: Your Business (Collapsed Profile Summary) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="heading-3 text-[var(--foreground)] flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[var(--surface-raised)] border border-[var(--border)] text-sm flex items-center justify-center text-[var(--primary)] font-bold">
                2
              </span>
              <span>Your business profile</span>
            </h2>

            <button
              type="button"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="flex items-center gap-1.5 text-xs font-sans font-bold text-[var(--primary)] hover:underline p-1 min-h-9 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditingProfile ? "Done editing" : "Edit profile"}</span>
            </button>
          </div>

          <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
            {!isEditingProfile ? (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] shrink-0 mt-0.5">
                  <Briefcase className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div className="space-y-1.5 text-sm font-sans flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[var(--foreground)] font-bold">
                    <span>{businessProfile.whatYouDo}</span>
                    <span>&bull;</span>
                    <span className="text-[var(--muted)] font-normal">{businessProfile.businessType}</span>
                    <span>&bull;</span>
                    <span className="text-[var(--muted)] font-normal">{businessProfile.typicalProjectValue}</span>
                  </div>
                  <p className="text-xs text-[var(--muted)]">
                    <span className="font-bold text-[var(--foreground)]">Non-negotiables:</span> {businessProfile.mustKeep}
                  </p>
                  <p className="text-xs text-[var(--muted)]/70">
                    Jurisdiction: {businessProfile.countryOrState}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <Input
                  label="What you do"
                  value={businessProfile.whatYouDo}
                  onChange={(e) =>
                    setBusinessProfile((p) => ({ ...p, whatYouDo: e.target.value }))
                  }
                />
                <Input
                  label="Non-negotiables to protect"
                  value={businessProfile.mustKeep}
                  onChange={(e) =>
                    setBusinessProfile((p) => ({ ...p, mustKeep: e.target.value }))
                  }
                />
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Privacy Controls */}
        <section className="space-y-4">
          <h2 className="heading-3 text-[var(--foreground)] flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[var(--surface-raised)] border border-[var(--border)] text-sm flex items-center justify-center text-[var(--primary)] font-bold">
              3
            </span>
            <span>Privacy & security</span>
          </h2>

          <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-6">
            {/* Redaction Switch */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[var(--primary)]" />
                  <span className="text-base font-sans font-bold text-[var(--foreground)]">
                    Hide names, emails, and amounts before analysis
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)] leading-relaxed max-w-[500px]">
                  Automatically replaces client names, emails, and compensation sums with generic tokens before sending contract text to AI.
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={redactionEnabled}
                onClick={() => setRedactionEnabled(!redactionEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-[var(--primary)] focus-visible:outline-offset-[3px] ${
                  redactionEnabled ? "bg-[var(--primary)]" : "bg-[var(--surface-raised)] border-[var(--border)]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    redactionEnabled ? "translate-x-5 bg-[var(--background)]" : "translate-x-0 bg-[var(--muted)]"
                  }`}
                />
              </button>
            </div>

            {/* Mandatory AI Processing Checkbox */}
            <div className="pt-4 border-t border-[var(--border)]">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[var(--border)] bg-[var(--surface-raised)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                />
                <span className="text-sm font-sans text-[var(--foreground)] leading-relaxed">
                  I understand my contract text is processed by an AI service to produce this review. Uploaded files are processed in-memory and never stored.
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* CTA Button and Disabled State Explanation */}
        <div className="pt-4 space-y-3">
          <Button
            type="button"
            variant="primary"
            size="lg"
            disabled={!isFormValid}
            onClick={handleStartAnalysis}
            className="w-full justify-center min-h-12 text-base font-bold gap-2"
          >
            <ShieldCheck className="w-5 h-5" strokeWidth={2} />
            <span>Analyze contract</span>
          </Button>

          {!isFormValid && (
            <p className="text-center text-xs text-[var(--muted)]">
              {getDisabledReason()}
            </p>
          )}
        </div>

        {/* Footer Disclaimer */}
        <footer className="text-center text-xs text-[var(--muted)] font-sans pt-4">
          General information only. Not legal advice.
        </footer>
      </div>
    </AppShell>
  );
}
