"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : "http://localhost:3000";

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${origin}/reset-password`,
        }
      );

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch {
      setError("Unable to process request right now. Check your connection.");
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
            <h1 className="heading-3 text-(--foreground)">Reset password</h1>
            <p className="text-sm text-(--muted)">
              Enter your email and we will send you a link to reset your password.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[rgba(255,122,122,0.12)] border border-(--risk-high) text-sm text-(--risk-high) leading-relaxed">
              {error}
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[rgba(95,211,160,0.12)] border border-(--risk-low) text-sm text-(--risk-low) leading-relaxed">
                Password reset link sent! Check your email inbox for instructions to set your new password.
              </div>
              <Link href="/sign-in" className="block text-center">
                <Button variant="outline" className="w-full min-h-11">
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Email address"
                type="email"
                placeholder="you@domain.com"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
              />

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full mt-2"
              >
                {loading ? "Sending link..." : "Send reset link"}
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

