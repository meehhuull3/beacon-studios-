import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, Hammer, Wallet, Briefcase, CheckCircle2 } from "lucide-react";
import type React from "react";
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export const Route = createFileRoute("/venture-studio")({
  component: VentureStudioPage,
  head: () => ({
    meta: [
      { title: "Venture Studio | Beacon Indica" },
      { name: "description", content: "Beacon Indica Venture Studio — transforming universities into startup-producing ecosystems." },
      { property: "og:title", content: "Venture Studio | Beacon Indica" },
      { property: "og:description", content: "Beacon Indica Venture Studio — transforming universities into startup-producing ecosystems." },
      { property: "og:url", content: "https://beacon-indica.lovable.app/venture-studio" },
    ],
    links: [{ rel: "canonical", href: "https://beacon-indica.lovable.app/venture-studio" }],
  }),
});

const valueCards: Array<[React.ComponentType<{ className?: string }>, string, string]> = [
  [GraduationCap, "Startup Education", "Structured, execution-first curriculum"],
  [Hammer, "Venture Building", "Hands-on MVP creation in 8 weeks"],
  [Wallet, "Early-Stage Funding", "Fellowship & accelerator pipeline"],
  [Briefcase, "Investor Exposure", "Direct access to founders & investors"],
];

const layers: Array<[string, string, string]> = [
  ["01", "Genesis", "Execution-first learning environment with weekly mentorship, cohort sessions, and an 8-week MVP sprint."],
  ["02", "Events & Hackathons", "Campus ideation workshops, 24-hour intensive build sprints, and founder guest speaker sessions."],
  ["03", "Podcast & Talks", "Founder and investor interviews, operator-led domain deepdives, and student startup case studies."],
];

const offerings = [
  {
    title: "Genesis",
    badge: "FLAGSHIP PROGRAM",
    bullets: [
      "100 students per cohort",
      "8-week intensive build sprint",
      "1 cohort every 2 months",
      "Hybrid: online + offline",
      "Demo Day with investors",
    ],
    outcome: "Working MVP",
  },
  {
    title: "Events & Hackathons",
    badge: "COMMUNITY ENGAGEMENT",
    bullets: [
      "Campus ideation workshops",
      "24-hour intensive build sprints",
      "Founder guest speaker sessions",
      "Networking nights with operators",
      "Hands-on tech bootcamps",
    ],
    outcome: "Active Builder Ecosystem",
  },
  {
    title: "Podcast & Talks",
    badge: "MEDIA & TALENT SCOUT",
    bullets: [
      "Founder & investor interviews",
      "Operator-led domain deepdives",
      "Student startup case studies",
      "Scouting top campus talent",
      "Weekly startup trend insights",
    ],
    outcome: "Global Exposure & Selection",
  },
];

const impactStats: Array<[string, string, string]> = [
  ["600+", "Students Trained", "100 per cohort × 6 cohorts"],
  ["150+", "MVPs Built", "Annually across all cohorts"],
  ["20–30", "High-Potential Startups", "Identified each year"],
  ["5–10", "Startups Funded", "Through fellowship & accelerator"],
];

const instOutcomes: Array<[string, string]> = [
  ["NAAC & Accreditation", "Tangible contributions to innovation metrics and accreditation scores"],
  ["National Recognition", "Positioning as a startup-first, industry-integrated campus"],
  ["Student Outcomes", "Higher placement rates through real-world portfolio building"],
  ["Industry Access", "Direct connections to founders, investors, and domain operators"],
];


const whyUs: Array<[string, string, string]> = [
  ["01", "Venture-Led, Not Academic", "Built by founders, operators, and investors, not administrators. The Studio runs like a startup, not a student club."],
  ["02", "Execution-First Model", "Students build real products. Every cohort culminates in a Demo Day with live investor audiences."],
  ["03", "Integrated Pipeline", "A seamless journey from idea to MVP to funding — Genesis, Fellowship, and Accelerator are one system."],
  ["04", "Institutional Recognition", "Recognized by W-AHEAD Trust. Directly measurable contributions to NAAC, accreditation, and national rankings."],
  ["05", "Co-Branded Partnership", "Your institution is positioned as a Beacon Indica Partner — a nationally recognized startup-first campus."],
  ["06", "Strong Ecosystem Backing", "Access to an active network of founders, mentors, domain experts, and early-stage investors from day one."],
];


const nextSteps: Array<[string, string]> = [
  ["MoU & Partnership Agreement", "Formalize the co-branded partnership between your institution and Beacon Indica."],
  ["Core Team Selection", "Identify and onboard the 10-member student leadership team."],
  ["Launch First Cohort", "Kick off campus outreach and begin the inaugural Genesis cohort."],
];

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`py-20 md:py-24 ${className}`}>{children}</section>;
}

function VentureStudioPage() {
  useScrollAnimation();
  return (
    <>
      {/* Hero */}
      <Section className="bg-surface-container-low">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="font-mono-label text-accent">Venture-Led Startup Ecosystem</span>
          <h1 className="text-[36px] md:text-[56px] font-extrabold tracking-[-0.03em] mt-4">
            Beacon Indica Venture Studio
          </h1>
          <p className="text-lg text-on-surface-variant mt-4">
            Transforming Universities into Startup-Producing Ecosystems
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {["Powered by Beacon Indica Pvt Ltd", "Recognized by W-AHEAD Trust", "2025 — 2026"].map((b) => (
              <span key={b} className="border border-outline-variant rounded-full px-3 py-1 text-xs text-on-surface-variant">
                {b}
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* Overview */}
      <Section>
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <div className="max-w-3xl">
            <span data-animate="fade-up" className="font-mono-label text-accent">Overview</span>
            <h2 data-animate="fade-up" className="text-[32px] md:text-[44px] font-bold mt-4 tracking-[-0.02em]">
              What We Bring to Your Campus
            </h2>
            <p className="text-on-surface-variant mt-4 text-lg">
              The Beacon Indica Venture Studio is a venture-led innovation body co-branded with your institution — moving beyond theoretical incubation into real execution, real products, and real funding pathways.
            </p>
          </div>
          <div data-animate="stagger" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {valueCards.map(([Icon, t, d]) => (
              <div key={t} className="bg-card border border-outline-variant rounded-xl p-6">
                <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-bold mt-4">{t}</h3>
                <p className="text-on-surface-variant text-sm mt-2">{d}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            {layers.map(([num, title, body]) => (
              <div key={num} className="bg-surface-container-low rounded-xl p-6 border border-outline-variant">
                <div className="text-3xl font-extrabold text-on-surface/15">{num}</div>
                <h3 className="font-bold mt-2">{title}</h3>
                <p className="text-on-surface-variant text-sm mt-2">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Offerings */}
      <Section className="bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <div className="text-center">
            <span data-animate="fade-up" className="font-mono-label text-accent">Programs</span>
            <h2 data-animate="fade-up" className="text-[32px] md:text-[44px] font-bold mt-4 tracking-[-0.02em]">
              Venture Studio Offerings
            </h2>
            <p className="text-on-surface-variant mt-4">A fully integrated pipeline — from idea to funded startup</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {offerings.map((o) => (
              <div key={o.title} className="bg-surface border border-outline-variant rounded-xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 px-3 py-1.5 bg-accent text-accent-foreground text-[11px] font-bold tracking-wider">
                  {o.badge}
                </div>
                <h3 className="text-2xl font-bold tracking-tight">{o.title}</h3>
                <ul className="mt-6 space-y-2">
                  {o.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-outline-variant">
                  <span className="font-mono-label text-on-surface-variant text-xs">Outcome</span>
                  <div className="font-bold text-accent mt-1">{o.outcome}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Impact */}
      <Section className="bg-primary text-primary-foreground">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <div className="text-center">
            <span data-animate="fade-up" className="font-mono-label text-accent">Impact</span>
            <h2 data-animate="fade-up" className="text-[32px] md:text-[44px] font-bold mt-4 tracking-[-0.02em]">
              Annual Impact Per Campus
            </h2>
          </div>
          <div data-animate="stagger" className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {impactStats.map(([n, t, d]) => (
              <div key={t} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="text-4xl font-extrabold text-white">{n}</div>
                <div className="font-bold mt-2">{t}</div>
                <p className="text-primary-foreground/65 text-sm mt-1">{d}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
            {instOutcomes.map(([t, d]) => (
              <div key={t} className="bg-white/5 border border-white/10 rounded-lg p-5">
                <h3 className="font-bold">{t}</h3>
                <p className="text-primary-foreground/70 text-sm mt-2">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>


      {/* Why Us */}
      <Section className="bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <div className="text-center">
            <span data-animate="fade-up" className="font-mono-label text-accent">Why Us</span>
            <h2 data-animate="fade-up" className="text-[32px] md:text-[44px] font-bold mt-4 tracking-[-0.02em]">
              Why Beacon Indica
            </h2>
          </div>
          <div data-animate="stagger" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {whyUs.map(([n, t, d]) => (
              <div key={n} className="bg-surface border border-outline-variant rounded-xl p-6 hover:border-accent transition-colors">
                <div className="text-3xl font-extrabold text-accent/30">{n}</div>
                <h3 className="font-bold mt-2">{t}</h3>
                <p className="text-on-surface-variant text-sm mt-2">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>


      {/* Closing CTA */}
      <Section className="bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto px-6 md:px-10 text-center">
          <h2 className="text-[32px] md:text-[44px] font-bold tracking-[-0.02em]">
            Let's Build the Next Generation of Founders.
          </h2>
          <p className="text-primary-foreground/75 mt-4 text-lg">
            The Beacon Indica Venture Studio is more than a program. It is an institution-level transformation, positioning your university at the forefront of student entrepreneurship and innovation-led education.
          </p>
          <span className="inline-block mt-6 border border-accent/40 rounded-full px-4 py-1.5 text-xs font-mono-label text-accent">
            Recognized by W-AHEAD Trust
          </span>

          <div className="grid md:grid-cols-3 gap-4 mt-12 text-left">
            {nextSteps.map(([t, d], i) => (
              <div key={t} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="text-2xl font-extrabold text-accent">{i + 1}</div>
                <h3 className="font-bold mt-2">{t}</h3>
                <p className="text-primary-foreground/70 text-sm mt-2">{d}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center gap-3">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-8 py-4 rounded-md cta-shadow">
              Partner With Us <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="text-primary-foreground/70 text-sm mt-3">
              www.beaconindica.com · <a href="mailto:partnerships@beaconindica.com" className="text-accent hover:underline">partnerships@beaconindica.com</a>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
