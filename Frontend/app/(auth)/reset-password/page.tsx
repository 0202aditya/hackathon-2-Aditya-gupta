"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } catch {
      setError("Failed to update password. Please request a new reset link.");
      setLoading(false);
    }
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

      {/* Main Centered 400px Panel */}
      <main className="w-full max-w-100 mx-auto my-auto py-8">
        <div className="rounded-2xl bg-(--surface) border border-(--border) p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="text-center space-y-1">
            <h1 className="heading-3 text-(--foreground)">Set new password</h1>
            <p className="text-sm text-(--muted)">
              Create a strong new password for your account.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[rgba(255,122,122,0.12)] border border-(--risk-high) text-sm text-(--risk-high) leading-relaxed">
              {error}
            </div>
          )}

          {success ? (
            <div className="p-4 rounded-xl bg-[rgba(95,211,160,0.12)] border border-(--risk-low) text-sm text-(--risk-low) leading-relaxed text-center">
              Password updated successfully! Redirecting to dashboard...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="New password (min 8 characters)"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
              />

              <Input
                label="Confirm new password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
              />

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full mt-2"
              >
                {loading ? "Updating password..." : "Update password"}
              </Button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-(--border)">
            <Link
              href="/sign-in"
              className="text-sm text-(--muted) hover:text-(--foreground) interactive-transition"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="text-center text-xs text-(--muted) font-sans py-2">
        General information only. Not legal advice.
      </footer>
    </div>
  );
}

