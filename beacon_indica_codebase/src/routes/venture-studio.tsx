import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Hammer, Wallet, Briefcase, CheckCircle2 } from "lucide-react";
import type React from "react";
import { motion } from "framer-motion";
import { AnimateIn } from "@/components/ui/AnimateIn";

export const Route = createFileRoute("/venture-studio")({
  component: VentureStudioPage,
  head: () => ({
    meta: [
      { title: "Venture Studio | Beacon Indica" },
      { name: "description", content: "Beacon Indica Venture Studio: transforming universities into startup-producing ecosystems." },
      { property: "og:title", content: "Venture Studio | Beacon Indica" },
      { property: "og:description", content: "Beacon Indica Venture Studio: transforming universities into startup-producing ecosystems." },
      { property: "og:url", content: "https://beaconindica.com/venture-studio" },
    ],
    links: [{ rel: "canonical", href: "https://beaconindica.com/venture-studio" }],
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
  ["03", "Integrated Pipeline", "A seamless journey from idea to MVP to funding. Genesis, Fellowship, and Accelerator are one system."],
  ["04", "Institutional Recognition", "Recognized by W-AHEAD Trust. Directly measurable contributions to NAAC, accreditation, and national rankings."],
  ["05", "Co-Branded Partnership", "Your institution is positioned as a Beacon Indica Partner, a nationally recognized startup-first campus."],
  ["06", "Strong Ecosystem Backing", "Access to an active network of founders, mentors, domain experts, and early-stage investors from day one."],
];

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`py-20 md:py-24 overflow-hidden ${className}`}>{children}</section>;
}

function VentureStudioPage() {
  return (
    <>
      {/* Hero */}
      <Section className="bg-surface-container-low">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0 }}
            className="font-mono-label text-accent block"
          >
            Venture-Led Startup Ecosystem
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[36px] md:text-[56px] font-extrabold tracking-[-0.03em] mt-4"
          >
            Beacon Indica Venture Studio
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg text-on-surface-variant mt-4"
          >
            Transforming Universities into Startup-Producing Ecosystems
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-wrap justify-center gap-2 mt-6"
          >
            {["Powered by Beacon Indica Pvt Ltd", "Recognized by W-AHEAD Trust", "2025 - 2026"].map((b) => (
              <span key={b} className="border border-outline-variant rounded-full px-3 py-1 text-xs text-on-surface-variant">
                {b}
              </span>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* Overview */}
      <Section>
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <div className="max-w-3xl">
            <AnimateIn>
              <span className="font-mono-label text-accent">Overview</span>
              <h2 className="text-[32px] md:text-[44px] font-bold mt-4 tracking-[-0.02em]">
                What We Bring to Your Campus
              </h2>
              <p className="text-on-surface-variant mt-4 text-lg">
                The Beacon Indica Venture Studio is a venture-led innovation body co-branded with your institution, moving beyond theoretical incubation into real execution, real products, and real funding pathways.
              </p>
            </AnimateIn>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {valueCards.map(([Icon, t, d], index) => (
              <AnimateIn
                key={t}
                delay={index * 0.1}
                className="w-full"
              >
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="bg-card border border-outline-variant rounded-xl p-6 h-full"
                  style={{ willChange: "transform" }}
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-bold mt-4">{t}</h3>
                  <p className="text-on-surface-variant text-sm mt-2">{d}</p>
                </motion.div>
              </AnimateIn>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            {layers.map(([num, title, body], index) => (
              <AnimateIn
                key={num}
                delay={index * 0.1}
                className="w-full"
              >
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="bg-surface-container-low rounded-xl p-6 border border-outline-variant h-full"
                  style={{ willChange: "transform" }}
                >
                  <div className="text-3xl font-extrabold text-on-surface/15">{num}</div>
                  <h3 className="font-bold mt-2">{title}</h3>
                  <p className="text-on-surface-variant text-sm mt-2">{body}</p>
                </motion.div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </Section>

      {/* Offerings */}
      <Section className="bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <div className="text-center">
            <AnimateIn>
              <span className="font-mono-label text-accent">Programs</span>
              <h2 className="text-[32px] md:text-[44px] font-bold mt-4 tracking-[-0.02em]">
                Venture Studio Offerings
              </h2>
              <p className="text-on-surface-variant mt-4">A fully integrated pipeline from idea to funded startup</p>
            </AnimateIn>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {offerings.map((o, index) => (
              <AnimateIn
                key={o.title}
                delay={index * 0.12}
                className="w-full"
              >
                <motion.div
                  whileHover={{ y: -6, boxShadow: "0 20px 48px rgba(0,0,0,0.12)" }}
                  transition={{ duration: 0.2 }}
                  className="bg-surface border border-outline-variant rounded-xl p-8 relative overflow-hidden h-full"
                  style={{ willChange: "transform, box-shadow" }}
                >
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
                </motion.div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </Section>

      {/* Impact */}
      <Section className="bg-primary text-primary-foreground">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <div className="text-center">
            <AnimateIn>
              <span className="font-mono-label text-accent">Impact</span>
              <h2 className="text-[32px] md:text-[44px] font-bold mt-4 tracking-[-0.02em]">
                Annual Impact Per Campus
              </h2>
            </AnimateIn>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {impactStats.map(([n, t, d], index) => (
              <AnimateIn
                key={t}
                delay={index * 0.1}
                className="w-full"
              >
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 h-full"
                  style={{ willChange: "transform" }}
                >
                  <div className="text-4xl font-extrabold text-black">{n}</div>
                  <div className="font-bold mt-2">{t}</div>
                  <p className="text-primary-foreground/65 text-sm mt-1">{d}</p>
                </motion.div>
              </AnimateIn>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
            {instOutcomes.map(([t, d], index) => (
              <AnimateIn
                key={t}
                delay={index * 0.1}
                className="w-full"
              >
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-5 h-full"
                  style={{ willChange: "transform" }}
                >
                  <h3 className="font-bold">{t}</h3>
                  <p className="text-primary-foreground/70 text-sm mt-2">{d}</p>
                </motion.div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </Section>

      {/* Why Us */}
      <Section className="bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <div className="text-center">
            <AnimateIn>
              <span className="font-mono-label text-accent">Why Us</span>
              <h2 className="text-[32px] md:text-[44px] font-bold mt-4 tracking-[-0.02em]">
                Why Beacon Indica
              </h2>
            </AnimateIn>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {whyUs.map(([n, t, d], index) => (
              <AnimateIn
                key={n}
                delay={index * 0.1}
                className="w-full"
              >
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="bg-surface border border-outline-variant rounded-xl p-6 hover:border-accent transition-colors h-full"
                  style={{ willChange: "transform" }}
                >
                  <div className="text-3xl font-extrabold text-accent/30">{n}</div>
                  <h3 className="font-bold mt-2">{t}</h3>
                  <p className="text-on-surface-variant text-sm mt-2">{d}</p>
                </motion.div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
