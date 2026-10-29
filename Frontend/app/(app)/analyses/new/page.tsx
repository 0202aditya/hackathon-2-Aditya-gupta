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
  Loader2,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function NewAnalysisPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });
  }, []);

  // Contract tab: "upload" | "paste"
  const [activeTab, setActiveTab] = React.useState<"upload" | "paste">("upload");
  const [selectedFile, setSelectedFile] = React.useState<{ name: string; size: string; rawFile?: File } | null>(null);
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

  // Submission state
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const hasContractInput =
    activeTab === "upload" ? !!selectedFile?.rawFile : pastedText.trim().length > 50;

  const isFormValid = hasContractInput && consentChecked && !isSubmitting;

  const getDisabledReason = () => {
    if (isSubmitting) {
      return "Analyzing contract with Gemini AI... Please wait.";
    }
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

  const handleStartAnalysis = async () => {
    if (!isFormValid) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let res: Response;

      if (activeTab === "upload" && selectedFile?.rawFile) {
        const formData = new FormData();
        formData.append("file", selectedFile.rawFile);
        formData.append("contractType", "contract");
        formData.append("redactPII", redactionEnabled ? "true" : "false");

        res = await fetch("/api/analyses", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/analyses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: pastedText,
            contractType: "contract",
            redactPII: redactionEnabled,
            fileName: "Pasted Contract",
          }),
        });
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to analyze contract. Please try again.");
      }

      // Navigate to the analysis workspace with the created analysis ID
      router.push(`/analyses/${data.analysisId}`);
    } catch (err: unknown) {
      console.error("Submission error:", err);
      const message = err instanceof Error ? err.message : "Failed to analyze contract.";
      setSubmitError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-195 mx-auto w-full px-4 sm:px-6 py-8 space-y-10">
        {/* Header */}
        <div className="border-b border-(--border) pb-6 space-y-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="text-xs uppercase tracking-wider text-(--primary) font-bold">
              Step 1 of Review
            </span>
            {userEmail && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-(--surface-raised) border border-(--border) text-zinc-300 font-sans font-medium flex items-center gap-1.5" title={`Account: ${userEmail}`}>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{userEmail}</span>
              </span>
            )}
          </div>
          <h1 className="heading-2 text-(--foreground)">
            Review a contract
          </h1>
          <p className="text-base leading-relaxed text-(--muted)">
            Upload your document or paste text. We will analyze each clause for risk, extract obligations, and draft redlines.
          </p>
        </div>

        {submitError && (
          <div className="rounded-xl border border-(--danger)/40 bg-(--danger)/10 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-(--danger) shrink-0 mt-0.5" />
            <div className="text-sm text-(--foreground)">
              <p className="font-bold text-(--danger)">Analysis Failed</p>
              <p className="text-xs text-(--muted) mt-1">{submitError}</p>
            </div>
          </div>
        )}

        {/* Section 1: Your Contract */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="heading-3 text-(--foreground) flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-(--surface-raised) border border-(--border) text-sm flex items-center justify-center text-(--primary) font-bold">
                1
              </span>
              <span>Your contract</span>
            </h2>

            {/* Tabs */}
            <div className="flex items-center rounded-lg bg-(--surface) border border-(--border) p-1">
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-sans font-bold interactive-transition min-h-9 ${
                  activeTab === "upload"
                    ? "bg-(--surface-raised) text-(--foreground) shadow-xs"
                    : "text-(--muted) hover:text-(--foreground)"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Upload document</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("paste")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-sans font-bold interactive-transition min-h-9 ${
                  activeTab === "paste"
                    ? "bg-(--surface-raised) text-(--foreground) shadow-xs"
                    : "text-(--muted) hover:text-(--foreground)"
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
                className="w-full px-4 py-3 rounded-2xl bg-(--surface-raised) border border-(--border) text-base font-serif text-(--foreground) placeholder:text-(--muted)/60 transition-colors hover:border-(--border-strong) focus:border-(--border-strong) focus-visible:outline-2 focus-visible:outline-(--primary) focus-visible:outline-offset-[3px]"
              />
              <div className="flex items-center justify-between text-xs text-(--muted)">
                <span>Min 50 characters</span>
                <span>{pastedText.length} characters</span>
              </div>
            </div>
          )}
        </section>

        {/* Section 2: Business Profile Context */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="heading-3 text-(--foreground) flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-(--surface-raised) border border-(--border) text-sm flex items-center justify-center text-(--primary) font-bold">
                2
              </span>
              <span>Your profile context</span>
            </h2>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="text-xs gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditingProfile ? "Done" : "Edit context"}</span>
            </Button>
          </div>

          <div className="rounded-2xl bg-(--surface) border border-(--border) p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-(--primary) shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-sans font-bold text-(--foreground)">
                  How we tailor this review
                </p>
                <p className="text-xs text-(--muted) leading-relaxed">
                  We evaluate IP retention, liability, and payment terms against what is standard for your specific role.
                </p>
              </div>
            </div>

            {isEditingProfile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Input
                  label="What you do"
                  value={businessProfile.whatYouDo}
                  onChange={(e) =>
                    setBusinessProfile({ ...businessProfile, whatYouDo: e.target.value })
                  }
                />
                <Input
                  label="Business entity"
                  value={businessProfile.businessType}
                  onChange={(e) =>
                    setBusinessProfile({ ...businessProfile, businessType: e.target.value })
                  }
                />
                <Input
                  label="Typical project value"
                  value={businessProfile.typicalProjectValue}
                  onChange={(e) =>
                    setBusinessProfile({
                      ...businessProfile,
                      typicalProjectValue: e.target.value,
                    })
                  }
                />
                <Input
                  label="Jurisdiction / State"
                  value={businessProfile.countryOrState}
                  onChange={(e) =>
                    setBusinessProfile({
                      ...businessProfile,
                      countryOrState: e.target.value,
                    })
                  }
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Non-negotiables"
                    value={businessProfile.mustKeep}
                    onChange={(e) =>
                      setBusinessProfile({ ...businessProfile, mustKeep: e.target.value })
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-lg bg-(--surface-raised) border border-(--border)">
                  <span className="text-(--muted) block">Role</span>
                  <span className="font-bold text-(--foreground) truncate block mt-0.5">
                    {businessProfile.whatYouDo}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-(--surface-raised) border border-(--border)">
                  <span className="text-(--muted) block">Entity</span>
                  <span className="font-bold text-(--foreground) truncate block mt-0.5">
                    {businessProfile.businessType}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-(--surface-raised) border border-(--border)">
                  <span className="text-(--muted) block">Project Size</span>
                  <span className="font-bold text-(--foreground) truncate block mt-0.5">
                    {businessProfile.typicalProjectValue}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-(--surface-raised) border border-(--border)">
                  <span className="text-(--muted) block">Location</span>
                  <span className="font-bold text-(--foreground) truncate block mt-0.5">
                    {businessProfile.countryOrState}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Privacy & Redaction */}
        <section className="space-y-4">
          <h2 className="heading-3 text-(--foreground) flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-(--surface-raised) border border-(--border) text-sm flex items-center justify-center text-(--primary) font-bold">
              3
            </span>
            <span>Confidentiality & Privacy</span>
          </h2>

          <div className="rounded-2xl bg-(--surface) border border-(--border) p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-(--primary)" />
                  <span className="text-sm font-sans font-bold text-(--foreground)">
                    In-browser PII Redaction
                  </span>
                </div>
                <p className="text-xs text-(--muted)">
                  Automatically masks email addresses, phone numbers, and identifying entity numbers before sending to AI.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={redactionEnabled}
                onClick={() => setRedactionEnabled(!redactionEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  redactionEnabled ? "bg-(--primary)" : "bg-(--surface-raised) border-(--border)"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    redactionEnabled ? "translate-x-5 bg-(--background)" : "translate-x-0 bg-(--muted)"
                  }`}
                />
              </button>
            </div>

            {/* Mandatory AI Processing Checkbox */}
            <div className="pt-4 border-t border-(--border)">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-(--border) bg-(--surface-raised) text-(--primary) focus:ring-(--primary) cursor-pointer"
                />
                <span className="text-sm font-sans text-(--foreground) leading-relaxed">
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
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing contract with Gemini...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" strokeWidth={2} />
                <span>Analyze contract</span>
              </>
            )}
          </Button>

          {!isFormValid && (
            <p className="text-center text-xs text-(--muted)">
              {getDisabledReason()}
            </p>
          )}
        </div>

        {/* Footer Disclaimer */}
        <footer className="text-center text-xs text-(--muted) font-sans pt-4">
          General information only. Not legal advice.
        </footer>
      </div>
    </AppShell>
  );
}
