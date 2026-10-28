import Link from "next/link";
import Image from "next/image";

export function LandingFooter() {
  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--surface)] py-12">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Left Disclaimer & Logo */}
        <div className="flex items-start sm:items-center gap-4 max-w-[620px]">
          <Image
            src="/images/logo.png"
            alt="Contract Auto-Redline Logo"
            width={32}
            height={32}
            className="rounded-md shrink-0 mt-1 sm:mt-0"
          />
          <p className="text-sm leading-relaxed text-[var(--muted)] font-sans">
            <span className="text-[var(--foreground)] font-semibold">Contract Auto-Redline</span>{" "}
            gives general information to help you understand and negotiate contracts. It is not legal advice and does not replace a lawyer.
          </p>
        </div>

        {/* Right Links */}
        <div className="flex items-center gap-6 shrink-0 text-sm font-sans font-bold text-[var(--muted)]">
          <a
            href="#privacy"
            className="hover:text-[var(--foreground)] interactive-transition"
          >
            Privacy
          </a>
          <span className="text-[var(--border-strong)]">&bull;</span>
          <Link
            href="/terms"
            className="hover:text-[var(--foreground)] interactive-transition"
          >
            Terms
          </Link>
          <span className="text-[var(--border-strong)]">&bull;</span>
          <Link
            href="/sign-in"
            className="hover:text-[var(--foreground)] interactive-transition"
          >
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
