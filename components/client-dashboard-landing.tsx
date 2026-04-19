"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Cpu,
  FileText,
  Globe2,
  Layers3,
  Lock,
  Radar,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";
import { motion } from "motion/react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "How We Work", href: "#how-we-work" },
  { label: "About", href: "#about-us" }
];

const serviceCards = [
  {
    title: "Performance Command",
    description:
      "Track occupancy, leasing velocity, and rent roll drift in one operating view built for ownership decisions.",
    icon: BarChart3,
    signal: "Live signals"
  },
  {
    title: "Risk Controls",
    description:
      "Spot reporting gaps, policy misses, and spend anomalies before they become expensive portfolio surprises.",
    icon: ShieldCheck,
    signal: "Control layer"
  },
  {
    title: "Owner Reporting",
    description:
      "Publish board-ready summaries with narrative clarity, defensible metrics, and manager accountability traces.",
    icon: FileText,
    signal: "Narrative output"
  }
];

const workflowSteps = [
  {
    title: "Ingest",
    description: "Capture manager reports, leasing updates, and capex activity across every property.",
    icon: Layers3
  },
  {
    title: "Diagnose",
    description: "Surface portfolio-level changes, weak points, and operational outliers with contextual scoring.",
    icon: Radar
  },
  {
    title: "Direct",
    description: "Turn insight into owner actions with clear escalation paths and high-confidence reporting.",
    icon: Sparkles
  }
];

const aboutCards = [
  {
    title: "Independent Lens",
    description: "Amseta sits on the owner side, so performance narratives stay objective and decision-grade.",
    icon: Lock
  },
  {
    title: "Portfolio System",
    description: "Every asset, manager, and KPI stays in one aligned operating model instead of siloed spreadsheets.",
    icon: Globe2
  },
  {
    title: "Execution Rhythm",
    description: "A predictable monthly cadence keeps reviews fast, accountable, and tied to measurable outcomes.",
    icon: Cpu
  }
];

type FooterLink = {
  label: string;
  href: string;
};

const footerColumns = [
  {
    title: "Platform",
    links: [
      { label: "Services", href: "#services" },
      { label: "How We Work", href: "#how-we-work" },
      { label: "Client Dashboard", href: "#client-dashboard" }
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#about-us" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies", href: "#" }
    ]
  }
];

function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={className} aria-hidden="true">
      <path
        d="M128 28c-39.7 0-72 32.3-72 72 0 16.7 5.7 32.2 15.3 44.6C82.8 158.9 103.6 168 128 168c39.7 0 72-32.3 72-72s-32.3-68-72-68Z"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M66 112c0-34.2 27.8-62 62-62 24.4 0 45.7 14.2 55.8 34.8-8.4-5-18.2-7.8-28.8-7.8-31.5 0-57 25.5-57 57 0 21.8 12.3 40.7 30.4 50.2-34.6-.2-62.4-28.1-62.4-62.2Z"
        fill="currentColor"
      />
      <path
        d="M128 228c39.7 0 72-32.3 72-72 0-16.7-5.7-32.2-15.3-44.6-11.5-14.3-32.3-23.4-56.7-23.4-39.7 0-72 32.3-72 72s32.3 68 72 68Z"
        fill="currentColor"
        opacity="0.76"
      />
      <path
        d="M190 144c0 34.2-27.8 62-62 62-24.4 0-45.7-14.2-55.8-34.8 8.4 5 18.2 7.8 28.8 7.8 31.5 0 57-25.5 57-57 0-21.8-12.3-40.7-30.4-50.2 34.6.2 62.4 28.1 62.4 62.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ActionButton({
  href,
  children,
  variant = "primary"
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  const classes =
    variant === "primary"
      ? "cinematic-btn cinematic-btn-primary"
      : "cinematic-btn cinematic-btn-secondary";

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={classes}>
      {children}
    </a>
  );
}

function SurfaceCard({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`cinematic-surface ${className}`.trim()}>{children}</div>;
}

function FooterNavLink({ link }: { link: FooterLink }) {
  if (link.href.startsWith("/")) {
    return (
      <Link href={link.href} className="transition-colors hover:text-slate-50">
        {link.label}
      </Link>
    );
  }

  return (
    <a href={link.href} className="transition-colors hover:text-slate-50">
      {link.label}
    </a>
  );
}

export function ClientDashboardLandingPage({
  stats,
  publicMode = false
}: {
  stats: {
    capexProjects: string;
    totalUnits: string;
    grossMonthlyRent: string;
    occupancyTrends: string;
  };
  publicMode?: boolean;
}) {
  const clientHref = publicMode ? "/login" : "#client-dashboard";

  return (
    <div className="cinematic-landing min-h-screen overflow-x-hidden">
      <div className="cinematic-backdrop fixed inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="cinematic-video h-full w-full object-cover"
          src={VIDEO_URL}
        />
        <div className="cinematic-color-wash" />
        <div className="cinematic-vignette" />
        <div className="cinematic-noise" />
      </div>

      <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border border-white/20 bg-slate-950/55 px-4 py-2 text-slate-100 shadow-[0_16px_55px_rgba(2,6,23,0.42)] backdrop-blur-xl sm:px-6">
          <a href="#client-dashboard" className="flex items-center gap-3">
            <Logo className="h-6 w-6 text-amber-300 sm:h-7 sm:w-7" />
            <span className="cinematic-nav-logo">AMSETA</span>
          </a>

          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((item) => (
              <a key={item.label} href={item.href} className="cinematic-nav-link">
                {item.label}
              </a>
            ))}
            <a href={clientHref} className="cinematic-nav-link">
              Client Dashboard
            </a>
          </nav>

          <ActionButton href={clientHref} variant="secondary">
            Client login
          </ActionButton>
        </div>
      </header>

      <main id="client-dashboard" className="relative z-10">
        <section className="px-4 pb-24 pt-36 sm:px-6 sm:pb-28 sm:pt-44">
          <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="cinematic-reveal cinematic-microtag mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/35 bg-slate-900/60 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-amber-100 sm:text-xs">
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                Commercial Real Estate Oversight
              </div>

              <h1 className="cinematic-reveal-delay-1 cinematic-title max-w-4xl text-5xl leading-[0.9] text-slate-50 sm:text-7xl lg:text-[106px]">
                Build trust with
                <span className="block text-amber-200">verified operations</span>
              </h1>

              <p className="cinematic-reveal-delay-2 mt-6 max-w-xl text-base leading-relaxed text-slate-200/88 sm:text-lg">
                Amseta gives owners a cinematic-level command view of leasing, capital projects, and manager
                performance so every decision starts from verified reality.
              </p>

              <div className="cinematic-reveal-delay-3 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <ActionButton href={clientHref}>
                  Enter the Platform
                  <ArrowRight className="h-4 w-4" />
                </ActionButton>
                <ActionButton href="#services" variant="secondary">
                  Explore Services
                </ActionButton>
              </div>

              <div className="cinematic-reveal-delay-3 mt-8 flex flex-wrap gap-3 text-xs text-slate-200/88 sm:text-sm">
                {["Portfolio signal clarity", "Owner-side accountability", "Audit-ready reporting"].map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-900/45 px-3 py-2"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.16 }}
              className="lg:pb-4"
            >
              <SurfaceCard className="p-5 sm:p-7">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="cinematic-microtag text-[10px] uppercase tracking-[0.26em] text-slate-300 sm:text-xs">
                      Ops command deck
                    </div>
                    <div className="mt-2 text-xl font-semibold text-slate-50 sm:text-2xl">Live Portfolio Snapshot</div>
                  </div>
                  <Building2 className="h-6 w-6 text-amber-200" />
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Capex Projects", value: stats.capexProjects },
                    { label: "Total Units", value: stats.totalUnits },
                    { label: "Gross Monthly Rent", value: stats.grossMonthlyRent },
                    { label: "Occupancy Trends", value: stats.occupancyTrends }
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/16 bg-slate-900/55 px-4 py-3 backdrop-blur-md"
                    >
                      <div className="text-[11px] uppercase tracking-[0.25em] text-slate-300">{item.label}</div>
                      <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-200/10 p-4">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-amber-100">Active signal</div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-amber-50">
                    <Zap className="h-4 w-4 text-amber-200" />
                    Reporting consistency is trending stronger across all managed properties.
                  </div>
                </div>
              </SurfaceCard>
            </motion.div>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 sm:pb-24">
          <div className="mx-auto grid w-full max-w-7xl gap-4 md:grid-cols-4">
            {[
              {
                label: "Capex Projects",
                value: stats.capexProjects,
                detail: "Tracked against budget, timeline, and owner approvals"
              },
              {
                label: "Total Units",
                value: stats.totalUnits,
                detail: "Commercial suites monitored in one oversight model"
              },
              {
                label: "Gross Monthly Rent",
                value: stats.grossMonthlyRent,
                detail: "Income signals normalized across every manager"
              },
              {
                label: "Occupancy Trends",
                value: stats.occupancyTrends,
                detail: "Leasing movement compared against plan and risk"
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                viewport={{ once: true, margin: "-80px" }}
              >
                <SurfaceCard className="h-full p-5 sm:p-6">
                  <div className="text-[10px] uppercase tracking-[0.26em] text-slate-300 sm:text-xs">{stat.label}</div>
                  <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">{stat.value}</div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-200/85">{stat.detail}</p>
                </SurfaceCard>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="services" className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-center gap-3 sm:mb-10">
              <div className="cinematic-microtag rounded-full border border-white/20 bg-slate-900/45 px-4 py-2 text-[10px] uppercase tracking-[0.26em] text-slate-300 sm:text-xs">
                Services
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-amber-200/60 via-amber-100/20 to-transparent" />
            </div>

            <h2 className="cinematic-title max-w-4xl text-4xl text-slate-50 sm:text-6xl lg:text-7xl">
              From portfolio fog to
              <span className="block text-amber-200">decision-grade visibility</span>
            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-3 sm:mt-10">
              {serviceCards.map((card, index) => {
                const Icon = card.icon;

                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true, margin: "-60px" }}
                  >
                    <SurfaceCard className="h-full p-6 sm:p-7">
                      <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/40 bg-amber-200/10 text-amber-100">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.24em] text-slate-300 sm:text-xs">{card.signal}</div>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-50">{card.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-200/85">{card.description}</p>
                    </SurfaceCard>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="how-we-work" className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <SurfaceCard className="p-6 sm:p-10">
              <div className="cinematic-microtag text-[10px] uppercase tracking-[0.26em] text-slate-300 sm:text-xs">
                How We Work
              </div>
              <h2 className="cinematic-title mt-4 text-4xl text-slate-50 sm:text-6xl">
                A clear operating rhythm
                <span className="block text-amber-200">for owner control</span>
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-200/85 sm:text-lg">
                We combine manager data, financial context, and field-level observations into one review cycle that owners can trust month after month.
              </p>
              <div className="mt-8 rounded-3xl border border-white/20 bg-slate-900/45 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
                  <p className="text-sm leading-relaxed text-slate-200/85">
                    Every cycle ends with a documented owner-ready output: what changed, what matters, and what action to take.
                  </p>
                </div>
              </div>
            </SurfaceCard>

            <div className="space-y-4">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                    viewport={{ once: true, margin: "-60px" }}
                  >
                    <SurfaceCard className="p-5 sm:p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-slate-900/65 text-amber-100">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="cinematic-microtag text-[10px] uppercase tracking-[0.25em] text-slate-300 sm:text-xs">
                          Step {index + 1}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-50">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-200/85">{step.description}</p>
                    </SurfaceCard>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="about-us" className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="cinematic-microtag mb-4 text-[10px] uppercase tracking-[0.26em] text-slate-300 sm:text-xs">
              About Us
            </div>
            <h2 className="cinematic-title max-w-4xl text-4xl text-slate-50 sm:text-6xl lg:text-7xl">
              Built for owners who want
              <span className="block text-amber-200">proof, not promises</span>
            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-3 sm:mt-10">
              {aboutCards.map((card, index) => {
                const Icon = card.icon;

                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.09 }}
                    viewport={{ once: true, margin: "-60px" }}
                  >
                    <SurfaceCard className="h-full p-6 sm:p-7">
                      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-slate-900/65 text-amber-100">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-50">{card.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-200/85">{card.description}</p>
                    </SurfaceCard>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-12">
          <div className="mx-auto max-w-7xl">
            <SurfaceCard className="p-7 text-center sm:p-12">
              <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-white/20 bg-slate-900/45 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-slate-300 sm:text-xs">
                <Logo className="h-5 w-5 text-amber-200" />
                Ready when you are
              </div>

              <h2 className="cinematic-title mx-auto mt-6 max-w-4xl text-4xl text-slate-50 sm:text-6xl lg:text-7xl">
                Ready for clearer
                <span className="block text-amber-200">portfolio oversight?</span>
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-200/85 sm:text-lg">
                Join owners who need sharper reporting, stronger accountability, and confidence in every operating decision.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
                <ActionButton href={clientHref}>
                  Enter the Platform
                  <ArrowRight className="h-4 w-4" />
                </ActionButton>
                <ActionButton href={clientHref} variant="secondary">
                  Client Login
                </ActionButton>
              </div>
            </SurfaceCard>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/15 px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
            <div className="max-w-sm">
              <div className="flex items-center gap-3 text-slate-50">
                <Logo className="h-9 w-9 text-amber-200" />
                <span className="cinematic-title text-3xl">AMSETA</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-200/82">
                Commercial real estate oversight designed for owners who need sharper visibility, cleaner reporting,
                and stronger manager accountability.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-12">
              {footerColumns.map((column) => (
                <div key={column.title}>
                  <div className="cinematic-microtag text-[10px] uppercase tracking-[0.24em] text-slate-300 sm:text-xs">
                    {column.title}
                  </div>
                  <div className="mt-4 flex flex-col gap-3 text-sm text-slate-200/82">
                    {column.links.map((link) => (
                      <FooterNavLink key={`${column.title}-${link.label}`} link={link} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/15 pt-6 text-xs uppercase tracking-[0.22em] text-slate-300 sm:flex-row sm:items-center sm:justify-between">
            <div>© 2026 Amseta. All rights reserved.</div>
            <a href="#" className="transition-colors hover:text-slate-50">
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
