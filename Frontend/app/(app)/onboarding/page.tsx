"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = React.useState({
    whatYouDo: "",
    businessType: "sole_proprietor",
    typicalProjectValue: "2500_10000",
    countryOrState: "",
    mustKeep: "",
  });

  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const businessTypeOptions = [
    { value: "sole_proprietor", label: "Sole proprietor / Freelancer" },
    { value: "llc", label: "LLC / Registered company" },
    { value: "agency", label: "Agency / Small studio" },
    { value: "other", label: "Other" },
  ];

  const projectValueOptions = [
    { value: "under_2500", label: "Under $2,500" },
    { value: "2500_10000", label: "$2,500 – $10,000" },
    { value: "10000_50000", label: "$10,000 – $50,000" },
    { value: "50000_plus", label: "$50,000+" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        services: formData.whatYouDo,
        entity_type: formData.businessType,
        typical_project_value: formData.typicalProjectValue,
        jurisdiction: formData.countryOrState,
        non_negotiables: formData.mustKeep,
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Could not save profile. Check your connection and try again.");
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-(--background) text-(--foreground) px-4 py-8">
      {/* Top Header with Logo */}
      <header className="flex justify-center">
        <Link href="/" className="inline-flex items-center gap-3 interactive-transition hover:opacity-90">
          <Image
            src="/images/logo.png"
            alt="Contract Auto-Redline Logo"
            width={32}
            height={32}
            className="rounded-md shrink-0"
          />
          <span className="font-serif font-semibold text-xl text-(--foreground)">
            Contract Auto-Redline
          </span>
        </Link>
      </header>

      {/* Main Form Container */}
      <main className="w-full max-w-165 mx-auto my-auto py-8">
        <div className="rounded-2xl bg-(--surface) border border-(--border) p-6 sm:p-10 space-y-8 shadow-xl">
          {/* Header */}
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider text-(--primary) font-bold">
              Business Profile Setup
            </span>
            <h1 className="heading-2 text-(--foreground)">
              Tell us about your work.
            </h1>
            <p className="text-base leading-relaxed text-(--muted)">
              We use this to judge each clause for your situation. You can change it later.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-[rgba(255,122,122,0.12)] border border-(--risk-high) text-sm text-(--risk-high) leading-relaxed">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="What you do"
              placeholder="e.g., Software developer, Brand designer, Consultant"
              value={formData.whatYouDo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, whatYouDo: e.target.value }))
              }
              required
            />

            <Select
              label="Business type"
              options={businessTypeOptions}
              value={formData.businessType}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, businessType: e.target.value }))
              }
            />

            <Select
              label="Typical project value"
              options={projectValueOptions}
              value={formData.typicalProjectValue}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  typicalProjectValue: e.target.value,
                }))
              }
            />

            <Input
              label="Country or state"
              placeholder="e.g., California, USA or United Kingdom"
              value={formData.countryOrState}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  countryOrState: e.target.value,
                }))
              }
            />

            <div className="space-y-1.5 text-left">
              <label
                htmlFor="mustKeep"
                className="block text-sm font-sans font-bold text-(--foreground)"
              >
                What must stay in your contracts?
              </label>
              <textarea
                id="mustKeep"
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg bg-(--surface-raised) border border-(--border) text-base font-sans text-(--foreground) placeholder:text-(--muted)/60 transition-colors hover:border-(--border-strong) focus:border-(--border-strong) focus-visible:outline-2 focus-visible:outline-(--primary) focus-visible:outline-offset-[3px]"
                placeholder="For example: payment within 30 days, I keep my reusable code"
                value={formData.mustKeep}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, mustKeep: e.target.value }))
                }
              />
            </div>

            {/* Actions: Save and continue, and Skip for now */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-(--border)">
              <button
                type="button"
                onClick={handleSkip}
                className="text-sm font-sans font-bold text-(--muted) hover:text-(--foreground) min-h-11 flex items-center interactive-transition cursor-pointer"
              >
                Skip for now
              </button>

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full sm:w-auto min-w-45"
              >
                {loading ? "Saving profile..." : "Save and continue"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="text-center text-xs text-(--muted) font-sans py-2">
        General information only. Not legal advice.
      </footer>
    </div>
  );
}
