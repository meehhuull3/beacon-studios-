import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About | Beacon Indica" },
      {
        name: "description",
        content:
          "Beacon Indica builds venture studios inside Indian colleges to turn ambitious students into real founders.",
      },
      { property: "og:title", content: "About | Beacon Indica" },
      { property: "og:description", content: "Beacon Indica builds venture studios inside Indian colleges to turn ambitious students into real founders." },
      { property: "og:url", content: "https://beacon-indica.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://beacon-indica.lovable.app/about" }],
  }),
});

function AboutPage() {
  useScrollAnimation();
  const rows = [
    ["E-Cells / Clubs", "Events and talks", "Ideas stay ideas after demo day", false],
    ["College Incubators", "Slow bureaucratic process", "Hard for early-stage students", false],
    ["National Fellowships", "Centralised and competitive", "Only elite institutes benefit", false],
    ["Beacon Indica", "Campus-first, execution-focused studio", "Structured path from idea to MVP to users to funding", true],
  ] as const;

  const pillars = [
    ["AMBITION", "High-agency individuals driven to create lasting impact"],
    ["EXECUTION", "Relentless focus on real output and measurable progress"],
    ["ACCESS", "Institutional networks, capital and expert guidance"],
  ] as const;

  const different = [
    ["Complete Founder Pipeline", "From campus to capital — every stage of the founder journey is structured and supported. No gaps, no guesswork."],
    ["Execution-Centric Model", "No passive learning. Every layer is designed around real output and measurable progress. We ship."],
    ["Integrated Support System", "Product, growth, legal, and capital — all critical functions are built into the ecosystem so founders stay focused."],
    ["Institutional + Startup Hybrid", "Combining the access and credibility of institutions with the speed and intensity of startups."],
  ] as const;

  const builtFor = [
    ["Students", "Who want to build, not just learn. Who see lectures as a launching pad, not the destination."],
    ["Early-Stage Founders", "Seeking structure, velocity, and the infrastructure to transform vision into traction."],
    ["High-Agency Individuals", "Willing to execute relentlessly. Self-starters who take ownership and move fast."],
    ["Ambitious Teams", "Aiming to build fundable and scalable startups that can impact millions."],
  ] as const;

  return (
    <>
      {/* Hero */}
      <section className="bg-surface-container-low py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="font-mono-label text-accent">Who We Are</span>
          <h1 className="text-[36px] md:text-[56px] leading-tight font-extrabold tracking-[-0.03em] mt-4">
            About Beacon Indica
          </h1>
          <p className="text-lg text-on-surface-variant mt-6">
            Beacon Indica is a venture-building platform designed to help students and early-stage founders build real, scalable companies from the ground up. We operate at the intersection of ambition, execution, and institutional access — enabling individuals to move from raw ideas to venture-backed startups.
          </p>
          <blockquote data-animate="scale-up" className="mt-10 text-[24px] md:text-[32px] font-bold tracking-tight text-primary">
            "Startups are not learned. They are built."
          </blockquote>
          <div data-animate="stagger" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
            {pillars.map(([label, body]) => (
              <div key={label} className="bg-surface border border-outline-variant rounded-xl p-6">
                <span className="font-mono-label text-accent">{label}</span>
                <p className="mt-3 text-on-surface-variant">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-10 text-center">
          <span className="font-mono-label text-accent">Our Vision</span>
          <h2 data-animate="fade-up" className="text-[32px] md:text-[48px] font-bold mt-4 tracking-[-0.02em]">
            India's Most Effective Founder Pipeline.
          </h2>
          <p className="text-primary-foreground/70 mt-4 text-lg">
            Starting from campuses. Leading to globally scalable companies.
          </p>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="bg-surface py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <div className="text-center">
            <span data-animate="fade-up" className="font-mono-label text-accent">What Makes Us Different</span>
            <h2 data-animate="fade-up" className="text-[32px] md:text-[44px] font-bold mt-4 tracking-[-0.02em]">
              Built Different. By Design.
            </h2>
          </div>
          <div data-animate="stagger" className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {different.map(([title, body]) => (
              <div key={title} className="bg-card border border-outline-variant rounded-xl p-8 hover:border-accent transition-colors">
                <h3 className="text-xl font-bold tracking-tight">{title}</h3>
                <p className="text-on-surface-variant mt-3">{body}</p>
              </div>
            ))}
          </div>

          <h2 data-animate="fade-up" className="text-[32px] md:text-[44px] font-bold text-center tracking-[-0.02em] mt-24">
            Built for the Relentless Builder
          </h2>
          <div data-animate="stagger" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {builtFor.map(([title, body]) => (
              <div key={title} className="bg-surface-container-low rounded-xl p-6 border border-outline-variant">
                <h3 className="font-bold">{title}</h3>
                <p className="text-on-surface-variant text-sm mt-3">{body}</p>
              </div>
            ))}
          </div>

          <div data-animate="fade-up" className="mt-12 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant">
                  {["Program Type", "What They Do", "Reality"].map((h) => (
                    <th
                      key={h}
                      className="font-mono-label text-on-surface-variant py-4 pr-4"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([a, b, c, highlight]) => (
                  <tr
                    key={a as string}
                    className={
                      highlight
                        ? "bg-accent/8 border-l-4 border-accent font-semibold"
                        : "opacity-70 hover:opacity-90 transition-opacity"
                    }
                  >
                    <td className="py-5 pr-4 font-bold flex items-center gap-2">
                      {highlight ? (
                        <Check className="w-4 h-4 text-accent" />
                      ) : (
                        <X className="w-4 h-4 text-on-surface-variant" />
                      )}
                      {a}
                    </td>
                    <td className="py-5 pr-4 text-on-surface-variant">{b}</td>
                    <td className="py-5 pr-4 text-on-surface-variant">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="bg-surface-container-low py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-10 text-center">
          <blockquote data-animate="scale-up" className="text-[26px] md:text-[36px] font-bold tracking-tight leading-snug">
            "Beacon Indica is not a program. It is an engine for building companies."
          </blockquote>
          <Link
            to="/contact"
            className="inline-flex mt-10 bg-accent text-accent-foreground font-bold px-8 py-4 rounded-md cta-shadow"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}