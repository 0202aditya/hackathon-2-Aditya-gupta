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
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setCurrentUserEmail(user.email);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setCurrentUserEmail(session.user.email);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const displayEmail = currentUserEmail || propUserEmail || "Account";

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
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard" && pathname === "/dashboard") return true;
    return pathname === href;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-(--background) text-(--foreground)">
      {/* Desktop Sidebar: Collapsible on hover (w-16 collapsed -> w-64 expanded) */}
      <aside
        className="group/sidebar hidden md:flex flex-col w-16 hover:w-64 shrink-0 border-r border-(--border) bg-(--surface) h-screen sticky top-0 z-30 transition-[width] duration-300 ease-in-out overflow-x-hidden shadow-xl"
        aria-label="Sidebar Navigation"
      >
        {/* App Logo & Title */}
        <div className="h-18 flex items-center px-3.5 border-b border-(--border) gap-3 shrink-0">
          <Image
            src="/images/logo.png"
            alt="Contract Auto-Redline Logo"
            width={34}
            height={34}
            className="rounded-md shrink-0"
          />
          <span className="font-serif font-semibold text-base tracking-tight text-(--foreground) whitespace-nowrap overflow-hidden transition-all duration-300 opacity-0 group-hover/sidebar:opacity-100 max-w-0 group-hover/sidebar:max-w-47.5">
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
                title={item.label}
                className={cn(
                  "relative flex items-center gap-3.5 px-3 py-3 rounded-xl text-base leading-6 font-sans font-bold transition-colors min-h-11",
                  active
                    ? "bg-(--surface-raised) text-(--foreground) shadow-sm"
                    : "text-(--muted) hover:text-(--foreground) hover:bg-(--surface-raised)/60"
                )}
              >
                {/* Active left indicator bar */}
                {active && (
                  <span
                    className="absolute left-0 top-2 bottom-2 w-0.75 bg-(--primary) rounded-r-full"
                    aria-hidden="true"
                  />
                )}
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0",
                    active ? "text-(--primary)" : "text-(--muted)"
                  )}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span className="whitespace-nowrap overflow-hidden transition-all duration-300 opacity-0 group-hover/sidebar:opacity-100 max-w-0 group-hover/sidebar:max-w-40">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User profile & sign-out at bottom */}
        <div className="p-3 border-t border-(--border) bg-(--surface) shrink-0">
          <div className="flex items-center justify-between gap-2.5">
            {/* Expanded profile: Avatar + Email */}
            <div
              className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden transition-all duration-300 opacity-0 group-hover/sidebar:opacity-100 max-w-0 group-hover/sidebar:max-w-43.75"
              title={`Signed in as: ${displayEmail}`}
            >
              <div className="w-8 h-8 rounded-full bg-(--surface-raised) border border-(--border) flex items-center justify-center font-bold text-xs text-(--primary) shrink-0">
                {(displayEmail[0] || "U").toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-4 font-sans text-white truncate font-bold" title={displayEmail}>
                  {displayEmail}
                </p>
                <p className="text-[11px] leading-3 text-zinc-400 truncate mt-0.5">
                  Pro Contractor
                </p>
              </div>
            </div>

            {/* Collapsed avatar icon: visible only when NOT hovered */}
            <div
              className="w-8 h-8 rounded-full bg-(--surface-raised) border border-(--border) flex items-center justify-center font-bold text-xs text-(--primary) shrink-0 group-hover/sidebar:hidden"
              title={`Signed in as: ${displayEmail}`}
            >
              {(displayEmail[0] || "U").toUpperCase()}
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="p-2 rounded-lg text-zinc-400 hover:text-(--risk-high) hover:bg-(--surface-raised) min-h-10 min-w-10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 h-16 border-b border-(--border) bg-(--surface) sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="Contract Auto-Redline Logo"
            width={28}
            height={28}
            className="rounded-md shrink-0"
          />
          <span className="font-serif font-semibold text-base tracking-tight text-(--foreground)">
            Contract Auto-Redline
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-(--muted) hover:text-(--foreground) min-h-11 min-w-11 flex items-center justify-center rounded-lg"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex flex-col">
          <div className="bg-(--surface) border-b border-(--border) p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-(--muted)">Menu</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-(--muted) hover:text-(--foreground)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-sans font-bold",
                      active
                        ? "bg-(--surface-raised) text-(--foreground)"
                        : "text-(--muted) hover:text-(--foreground)"
                    )}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-(--border) flex items-center justify-between">
              <span className="text-xs text-(--muted) truncate max-w-50">
                {displayEmail}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-xs text-(--risk-high) font-bold flex items-center gap-1.5 p-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
