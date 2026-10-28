"use client";

import * as React from "react";
import { RiskBadge } from "@/components/ui/risk-badge";
import { CopyButton } from "@/components/ui/copy-button";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

function usePrefersReducedMotion() {
  return React.useSyncExternalStore(
    (notify) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", notify);
      return () => mq.removeEventListener("change", notify);
    },
    () => (typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false),
    () => false
  );
}

export function StrikeReveal() {
  const [hasStarted, setHasStarted] = React.useState(false);
  const [accepted, setAccepted] = React.useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const originalText =
    "The Contractor shall be liable for all damages arising from the Services, without limitation.";
  const suggestedText =
    "The Contractor's total liability under this Agreement shall not exceed the fees paid in the preceding twelve months.";

  const [displayedSuggested, setDisplayedSuggested] = React.useState("");
  const [isStriking, setIsStriking] = React.useState(false);
  const [isDimmed, setIsDimmed] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);

  React.useEffect(() => {
    if (reducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          // Step 1: Strike-through over 700ms
          setIsStriking(true);

          setTimeout(() => {
            // Step 2: Dim original text
            setIsDimmed(true);
            setIsTyping(true);

            // Step 3: Typewriter reveal over 1200ms
            const duration = 1200;
            const steps = suggestedText.length;
            const intervalTime = Math.max(15, Math.floor(duration / steps));
            let currentIndex = 0;

            const interval = setInterval(() => {
              currentIndex += 2;
              if (currentIndex >= suggestedText.length) {
                setDisplayedSuggested(suggestedText);
                setIsTyping(false);
                clearInterval(interval);
              } else {
                setDisplayedSuggested(suggestedText.slice(0, currentIndex));
              }
            }, intervalTime);
          }, 700);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasStarted, reducedMotion, suggestedText]);

  const activeStriking = reducedMotion || isStriking;
  const activeDimmed = reducedMotion || isDimmed;
  const activeDisplayed = reducedMotion ? suggestedText : displayedSuggested;

  return (
    <div
      ref={containerRef}
      id="example-redline"
      className="rounded-2xl bg-(--surface-raised) border border-(--border) p-6 sm:p-8 space-y-6 shadow-xl"
    >
      {/* Original Clause */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span className="text-sm font-sans font-bold uppercase tracking-wider text-(--muted)">
            Original Clause
          </span>
          <RiskBadge level="high" label="High risk" />
        </div>

        <div className="relative inline-block w-full">
          <p
            className={`font-serif text-lg sm:text-xl leading-relaxed transition-opacity duration-500 ${
              activeDimmed ? "opacity-50 text-(--muted)" : "text-(--foreground)"
            }`}
          >
            {originalText}
          </p>

          {/* Animated red strike-through line */}
          <div
            className={`absolute left-0 top-1/2 h-[3px] bg-(--risk-high) rounded-full pointer-events-none transition-all ease-out duration-700 ${
              activeStriking ? "w-full opacity-100" : "w-0 opacity-0"
            }`}
            style={{ transform: "translateY(-50%)" }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Why it matters */}
      <div className="pt-2 border-t border-(--border)/60">
        <p className="text-sm sm:text-base leading-relaxed font-sans text-(--foreground)">
          <span className="font-bold text-(--risk-medium) mr-2">Why it matters:</span>
          You could owe far more than the project pays, including indirect losses.
        </p>
      </div>

      {/* Suggested wording */}
      <div className="pt-2 border-t border-(--border)/60 space-y-2">
        <span className="text-sm font-sans font-bold uppercase tracking-wider text-(--risk-low)">
          Suggested Wording
        </span>
        <div className="min-h-16 font-serif text-lg sm:text-xl leading-relaxed text-(--risk-low) bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.25)] rounded-lg p-4">
          <span>{activeDisplayed}</span>
          {isTyping && !reducedMotion && (
            <span className="inline-block w-0.5 h-5 bg-(--risk-low) ml-1 align-middle animate-pulse" />
          )}
        </div>
      </div>

      {/* Action Buttons: Accept and Copy */}
      <div className="flex items-center gap-3 pt-3 flex-wrap">
        <Button
          type="button"
          size="sm"
          variant={accepted ? "primary" : "secondary"}
          onClick={() => setAccepted(!accepted)}
          className="min-h-11"
        >
          {accepted ? (
            <>
              <Check className="w-4 h-4 text-(--primary-foreground)" strokeWidth={2} />
              <span>Accepted</span>
            </>
          ) : (
            <span>Accept</span>
          )}
        </Button>

        <CopyButton
          textToCopy={suggestedText}
          label="Copy"
          size="sm"
          variant="secondary"
        />
      </div>
    </div>
  );
}
