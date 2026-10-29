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
  Check,
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

  // 1. Contract Type
  const [contractType, setContractType] = React.useState<string>("");
  const [customContractType, setCustomContractType] = React.useState<string>("");

  // 2. What you're being paid
  const [paymentStructure, setPaymentStructure] = React.useState<string>("");
  const [customPaymentStructure, setCustomPaymentStructure] = React.useState<string>("");
  const [paymentRange, setPaymentRange] = React.useState<string>("");
  const [customPaymentRange, setCustomPaymentRange] = React.useState<string>("");

  // 3. Client type
  const [clientType, setClientType] = React.useState<string>("");
  const [customClientType, setCustomClientType] = React.useState<string>("");

  // 4. Describe the work
  const [workDescription, setWorkDescription] = React.useState<string>("");

  // 5. How long the work lasts
  const [duration, setDuration] = React.useState<string>("");
  const [customDuration, setCustomDuration] = React.useState<string>("");

  // 6. What matters most to you (priorities)
  const [priorities, setPriorities] = React.useState<string[]>([]);
  const [customPriority, setCustomPriority] = React.useState<string>("");

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

    const dealContext = {
      contractType: contractType || undefined,
      customContractType: contractType === "Other" && customContractType.trim() ? customContractType.trim() : undefined,
      paymentStructure: paymentStructure || undefined,
      customPaymentStructure: paymentStructure === "Other" && customPaymentStructure.trim() ? customPaymentStructure.trim() : undefined,
      paymentRange: paymentRange || undefined,
      customPaymentRange: paymentRange === "Other" && customPaymentRange.trim() ? customPaymentRange.trim() : undefined,
      clientType: clientType || undefined,
      customClientType: clientType === "Other" && customClientType.trim() ? customClientType.trim() : undefined,
      workDescription: workDescription.trim() || undefined,
      duration: duration || undefined,
      customDuration: duration === "Other" && customDuration.trim() ? customDuration.trim() : undefined,
      priorities: [
        ...priorities.filter((p) => p !== "Other"),
        ...(priorities.includes("Other") && customPriority.trim() ? [customPriority.trim()] : []),
      ],
    };

    const effectiveType = contractType === "Other" ? (customContractType || "Contract") : (contractType || "Contract");

    try {
      let res: Response;

      if (activeTab === "upload" && selectedFile?.rawFile) {
        const formData = new FormData();
        formData.append("file", selectedFile.rawFile);
        formData.append("contractType", effectiveType);
        formData.append("redactPII", redactionEnabled ? "true" : "false");
        formData.append("dealContext", JSON.stringify(dealContext));

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
            contractType: effectiveType,
            redactPII: redactionEnabled,
            fileName: "Pasted Contract",
            dealContext,
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
      <div className="max-w-280 mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-up">
        {/* Header */}
        <div className="border-b border-(--border) pb-6 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="text-xs uppercase tracking-wider text-(--primary) font-bold">
              Step 1 of Review
            </span>
            {userEmail && (
              <span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-(--surface-raised) border border-(--border) text-zinc-200 font-sans font-medium flex items-center gap-2" title={`Account: ${userEmail}`}>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{userEmail}</span>
              </span>
            )}
          </div>
          <h1 className="heading-2 text-2xl sm:text-3xl text-(--foreground)">
            Review a contract
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-(--muted)">
            Upload your document or paste text. We will analyze each clause for risk, extract obligations, and draft redlines tailored to your deal.
          </p>
        </div>

        {submitError && (
          <div className="rounded-xl border border-(--danger)/40 bg-(--danger)/10 p-4 sm:p-5 flex items-start gap-3.5">
            <AlertCircle className="w-5 h-5 text-(--danger) shrink-0 mt-0.5" />
            <div className="text-sm text-(--foreground)">
              <p className="font-bold text-(--danger) text-base">Analysis Failed</p>
              <p className="text-sm text-(--muted) mt-1">{submitError}</p>
            </div>
          </div>
        )}

        {/* Section 1: Your Contract */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="heading-3 text-lg sm:text-xl text-(--foreground) flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-(--surface-raised) border border-(--border) text-sm flex items-center justify-center text-(--primary) font-bold">
                1
              </span>
              <span>Your contract</span>
            </h2>

            {/* Tabs */}
            <div className="flex items-center rounded-xl bg-(--surface) border border-(--border) p-1">
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans font-bold interactive-transition min-h-10 cursor-pointer ${
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans font-bold interactive-transition min-h-10 cursor-pointer ${
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
            <div className="space-y-2.5">
              <textarea
                rows={9}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the full text of your agreement here..."
                className="w-full px-5 py-4 rounded-2xl bg-(--surface-raised) border border-(--border) text-base font-serif text-(--foreground) placeholder:text-(--muted)/60 transition-colors hover:border-(--border-strong) focus:border-(--border-strong) focus-visible:outline-2 focus-visible:outline-(--primary) focus-visible:outline-offset-[3px]"
              />
              <div className="flex items-center justify-between text-sm text-(--muted) px-1">
                <span>Min 50 characters</span>
                <span>{pastedText.length} characters</span>
              </div>
            </div>
          )}
        </section>

        {/* Section 2: Deal Context & Parameters */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="heading-3 text-lg sm:text-xl text-(--foreground) flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-(--surface-raised) border border-(--border) text-sm flex items-center justify-center text-(--primary) font-bold">
                2
              </span>
              <span>Deal context & parameters</span>
            </h2>
            <span className="text-sm text-zinc-400 font-sans hidden sm:inline">
              Helps AI tailor liability & redlines to your situation
            </span>
          </div>

          <div className="rounded-2xl bg-(--surface) border border-(--border) p-6 sm:p-8 space-y-7 shadow-sm">
            
            {/* 1. Contract Type */}
            <div className="space-y-3">
              <label className="text-sm sm:text-base font-bold font-sans uppercase tracking-wider text-zinc-200 block">
                1. Contract Type
              </label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {["Service agreement", "NDA", "SOW", "Not sure", "Other"].map((type) => {
                  const isSelected = contractType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setContractType((prev) => (prev === type ? "" : type))}
                      className={`px-4 py-2.5 rounded-xl text-sm font-sans font-medium transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-(--primary) text-(--primary-foreground) border-(--primary) font-semibold shadow-sm"
                          : "bg-(--surface-raised) text-zinc-200 border-(--border) hover:text-white hover:border-zinc-500"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
              {contractType === "Other" && (
                <div className="pt-1.5 animate-dropdown">
                  <Input
                    placeholder="Enter contract type (e.g. Subcontractor, Advisory, IP Assignment)..."
                    value={customContractType}
                    onChange={(e) => setCustomContractType(e.target.value)}
                    className="text-sm sm:text-base h-11 px-4 rounded-xl"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* 2. What you're being paid */}
            <div className="space-y-4">
              <label className="text-sm sm:text-base font-bold font-sans uppercase tracking-wider text-zinc-200 block">
                2. What you’re being paid
              </label>
              
              <div className="space-y-2">
                <span className="text-sm font-sans text-zinc-300 font-medium block">Payment structure:</span>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {["Fixed fee", "Hourly rate", "Monthly retainer", "Other"].map((structure) => {
                    const isSelected = paymentStructure === structure;
                    return (
                      <button
                        key={structure}
                        type="button"
                        onClick={() => setPaymentStructure((prev) => (prev === structure ? "" : structure))}
                        className={`px-4 py-2.5 rounded-xl text-sm font-sans font-medium transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-(--primary) text-(--primary-foreground) border-(--primary) font-semibold shadow-sm"
                            : "bg-(--surface-raised) text-zinc-200 border-(--border) hover:text-white hover:border-zinc-500"
                        }`}
                      >
                        {structure}
                      </button>
                    );
                  })}
                </div>
                {paymentStructure === "Other" && (
                  <div className="pt-1.5 animate-dropdown">
                    <Input
                      placeholder="Enter payment structure (e.g. Milestone-based, Revenue share, Equity)..."
                      value={customPaymentStructure}
                      onChange={(e) => setCustomPaymentStructure(e.target.value)}
                      className="text-sm sm:text-base h-11 px-4 rounded-xl"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-1">
                <span className="text-sm font-sans text-zinc-300 font-medium block">Value / Budget range:</span>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {["< $2,500", "$2,500 – $5,000", "$5,000 – $10,000", "$10,000 – $25,000", "$25,000+", "Other"].map((range) => {
                    const isSelected = paymentRange === range;
                    return (
                      <button
                        key={range}
                        type="button"
                        onClick={() => setPaymentRange((prev) => (prev === range ? "" : range))}
                        className={`px-4 py-2.5 rounded-xl text-sm font-sans font-medium transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-(--primary) text-(--primary-foreground) border-(--primary) font-semibold shadow-sm"
                            : "bg-(--surface-raised) text-zinc-200 border-(--border) hover:text-white hover:border-zinc-500"
                        }`}
                      >
                        {range}
                      </button>
                    );
                  })}
                </div>
                {paymentRange === "Other" && (
                  <div className="pt-1.5 animate-dropdown">
                    <Input
                      placeholder="Enter custom project value or rate (e.g. $125/hr, $75k total)..."
                      value={customPaymentRange}
                      onChange={(e) => setCustomPaymentRange(e.target.value)}
                      className="text-sm sm:text-base h-11 px-4 rounded-xl"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 3. Client type */}
            <div className="space-y-3">
              <label className="text-sm sm:text-base font-bold font-sans uppercase tracking-wider text-zinc-200 block">
                3. Client type
              </label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {["Individual", "Startup", "Large company", "Agency", "Government", "Other"].map((client) => {
                  const isSelected = clientType === client;
                  return (
                    <button
                      key={client}
                      type="button"
                      onClick={() => setClientType((prev) => (prev === client ? "" : client))}
                      className={`px-4 py-2.5 rounded-xl text-sm font-sans font-medium transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-(--primary) text-(--primary-foreground) border-(--primary) font-semibold shadow-sm"
                          : "bg-(--surface-raised) text-zinc-200 border-(--border) hover:text-white hover:border-zinc-500"
                      }`}
                    >
                      {client}
                    </button>
                  );
                })}
              </div>
              {clientType === "Other" && (
                <div className="pt-1.5 animate-dropdown">
                  <Input
                    placeholder="Enter client type (e.g. Non-profit organization, University, Venture capital)..."
                    value={customClientType}
                    onChange={(e) => setCustomClientType(e.target.value)}
                    className="text-sm sm:text-base h-11 px-4 rounded-xl"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* 4. Describe the work */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="text-sm sm:text-base font-bold font-sans uppercase tracking-wider text-zinc-200 block">
                  4. Describe the work
                </label>
                <span className="text-xs sm:text-sm text-zinc-400 font-sans">
                  AI checks deliverables and revisions against this
                </span>
              </div>
              <textarea
                rows={3}
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                placeholder="e.g. Building a mobile app MVP in React Native with Supabase auth and Stripe payments..."
                className="w-full px-4 py-3.5 rounded-xl bg-(--surface-raised) border border-(--border) text-sm sm:text-base font-sans text-white placeholder:text-zinc-500 focus:outline-none focus:border-(--primary)"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm text-zinc-400 mr-1 font-medium">Quick presets:</span>
                {[
                  "Mobile App MVP",
                  "Full-stack Web Platform",
                  "UI/UX Design System",
                  "Cloud & DevOps Migration",
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setWorkDescription(preset)}
                    className="text-xs sm:text-sm px-3.5 py-1.5 rounded-lg bg-(--surface-raised) border border-(--border) text-zinc-300 hover:text-white hover:border-zinc-500 cursor-pointer transition-colors font-medium"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. How long the work lasts */}
            <div className="space-y-3">
              <label className="text-sm sm:text-base font-bold font-sans uppercase tracking-wider text-zinc-200 block">
                5. How long the work lasts
              </label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {["One-off project", "Under 3 months", "3 to 12 months", "Ongoing / Retainer", "Other"].map((dur) => {
                  const isSelected = duration === dur;
                  return (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDuration((prev) => (prev === dur ? "" : dur))}
                      className={`px-4 py-2.5 rounded-xl text-sm font-sans font-medium transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-(--primary) text-(--primary-foreground) border-(--primary) font-semibold shadow-sm"
                          : "bg-(--surface-raised) text-zinc-200 border-(--border) hover:text-white hover:border-zinc-500"
                      }`}
                    >
                      {dur}
                    </button>
                  );
                })}
              </div>
              {duration === "Other" && (
                <div className="pt-1.5 animate-dropdown">
                  <Input
                    placeholder="Enter expected timeline (e.g. 2 weeks, Multi-year roadmap)..."
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    className="text-sm sm:text-base h-11 px-4 rounded-xl"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* 6. What matters most to you in this deal */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="text-sm sm:text-base font-bold font-sans uppercase tracking-wider text-zinc-200 block">
                  6. What matters most to you in this deal
                </label>
                <span className="text-xs sm:text-sm text-zinc-400 font-sans font-medium">
                  Select all that apply
                </span>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                {[
                  { id: "Get paid on time", label: "💵 Get paid on time" },
                  { id: "Keep my IP", label: "🛡️ Keep my IP & tools" },
                  { id: "Limit my liability", label: "⚖️ Limit my liability" },
                  { id: "Easy exit", label: "🚪 Easy exit / termination" },
                  { id: "Work for other clients", label: "🌐 Work for other clients" },
                  { id: "Other", label: "✏️ Other" },
                ].map((item) => {
                  const isChecked = priorities.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setPriorities((prev) => prev.filter((p) => p !== item.id));
                        } else {
                          setPriorities((prev) => [...prev, item.id]);
                        }
                      }}
                      className={`px-4 py-2.5 rounded-xl text-sm font-sans font-medium transition-all cursor-pointer border flex items-center gap-2 ${
                        isChecked
                          ? "bg-(--primary) text-(--primary-foreground) border-(--primary) font-semibold shadow-sm"
                          : "bg-(--surface-raised) text-zinc-200 border-(--border) hover:text-white hover:border-zinc-500"
                      }`}
                    >
                      {isChecked && <Check className="w-4 h-4 text-white" strokeWidth={2.5} />}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
              {priorities.includes("Other") && (
                <div className="pt-1.5 animate-dropdown">
                  <Input
                    placeholder="Enter custom priority (e.g. Strict confidentiality, Payment in USD only)..."
                    value={customPriority}
                    onChange={(e) => setCustomPriority(e.target.value)}
                    className="text-sm sm:text-base h-11 px-4 rounded-xl"
                    autoFocus
                  />
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Section 3: Privacy & Redaction */}
        <section className="space-y-4">
          <h2 className="heading-3 text-lg sm:text-xl text-(--foreground) flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-(--surface-raised) border border-(--border) text-sm flex items-center justify-center text-(--primary) font-bold">
              3
            </span>
            <span>Confidentiality & Privacy</span>
          </h2>

          <div className="rounded-2xl bg-(--surface) border border-(--border) p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-(--primary)" />
                  <span className="text-base font-sans font-bold text-(--foreground)">
                    In-browser PII Redaction
                  </span>
                </div>
                <p className="text-sm text-(--muted)">
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
                  className="mt-1 h-4.5 w-4.5 rounded border-(--border) bg-(--surface-raised) text-(--primary) focus:ring-(--primary) cursor-pointer shrink-0"
                />
                <span className="text-sm sm:text-base font-sans text-(--foreground) leading-relaxed">
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
            className="w-full justify-center min-h-13 text-base sm:text-lg font-bold gap-2 py-3.5 cursor-pointer"
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
            <p className="text-center text-sm text-(--muted)">
              {getDisabledReason()}
            </p>
          )}
        </div>

        {/* Footer Disclaimer */}
        <footer className="text-center text-xs sm:text-sm text-(--muted) font-sans pt-4">
          General information only. Not legal advice.
        </footer>
      </div>
    </AppShell>
  );
}
