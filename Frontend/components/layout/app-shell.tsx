"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus,
  Settings,
  LogOut,
  Menu,
  X,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface AppShellProps {
  children: React.ReactNode;
  userEmail?: string;
  onSignOut?: () => void;
}

export function AppShell({
  children,
  userEmail: propUserEmail,
  onSignOut,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [currentUserEmail, setCurrentUserEmail] = React.useState<string | null>(propUserEmail || null);

  React.useEffect(() => {
    if (!propUserEmail) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.email) {
          setCurrentUserEmail(user.email);
        }
      });
    }
  }, [propUserEmail, supabase]);

  const displayEmail = currentUserEmail || propUserEmail || "account@contractredline.com";

  const handleSignOut = async () => {
    if (onSignOut) {
      onSignOut();
      return;
    }
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "New review", href: "/analyses/new", icon: FilePlus },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Component gallery", href: "/gallery", icon: Layers },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard" && pathname === "/dashboard") return true;
    return pathname === href;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--background)] text-[var(--foreground)]">
      {/* Desktop Sidebar: 240px fixed width */}
      <aside
        className="hidden md:flex flex-col w-[240px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] h-screen sticky top-0"
        aria-label="Sidebar Navigation"
      >
        {/* App Logo & Title */}
        <div className="h-[72px] flex items-center px-5 border-b border-[var(--border)] gap-3">
          <Image
            src="/images/logo.png"
            alt="Contract Auto-Redline Logo"
            width={32}
            height={32}
            className="rounded-md shrink-0"
          />
          <span className="font-serif font-semibold text-base tracking-tight truncate text-[var(--foreground)]">
            Contract Auto-Redline
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-2 space-y-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-3.5 py-3 rounded-lg text-base leading-6 font-sans font-bold interactive-transition min-h-11",
                  active
                    ? "bg-[var(--surface-raised)] text-[var(--foreground)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)]/50"
                )}
              >
                {/* Active left indicator bar */}
                {active && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[var(--primary)] rounded-r-full"
                    aria-hidden="true"
                  />
                )}
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0",
                    active ? "text-[var(--primary)]" : "text-[var(--muted)]"
                  )}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile & sign-out at bottom */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm leading-5 font-sans text-[var(--foreground)] truncate font-medium">
                {displayEmail}
              </p>
              <p className="text-xs leading-4 text-[var(--muted)] truncate">
                Independent Pro
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--risk-high)] hover:bg-[var(--surface-raised)] min-h-11 min-w-11 flex items-center justify-center interactive-transition cursor-pointer"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between h-[60px] px-4 border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <Image
            src="/images/logo.png"
            alt="Contract Auto-Redline Logo"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="font-serif font-semibold text-base text-[var(--foreground)]">
            Contract Auto-Redline
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] min-h-11 min-w-11 flex items-center justify-center"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" strokeWidth={1.75} />
          ) : (
            <Menu className="w-6 h-6" strokeWidth={1.75} />
          )}
        </button>
      </header>

      {/* Mobile Slide-down Drawer Menu */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="md:hidden border-b border-[var(--border)] bg-[var(--surface)] p-4 space-y-2 z-20"
        >
          <nav className="space-y-1" aria-label="Mobile Navigation">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-sans font-bold min-h-11",
                    active
                      ? "bg-[var(--surface-raised)] text-[var(--foreground)] border-l-[3px] border-[var(--primary)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface-raised)]/50"
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" strokeWidth={1.75} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-sm">
            <span className="text-[var(--muted)] truncate">{displayEmail}</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-[var(--risk-high)] flex items-center gap-1.5 p-2 font-bold min-h-11"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 pb-20 md:pb-8 flex flex-col">
        {children}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (per UI Spec Section 6) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-[var(--surface)] border-t border-[var(--border)] flex items-center justify-around px-2 z-30"
        aria-label="Mobile Bottom Navigation"
      >
        {navItems
          .filter((item) => item.href !== "/gallery")
          .map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-[52px] min-h-11 rounded-lg interactive-transition",
                  active
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon className="w-5 h-5 mb-0.5" strokeWidth={1.75} />
                <span className="text-xs font-sans font-bold">
                  {item.label}
                </span>
              </Link>
            );
          })}
      </nav>
    </div>
  );
}
