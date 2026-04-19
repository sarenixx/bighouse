"use client";

import Link from "next/link";
import { BarChart3, Cpu, FileText, Globe, Layers, ShieldCheck, Zap } from "lucide-react";
import { motion } from "motion/react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4";

const primaryNavLinks = [
  { label: "About", href: "#about" },
  { label: "Team", href: "#team" },
  { label: "Who We Serve", href: "#who-we-serve" },
  { label: "Additional Services", href: "#additional-services" }
];

const footerColumns = [
  {
    title: "Platform",
    links: [
      { label: "Property Scorecard", href: "#property-scorecard" },
      { label: "View Example Report", href: "#example-report" },
      { label: "Platform Login", href: "/login" }
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Team", href: "#team" },
      { label: "Who We Serve", href: "#who-we-serve" }
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

const teamCards = [
  {
    title: "Fiduciary Oversight",
    description: "We act as the independent umpire between ownership goals and operating reality.",
    icon: ShieldCheck
  },
  {
    title: "Financial Review",
    description: "Monthly financial and activity reviews identify drift early and keep decisions grounded.",
    icon: FileText
  },
  {
    title: "Operational Accountability",
    description:
      "Manager and operator performance is tracked against expectations, not presentation quality.",
    icon: Cpu
  }
];

function Logo({
  className = "h-7 w-7",
  fill = "white"
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg viewBox="0 0 256 256" className={className} aria-hidden="true">
      <path
        d="M128 28c-39.7 0-72 32.3-72 72 0 16.7 5.7 32.2 15.3 44.6C82.8 158.9 103.6 168 128 168c39.7 0 72-32.3 72-72s-32.3-68-72-68Z"
        fill={fill}
        opacity="0.18"
      />
      <path
        d="M66 112c0-34.2 27.8-62 62-62 24.4 0 45.7 14.2 55.8 34.8-8.4-5-18.2-7.8-28.8-7.8-31.5 0-57 25.5-57 57 0 21.8 12.3 40.7 30.4 50.2-34.6-.2-62.4-28.1-62.4-62.2Z"
        fill={fill}
      />
      <path
        d="M128 228c39.7 0 72-32.3 72-72 0-16.7-5.7-32.2-15.3-44.6-11.5-14.3-32.3-23.4-56.7-23.4-39.7 0-72 32.3-72 72s32.3 68 72 68Z"
        fill={fill}
        opacity="0.72"
      />
      <path
        d="M190 144c0 34.2-27.8 62-62 62-24.4 0-45.7-14.2-55.8-34.8 8.4 5 18.2 7.8 28.8 7.8 31.5 0 57-25.5 57-57 0-21.8-12.3-40.7-30.4-50.2 34.6.2 62.4 28.1 62.4 62.2Z"
        fill={fill}
      />
    </svg>
  );
}

function GradientBorderButton({
  children,
  className = "",
  href
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
}) {
  const classes = `gradient-border-btn rounded-full px-5 py-2 text-sm font-semibold text-zinc-950 hover:opacity-90 ${className}`.trim();

  if (href) {
    return (
      <a href={href} className={classes}>
        <span className="relative z-10">{children}</span>
      </a>
    );
  }

  return (
    <button className={classes}>
      <span className="relative z-10">{children}</span>
    </button>
  );
}

function GlassCard({
  eyebrow,
  title,
  description,
  className = "",
  accent = "amber"
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  className?: string;
  accent?: "amber" | "blue" | "mixed";
}) {
  const accentClass =
    accent === "amber"
      ? "bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.12))]"
      : accent === "blue"
        ? "bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.12))]"
        : "bg-[linear-gradient(120deg,rgba(245,158,11,0.05),transparent_35%,rgba(59,130,246,0.05)_100%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.12))]";

  return (
    <div className={`group relative overflow-hidden rounded-[32px] border border-black/10 bg-white/45 p-7 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-md transition-all duration-500 hover:border-black/20 sm:rounded-[40px] sm:p-12 ${className}`}>
      <div className={`absolute inset-0 z-0 ${accentClass}`} />
      <div className="relative z-20 max-w-xl">
        <div className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-600">{eyebrow}</div>
        <h3 className="mb-5 text-3xl font-semibold tracking-tight text-zinc-950 sm:mb-6 sm:text-4xl">{title}</h3>
        <p className="text-base leading-relaxed text-zinc-700 sm:text-lg">{description}</p>
      </div>
    </div>
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
  return (
    <div className="min-h-screen overflow-hidden bg-white text-zinc-950 selection:bg-amber-500/30 selection:text-zinc-950">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
          src={VIDEO_URL}
          style={{
            pointerEvents: "none",
            opacity: 0.78,
            transform: "scale(1.04)"
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.32)_0%,rgba(255,255,255,0.2)_20%,rgba(255,255,255,0.12)_46%,rgba(255,255,255,0.22)_78%,rgba(255,255,255,0.38)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.22)_0%,transparent_18%,transparent_82%,rgba(255,255,255,0.18)_100%)]" />
      </div>

      <nav className="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="flex w-full max-w-7xl items-center justify-between gap-3 rounded-full border border-black/10 bg-white/60 px-4 py-2.5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:gap-8 sm:px-6">
          <div className="flex items-center gap-4 sm:gap-8">
            <Logo className="h-6 w-6 sm:h-7 sm:w-7" />
            <div className="hidden items-center gap-6 md:flex">
              {primaryNavLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-zinc-700 transition-colors duration-150 hover:text-zinc-950"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="hidden items-center gap-5 md:flex">
            <a href="/login" className="text-sm font-semibold text-zinc-800 transition-colors hover:text-zinc-950">
              Login
            </a>
            <a
              href="mailto:hello@amseta.com"
              className="text-sm font-semibold text-zinc-800 transition-colors hover:text-zinc-950"
            >
              Contact Us
            </a>
          </div>
          <div className="md:hidden">
            {publicMode ? (
              <GradientBorderButton href="/login" className="px-4 py-2 text-xs sm:px-5 sm:text-sm">
                Login
              </GradientBorderButton>
            ) : (
              <GradientBorderButton className="px-4 py-2 text-xs sm:px-5 sm:text-sm">Login</GradientBorderButton>
            )}
          </div>
        </div>
      </nav>

      <main
        id="top"
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pb-16 pt-[124px] text-center sm:px-6 sm:pb-24 sm:pt-[140px]"
      >
        <div className="animate-float-up mb-6 rounded-full border border-black/10 bg-white/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-700 backdrop-blur-md sm:mb-8 sm:text-xs sm:tracking-[0.28em]">
          Independent Real Estate Fiduciary Oversight
        </div>
        <h1 className="animate-float-up max-w-[760px] text-[42px] font-semibold leading-[1.02] tracking-[-0.05em] text-zinc-950 sm:text-[60px] sm:leading-[1.05] sm:tracking-[-0.04em]">
          <span className="text-zinc-700">Independent fiduciary</span>
          <br />
          oversight for
          <br />
          real estate ownership
        </h1>
        <p className="animate-float-up-delay mt-6 max-w-[620px] text-base leading-relaxed text-zinc-800 sm:mt-8 sm:text-lg">
          Amseta represents owners, passive investors, family offices, and high-net-worth
          individuals with one objective: clear truth across every property, manager, and report.
        </p>
        <div className="animate-float-up-delay-2 mt-8 flex w-full max-w-xl flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          {publicMode ? (
            <GradientBorderButton href="/login" className="px-8 py-3 text-sm sm:text-base">
              Enter Platform
            </GradientBorderButton>
          ) : (
            <GradientBorderButton className="px-8 py-3 text-sm sm:text-base">Enter Platform</GradientBorderButton>
          )}
          <a
            href="#example-report"
            className="rounded-full border border-black/10 bg-white/55 px-8 py-3 text-sm font-semibold text-zinc-900 transition-all hover:bg-white/70 sm:text-base"
          >
            View Example Report
          </a>
        </div>

        <div className="animate-float-up-delay-3 mt-12 w-full sm:mt-16">
          <div className="mx-auto flex max-w-[620px] items-center gap-3 rounded-[20px] border border-black/10 bg-white/55 px-4 py-4 text-left shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-md sm:max-w-none sm:gap-4 sm:px-6">
            <Logo className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
            <span className="text-sm font-medium leading-relaxed text-zinc-900">
              We are not the operator. We are the independent fiduciary umpire for portfolio truth.
            </span>
            <svg viewBox="0 0 48 48" className="ml-auto h-6 w-6 shrink-0 sm:h-7 sm:w-7" aria-hidden="true">
              <defs>
                <linearGradient id="amseta-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              <circle cx="24" cy="24" r="18" fill="none" stroke="#3f3f46" strokeWidth="3" />
              <path
                d="M24 6a18 18 0 0 1 18 18"
                fill="none"
                stroke="url(#amseta-ring)"
                strokeLinecap="round"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>
      </main>

      <section className="relative z-10 border-y border-black/10 bg-white/35 backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-4">
          {[
            {
              label: "Who We Serve",
              value: "Owners & Investors",
              detail: "Entrepreneurs, family offices, and passive investors with long-term portfolios."
            },
            {
              label: "Core Product",
              value: "Property Scorecard",
              detail: "A monthly diagnostic report for each property, built for ownership decisions."
            },
            {
              label: "Operating Role",
              value: "Independent Umpire",
              detail: "Amseta sits outside the operator workflow to maintain objective accountability."
            },
            {
              label: "Brand Promise",
              value: "Time Back",
              detail: "Peace of mind and confidence without chasing fragmented manager updates."
            }
          ].map((stat, index) => (
            <div
              key={stat.label}
              className={`flex flex-col gap-3 border-b border-black/10 p-8 sm:p-10 md:border-b-0 md:p-12 ${index < 3 ? "md:border-r md:border-black/10" : ""}`}
            >
              <div className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">{stat.value}</div>
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-600 sm:text-sm sm:tracking-widest">{stat.label}</div>
              <div className="max-w-[18ch] text-sm leading-relaxed text-zinc-700">{stat.detail}</div>
            </div>
          ))}
        </div>
        <div className="border-t border-black/10 py-6 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Clarity first. Detail when you need it.
          </div>
        </div>
      </section>

      <section id="property-scorecard" className="relative z-10 py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 sm:gap-20 sm:px-6 lg:grid-cols-2">
          <div>
            <div className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
              Core Product
            </div>
            <div className="mb-8 flex flex-wrap gap-3">
              {[BarChart3, ShieldCheck, FileText].map((Icon, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-full border border-black/10 bg-white/55 px-4 py-2 text-sm text-zinc-800 backdrop-blur-md"
                >
                  <Icon className="h-4 w-4 text-amber-400" />
                  <span>
                    {index === 0
                      ? "Financial Review"
                      : index === 1
                        ? "Operational Insights"
                        : "Accountability Tracking"}
                  </span>
                </div>
              ))}
            </div>

            <h2 className="mb-8 text-[40px] font-semibold leading-[1.05] tracking-[-0.05em] text-zinc-950 sm:text-[60px] sm:tracking-[-0.04em]">
              Property Scorecard <br /> <span className="text-zinc-700">monthly clarity for each asset</span>
            </h2>
            <p className="mb-8 max-w-lg text-base leading-relaxed text-zinc-800 sm:mb-10 sm:text-lg">
              The Property Scorecard is Amseta&apos;s monthly diagnostic report for every property.
              Like a credit score for real estate ownership, it distills financial reporting,
              operating activity, capital planning, and manager performance into a single,
              decision-ready signal.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <a
                href="#example-report"
                className="rounded-full border border-black/10 bg-white/55 px-8 py-3 text-sm font-semibold text-zinc-900 transition-all hover:bg-white/70 sm:text-base"
              >
                View Example Report
              </a>
              {publicMode ? (
                <GradientBorderButton href="/login" className="px-8 py-3 text-sm sm:text-base">
                  Enter Platform
                </GradientBorderButton>
              ) : (
                <GradientBorderButton className="px-8 py-3 text-sm sm:text-base">Enter Platform</GradientBorderButton>
              )}
            </div>
          </div>

          <div className="group relative">
            <div
              id="example-report"
              className="relative aspect-[3/4] overflow-hidden rounded-[32px] border border-black/10 bg-white/45 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-md"
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.08))]" />
              <div className="absolute inset-x-4 top-4 z-20 rounded-full border border-black/10 bg-white/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-700 backdrop-blur-md sm:inset-x-8 sm:top-8 sm:text-xs sm:tracking-[0.26em]">
                Sample monthly report
              </div>
              <div className="absolute inset-x-4 bottom-4 z-20 rounded-[20px] border border-black/10 bg-white/65 px-4 py-4 backdrop-blur-md sm:inset-x-8 sm:bottom-8 sm:rounded-[24px] sm:px-6 sm:py-5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-600 sm:text-xs sm:tracking-[0.26em]">
                  Ownership scorecard snapshot
                </div>
                <div className="mt-2 text-base font-medium leading-relaxed text-zinc-950 sm:text-lg">
                  One monthly snapshot of financial health, operational drift, and accountability
                  signals.
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-zinc-700 sm:text-sm">
                  <div className="rounded-xl border border-black/10 bg-white/70 px-3 py-2">
                    Occupancy: {stats.occupancyTrends}
                  </div>
                  <div className="rounded-xl border border-black/10 bg-white/70 px-3 py-2">
                    Rent Flow: {stats.grossMonthlyRent}
                  </div>
                  <div className="rounded-xl border border-black/10 bg-white/70 px-3 py-2">
                    Active Capex: {stats.capexProjects}
                  </div>
                  <div className="rounded-xl border border-black/10 bg-white/70 px-3 py-2">
                    Total Units: {stats.totalUnits}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="who-we-serve" className="relative z-10 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-[32px] border border-black/10 bg-white/45 px-6 py-12 backdrop-blur-md sm:rounded-[40px] sm:px-12 sm:py-20">
            <div className="animate-float-up mb-5 inline-flex rounded-full border border-black/10 bg-white/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-700 backdrop-blur-xl sm:mb-6 sm:text-xs sm:tracking-[0.3em]">
              Who We Serve
            </div>
            <h2 className="animate-float-up max-w-[900px] text-[48px] font-semibold leading-[0.98] tracking-[-0.05em] text-zinc-950 sm:text-[80px] sm:leading-[1]">
              Built for ownership
              <br />
              that demands clarity
            </h2>
            <p className="animate-float-up-delay mt-6 max-w-2xl text-base leading-relaxed text-zinc-800 sm:mt-10 sm:text-xl">
              We serve real estate owners, passive investors, family offices, and
              high-net-worth individuals who want objective oversight and accountable execution
              across every property.
            </p>
            <div className="animate-float-up-delay-2 mt-8 flex flex-wrap gap-3">
              {["Real Estate Owners", "Passive Investors", "Family Offices", "High-Net-Worth Individuals"].map(
                (audience) => (
                  <div
                    key={audience}
                    className="rounded-full border border-black/10 bg-white/60 px-4 py-2 text-sm font-medium text-zinc-800"
                  >
                    {audience}
                  </div>
                )
              )}
            </div>
            <div className="animate-float-up-delay-3 mt-10 rounded-[20px] border border-black/10 bg-white/60 px-5 py-4 text-sm leading-relaxed text-zinc-800 sm:max-w-3xl sm:text-base">
              Amseta does not support fiduciaries. Amseta is the fiduciary layer.
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="relative z-10 py-24 sm:py-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-16 text-center sm:mb-24">
            <div className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
              About
            </div>
            <h2 className="mb-6 text-[40px] font-semibold leading-[1.05] tracking-[-0.05em] text-zinc-950 sm:text-[60px] sm:tracking-[-0.04em]">
              Clarity without the noise
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <GlassCard
              eyebrow="What Amseta Is"
              title={
                <>
                  Independent <br /> Fiduciary Layer
                </>
              }
              description="Amseta consolidates financial reporting, property activity, capital planning, and manager performance into one oversight experience for ownership."
              accent="amber"
              className="min-h-[320px] sm:min-h-[400px]"
            />

            <GlassCard
              eyebrow="What Amseta Is Not"
              title={
                <>
                  Not the <br /> Operator
                </>
              }
              description="We are not the property manager. We stay independent so accountability remains objective, transparent, and decision-ready."
              accent="blue"
              className="min-h-[320px] sm:min-h-[400px]"
            />
          </div>
        </div>
      </section>

      <section id="team" className="relative z-10 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">Team</div>
            <h3 className="text-[34px] font-semibold leading-tight tracking-[-0.04em] text-zinc-950 sm:text-[48px]">
              A multidisciplinary oversight team
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {teamCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
                className="rounded-[28px] border border-black/10 bg-white/55 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-md sm:p-8"
              >
                <card.icon className="mb-4 h-6 w-6 text-zinc-800" />
                <h4 className="mb-3 text-xl font-semibold text-zinc-950">{card.title}</h4>
                <p className="text-sm leading-relaxed text-zinc-700 sm:text-base">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="additional-services" className="relative z-10 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
              Additional Services
            </div>
            <h3 className="text-[34px] font-semibold leading-tight tracking-[-0.04em] text-zinc-950 sm:text-[48px]">
              Broader owner-side support
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                title: "Portfolio Narrative Briefs",
                description:
                  "Decision-ready monthly briefings for principals and investment committees.",
                icon: Layers
              },
              {
                title: "Manager Performance Reviews",
                description:
                  "Structured accountability conversations tied to agreed operating expectations.",
                icon: Globe
              },
              {
                title: "Capital Plan Oversight",
                description:
                  "Independent tracking of capex execution, sequencing risk, and reporting quality.",
                icon: Zap
              }
            ].map((service) => (
              <div
                key={service.title}
                className="rounded-[28px] border border-black/10 bg-white/55 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-md sm:p-8"
              >
                <service.icon className="mb-4 h-6 w-6 text-zinc-800" />
                <h4 className="mb-3 text-xl font-semibold text-zinc-950">{service.title}</h4>
                <p className="text-sm leading-relaxed text-zinc-700 sm:text-base">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="relative z-10 overflow-hidden">
        <div className="relative z-20 py-28 text-center sm:py-48">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="animate-float-up mb-10 flex justify-center sm:mb-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-black/10 bg-white/60 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-md sm:h-20 sm:w-20 sm:rounded-[24px]">
                <Logo className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
            </div>
            <div className="animate-float-up mb-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-600 sm:mb-6 sm:text-xs sm:tracking-[0.32em]">
              Ready when you are
            </div>
            <h2 className="animate-float-up mb-8 text-[44px] font-semibold leading-[0.98] tracking-[-0.05em] text-zinc-950 sm:mb-10 sm:text-[80px] sm:leading-[1]">
              Ready for clear <br /> <span className="text-zinc-950">portfolio oversight?</span>
            </h2>
            <p className="animate-float-up-delay mx-auto mb-10 max-w-2xl text-base leading-relaxed text-zinc-700 sm:mb-16 sm:text-xl">
              For owners who want clear reporting, strong accountability, and a better view across
              every asset.
            </p>
            <div className="animate-float-up-delay-3 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center sm:gap-8">
              {publicMode ? (
                <Link
                  href="/login"
                  className="rounded-full bg-zinc-950 px-9 py-4 text-base font-bold text-white shadow-[0_20px_40px_rgba(15,23,42,0.12)] transition-all hover:scale-105 hover:bg-zinc-800 sm:px-12 sm:py-5 sm:text-lg"
                >
                  Enter the Platform
                </Link>
              ) : (
                <button className="rounded-full bg-zinc-950 px-9 py-4 text-base font-bold text-white shadow-[0_20px_40px_rgba(15,23,42,0.12)] transition-all hover:scale-105 hover:bg-zinc-800 sm:px-12 sm:py-5 sm:text-lg">
                  Enter the Platform
                </button>
              )}
              {publicMode ? (
                <a
                  href="#example-report"
                  className="rounded-full border border-black/10 bg-white/50 px-9 py-4 text-base font-bold text-zinc-950 transition-all hover:bg-white/70 sm:px-12 sm:py-5 sm:text-lg"
                >
                  View Example Report
                </a>
              ) : (
                <a
                  href="#example-report"
                  className="rounded-full border border-black/10 bg-white/50 px-9 py-4 text-base font-bold text-zinc-950 transition-all hover:bg-white/70 sm:px-12 sm:py-5 sm:text-lg"
                >
                  View Example Report
                </a>
              )}
            </div>
            <p className="mt-8 text-sm font-medium uppercase tracking-[0.18em] text-zinc-600 sm:text-base">
              Peace of mind. Time back. Confidence in long-term ownership.
            </p>
          </div>
        </div>

        <footer className="relative z-20 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-16 flex flex-col justify-between gap-12 sm:mb-24 sm:gap-16 lg:flex-row">
              <div className="max-w-xs">
                <div className="flex items-center gap-3">
                  <Logo className="h-9 w-9" />
                  <span className="text-2xl font-semibold tracking-tighter">Amseta</span>
                </div>
                <p className="mt-6 max-w-xs leading-relaxed text-zinc-700">
                  Commercial real estate oversight designed for owners who need sharper visibility, cleaner reporting, and stronger operational accountability.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-12 lg:gap-16">
                {footerColumns.map((column) => (
                  <div key={column.title}>
                    <div className="text-xs font-bold uppercase tracking-widest text-zinc-700">{column.title}</div>
                    <div className="mt-6 flex flex-col gap-4 text-sm text-zinc-700">
                      {column.links.map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          className="transition-colors hover:text-zinc-950"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-start justify-between gap-5 pt-8 text-sm text-zinc-700 sm:pt-12 md:flex-row md:items-center">
              <div>© 2026 Amseta. All rights reserved.</div>
              <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-zinc-700">
                <a href="#" className="transition-colors hover:text-zinc-950">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
