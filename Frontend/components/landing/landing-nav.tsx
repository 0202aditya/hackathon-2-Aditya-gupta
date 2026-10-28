import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 w-full bg-(--background) border-b border-(--border)">
      <div className="max-w-280 mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 interactive-transition hover:opacity-90">
            <Image
              src="/images/logo.png"
              alt="Contract Auto-Redline Logo"
              width={32}
              height={32}
              className="rounded-md shrink-0"
            />
            <span className="font-serif font-semibold text-xl sm:text-2xl text-(--foreground) tracking-tight">
              Contract Auto-Redline
            </span>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Landing Navigation">
            <a
              href="#how-it-works"
              className="text-base font-sans font-bold text-(--muted) hover:text-(--foreground) interactive-transition"
            >
              How it works
            </a>
            <a
              href="#privacy"
              className="text-base font-sans font-bold text-(--muted) hover:text-(--foreground) interactive-transition"
            >
              Privacy
            </a>
            <Link
              href="/gallery"
              className="text-base font-sans font-bold text-(--muted) hover:text-(--foreground) interactive-transition"
            >
              Components
            </Link>
          </nav>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/sign-in">
            <Button variant="ghost" className="text-(--foreground) min-h-11">
              Sign in
            </Button>
          </Link>
          <Link href="/analyses/new">
            <Button variant="primary" className="min-h-11">
              Review a contract
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
