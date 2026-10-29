import Image from "next/image";
import Link from "next/link";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/footer";
import { StrikeReveal } from "@/components/landing/strike-reveal";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  MessageSquareText,
  FileEdit,
  AlertCircle,
  Mail,
  Briefcase,
  Lock,
  EyeOff,
  Trash2,
} from "lucide-react";

export default function LandingPage() {
  const whatYouGetFeatures = [
    {
      icon: ShieldAlert,
      title: "Clause-by-clause risk.",
      description: "Every clause rated low, medium, or high for you.",
    },
    {
      icon: MessageSquareText,
      title: "Plain-English explanations.",
      description: "What each clause means in practice, with no legal jargon.",
    },
    {
      icon: FileEdit,
      title: "Ready-to-send wording.",
      description: "Balanced replacements you can paste straight into the contract.",
    },
    {
      icon: AlertCircle,
      title: "Missing protections.",
      description: "Spots what the contract leaves out, like late fees or revision limits.",
    },
    {
      icon: Mail,
      title: "Negotiation email.",
      description: "An AI-crafted negotiation email ready to paste and send to clients.",
    },
    {
      icon: Briefcase,
      title: "Commercial deal context.",
      description: "Risks and redlines tailored to your specific budget, timeline, and IP priorities.",
    },
  ];

  const privacyPoints = [
    {
      icon: Lock,
      title: "Uploaded files are read, then discarded.",
      subtitle: "We never store them.",
    },
    {
      icon: EyeOff,
      title: "Hide names, emails, and amounts before analysis",
      subtitle: "with one switch.",
    },
    {
      icon: Trash2,
      title: "Delete any analysis permanently,",
      subtitle: "any time.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-(--background) text-(--foreground)">
      {/* Sticky Top Navigation */}
      <LandingNav />

      {/* Main Content: 1120px max container per UI Design Spec */}
      <main className="flex-1 max-w-280 w-full mx-auto px-4 sm:px-6 py-12 lg:py-20 space-y-16 lg:space-y-28">
        
        {/* Section: Hero */}
        <section className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 pt-4 animate-fade-up">
          {/* Left Column: Text (about 50%) */}
          <div className="w-full lg:w-1/2 space-y-6 text-left">
            <h1 className="heading-landing text-(--foreground) tracking-tight">
              Know what you&apos;re signing before you sign it.
            </h1>

            <p className="text-base lg:text-lg leading-relaxed text-(--muted) max-w-135">
              Upload a client contract. We flag the risky clauses, explain them in plain
              English, and give you the wording to ask for instead.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link href="/analyses/new">
                <Button variant="primary" size="lg" className="w-full sm:w-auto interactive-transition hover:scale-[1.02] cursor-pointer">
                  Review a contract
                </Button>
              </Link>

              <a href="#example-redline">
                <Button variant="outline" size="lg" className="w-full sm:w-auto interactive-transition hover:scale-[1.02] cursor-pointer">
                  See an example
                </Button>
              </a>
            </div>

            <p className="text-meta text-(--muted) pt-1">
              Free to use. Works with PDF, Word, or pasted text.
            </p>
          </div>

          {/* Right Column: Hero Image (1200 x 900 transparent background with soft glow) */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end animate-fade-up animation-delay-150">
            <div className="relative w-full max-w-135 aspect-[4/3] rounded-3xl overflow-hidden transition-transform duration-500 hover:scale-[1.015]">
              <Image
                src="/images/hero.png"
                alt="A contract with high and medium risk clauses highlighted, next to a suggested rewrite."
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 540px"
                className="object-contain drop-shadow-[0_20px_50px_rgba(134,168,255,0.15)]"
              />
            </div>
          </div>
        </section>

        {/* Section: How It Works */}
        <section id="how-it-works" className="space-y-10 scroll-mt-24 animate-fade-up animation-delay-225">
          <h2 className="heading-2 text-(--foreground)">
            Three steps to a safer contract
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Desktop connecting line */}
            <div
              className="hidden md:block absolute top-7 left-[15%] right-[15%] h-px bg-(--border) z-0"
              aria-hidden="true"
            />

            {[
              {
                step: "1",
                title: "Add your contract.",
                description: "Upload a PDF or Word file, or paste the text.",
              },
              {
                step: "2",
                title: "Tell us about your work.",
                description:
                  "A few quick questions, so risks are judged for your business and not a generic one.",
              },
              {
                step: "3",
                title: "Get your redlines.",
                description:
                  "Every risky clause explained, with replacement wording you can copy and send.",
              },
            ].map((s) => (
              <div key={s.step} className="relative z-10 flex flex-col items-start space-y-4 group">
                <div className="w-14 h-14 rounded-full bg-(--surface-raised) border border-(--border) group-hover:border-(--primary) flex items-center justify-center font-bold text-lg text-(--primary) shrink-0 interactive-transition group-hover:scale-105">
                  {s.step}
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-(--foreground) font-sans">
                    {s.title}
                  </h3>
                  <p className="text-base leading-relaxed text-(--muted) font-sans">
                    {s.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Example (The Memorable Moment) */}
        <section className="space-y-8 scroll-mt-24 animate-fade-up animation-delay-225">
          <h2 className="heading-2 text-(--foreground)">
            Here&apos;s what a redline looks like
          </h2>
          <StrikeReveal />
        </section>

        {/* Section: What You Get */}
        <section className="space-y-10 animate-fade-up animation-delay-300">
          <h2 className="heading-2 text-(--foreground)">
            Everything you need to negotiate with confidence
          </h2>

          {/* Two-column list separated by thin dividers without boxed cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0 divide-y md:divide-y-0 border-t border-b border-(--border)">
            {whatYouGetFeatures.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`py-6 flex items-start gap-4 border-b border-(--border) group interactive-transition hover:bg-(--surface-raised)/25 rounded-xl px-2 ${
                    index % 2 === 0 ? "md:pr-6" : "md:pl-6"
                  }`}
                >
                  <div className="p-2 rounded-lg bg-(--surface-raised) border border-(--border) text-(--primary) shrink-0 group-hover:scale-105 interactive-transition">
                    <Icon className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base leading-normal font-sans text-(--foreground)">
                      <span className="font-bold mr-1.5">{item.title}</span>
                      <span className="text-(--muted)">{item.description}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: Privacy */}
        <section id="privacy" className="space-y-8 scroll-mt-24 animate-fade-up animation-delay-300">
          <h2 className="heading-2 text-(--foreground)">
            Your contract stays yours
          </h2>

          <div className="rounded-2xl bg-(--surface) border border-(--border) p-6 sm:p-8 space-y-6">
            <div className="space-y-4">
              {privacyPoints.map((point) => {
                const Icon = point.icon;
                return (
                  <div key={point.title} className="flex items-start gap-3.5 group">
                    <Icon className="w-5 h-5 text-(--primary) shrink-0 mt-1 group-hover:scale-110 interactive-transition" strokeWidth={1.75} />
                    <p className="text-base leading-relaxed font-sans text-(--foreground)">
                      <span className="font-bold mr-1">{point.title}</span>
                      <span className="text-(--muted)">{point.subtitle}</span>
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-(--border)">
              <p className="text-meta text-(--muted)">
                Contract text is processed by an AI service to produce your review. Use
                the hide-details switch for anything sensitive.
              </p>
            </div>
          </div>
        </section>

        {/* Section: Final Call to Action */}
        <section className="rounded-3xl bg-(--surface-raised) border border-(--border) p-8 sm:p-12 text-center space-y-6 animate-fade-up animation-delay-450 shadow-xl">
          <h2 className="heading-2 text-(--foreground) max-w-150 mx-auto">
            Read it before you sign it.
          </h2>
          <div className="flex justify-center">
            <Link href="/analyses/new">
              <Button variant="primary" size="lg" className="interactive-transition hover:scale-105 cursor-pointer">
                Review a contract
              </Button>
            </Link>
          </div>
        </section>

      </main>

      {/* Global Landing Footer */}
      <LandingFooter />
    </div>
  );
}
