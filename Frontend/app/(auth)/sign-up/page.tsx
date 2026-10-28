"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = React.useState(false);
  const [successNotice, setSuccessNotice] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Please enter your email address.";
    } else if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Please create a password.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrors({ general: error.message });
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push("/onboarding");
      } else {
        setSuccessNotice(
          "Account created! If email confirmation is enabled in your Supabase project, please check your inbox to confirm before signing in."
        );
        setLoading(false);
      }
    } catch {
      setErrors({ general: "Unable to connect right now. Check your connection and try again." });
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
            <h1 className="heading-3 text-(--foreground)">Create account</h1>
            <p className="text-sm text-(--muted)">
              Start reviewing and redlining your client contracts.
            </p>
          </div>

          {errors.general && (
            <div className="p-3 rounded-lg bg-[rgba(255,122,122,0.12)] border border-(--risk-high) text-sm text-(--risk-high) leading-relaxed">
              {errors.general}
            </div>
          )}

          {successNotice && (
            <div className="p-3 rounded-lg bg-[rgba(95,211,160,0.12)] border border-(--risk-low) text-sm text-(--risk-low) leading-relaxed">
              {successNotice}
              <div className="mt-2">
                <Link href="/sign-in" className="font-bold underline">
                  Go to Sign in
                </Link>
              </div>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email address"
              type="email"
              placeholder="you@domain.com"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email || errors.general) setErrors((prev) => ({ ...prev, email: undefined, general: undefined }));
              }}
              error={errors.email}
            />

            <Input
              label="Password (min 8 characters)"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password || errors.general) setErrors((prev) => ({ ...prev, password: undefined, general: undefined }));
              }}
              error={errors.password}
            />

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full mt-2"
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          {/* Bottom Switch Link */}
          <div className="text-center pt-2 border-t border-(--border)">
            <p className="text-sm text-(--muted)">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-(--primary) font-bold hover:underline interactive-transition"
              >
                Sign in
              </Link>
            </p>
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
