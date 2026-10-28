"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Briefcase,
  Shield,
  Trash2,
  Check,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = React.useState({
    whatYouDo: "Full-stack developer",
    businessType: "sole_proprietor",
    typicalProjectValue: "2500_10000",
    countryOrState: "California, USA",
    mustKeep: "Payment within 30 days, I keep my reusable code and starter frameworks",
  });

  const [anonymousLogOptOut, setAnonymousLogOptOut] = React.useState(true);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = React.useState(false);
  const [accountDeleted, setAccountDeleted] = React.useState(false);

  // Fetch actual profile from Supabase on mount
  React.useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (prof) {
          setProfile({
            whatYouDo: prof.services || "",
            businessType: prof.entity_type || "sole_proprietor",
            typicalProjectValue: prof.typical_project_value || "2500_10000",
            countryOrState: prof.jurisdiction || "",
            mustKeep: prof.non_negotiables || "",
          });
          setAnonymousLogOptOut(prof.allow_anonymous_log ?? true);
        }
      }
    }
    loadProfile();
  }, [supabase]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        services: profile.whatYouDo,
        entity_type: profile.businessType,
        typical_project_value: profile.typicalProjectValue,
        jurisdiction: profile.countryOrState,
        non_negotiables: profile.mustKeep,
        allow_anonymous_log: anonymousLogOptOut,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  const handleDeleteAccount = async () => {
    setAccountDeleted(true);
    await supabase.auth.signOut();
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 1200);
  };

  return (
    <AppShell>
      <div className="max-w-190 mx-auto w-full px-4 sm:px-6 py-8 space-y-10">
        {/* Header */}
        <div className="border-b border-(--border) pb-6 space-y-1">
          <h1 className="heading-2 text-(--foreground)">Settings</h1>
          <p className="text-sm text-(--muted)">
            Manage your business profile, privacy preferences, and account.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-[rgba(255,122,122,0.12)] border border-(--risk-high) text-sm text-(--risk-high) leading-relaxed">
            {errorMessage}
          </div>
        )}

        {accountDeleted && (
          <div className="p-4 rounded-xl bg-[rgba(255,122,122,0.15)] border border-(--risk-high) text-(--risk-high) text-sm font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Account data successfully deleted. Redirecting to home...</span>
          </div>
        )}

        {/* Section 1: Your Business Profile */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-5 h-5 text-(--primary)" />
            <h2 className="heading-3 text-(--foreground)">Your business</h2>
          </div>

          <form onSubmit={handleSave} className="rounded-2xl bg-(--surface) border border-(--border) p-6 sm:p-8 space-y-6 shadow-md">
            <Input
              label="What you do"
              value={profile.whatYouDo}
              onChange={(e) => setProfile((p) => ({ ...p, whatYouDo: e.target.value }))}
            />

            <Select
              label="Business type"
              options={businessTypeOptions}
              value={profile.businessType}
              onChange={(e) => setProfile((p) => ({ ...p, businessType: e.target.value }))}
            />

            <Select
              label="Typical project value"
              options={projectValueOptions}
              value={profile.typicalProjectValue}
              onChange={(e) => setProfile((p) => ({ ...p, typicalProjectValue: e.target.value }))}
            />

            <Input
              label="Country or state"
              value={profile.countryOrState}
              onChange={(e) => setProfile((p) => ({ ...p, countryOrState: e.target.value }))}
            />

            <div className="space-y-1.5 text-left">
              <label
                htmlFor="settings-mustKeep"
                className="block text-sm font-sans font-bold text-(--foreground)"
              >
                What must stay in your contracts?
              </label>
              <textarea
                id="settings-mustKeep"
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg bg-(--surface-raised) border border-(--border) text-base font-sans text-(--foreground) placeholder:text-(--muted)/60 transition-colors hover:border-(--border-strong) focus:border-(--border-strong) focus-visible:outline-2 focus-visible:outline-(--primary) focus-visible:outline-offset-[3px]"
                value={profile.mustKeep}
                onChange={(e) => setProfile((p) => ({ ...p, mustKeep: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <Button type="submit" variant="primary" className="min-h-11 min-w-35">
                {saveSuccess ? (
                  <span className="flex items-center gap-1.5 text-(--primary-foreground)">
                    <Check className="w-4 h-4" />
                    <span>Saved</span>
                  </span>
                ) : (
                  <span>Save changes</span>
                )}
              </Button>
            </div>
          </form>
        </section>

        {/* Section 2: Privacy Settings */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-(--primary)" />
            <h2 className="heading-3 text-(--foreground)">Privacy</h2>
          </div>

          <div className="rounded-2xl bg-(--surface) border border-(--border) p-6 sm:p-8 space-y-4 shadow-md">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-1">
                <p className="text-base font-sans font-bold text-(--foreground)">
                  Help improve benchmarks with anonymous clause data
                </p>
                <p className="text-xs text-(--muted) leading-relaxed max-w-125">
                  No contract text, client names, or dollar amounts are ever stored or shared. Only anonymized clause tags and risk classifications are logged to calculate freelancer market baselines.
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={anonymousLogOptOut}
                onClick={() => setAnonymousLogOptOut(!anonymousLogOptOut)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-(--primary) focus-visible:outline-offset-[3px] ${
                  anonymousLogOptOut ? "bg-(--primary)" : "bg-(--surface-raised) border-(--border)"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    anonymousLogOptOut ? "translate-x-5 bg-(--background)" : "translate-x-0 bg-(--muted)"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Section 3: Delete Account (Danger Zone) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Trash2 className="w-5 h-5 text-(--risk-high)" />
            <h2 className="heading-3 text-(--foreground)">Delete account</h2>
          </div>

          <div className="rounded-2xl bg-(--surface) border border-[rgba(255,122,122,0.3)] p-6 sm:p-8 space-y-4 shadow-md">
            <div>
              <p className="text-base font-sans font-bold text-(--foreground)">
                Permanently delete account and all data
              </p>
              <p className="text-xs text-(--muted) leading-relaxed mt-1">
                Once deleted, all past analyses, redlines, saved decisions, and business profiles are permanently erased. This action cannot be reversed.
              </p>
            </div>

            <Button
              type="button"
              variant="destructive"
              onClick={() => setIsDeleteAccountOpen(true)}
              className="min-h-11"
            >
              Delete account
            </Button>
          </div>
        </section>

        {/* Global Footer Legal Disclaimer */}
        <footer className="text-center text-xs text-(--muted) font-sans pt-6 border-t border-(--border)">
          General information only. Not legal advice.
        </footer>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete your account?"
        description="Delete your account? This permanently removes all your analyses, business profile, and saved data. This cannot be undone."
        confirmLabel="Delete account"
        cancelLabel="Keep account"
        isDestructive={true}
      />
    </AppShell>
  );
}
