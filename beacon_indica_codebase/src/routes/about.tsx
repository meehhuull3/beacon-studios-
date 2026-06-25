import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { advisors } from "@/data/advisors";

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
      { property: "og:url", content: "https://beaconindica.com/about" },
    ],
    links: [{ rel: "canonical", href: "https://beaconindica.com/about" }],
  }),
});

function AboutPage() {

  const pillars = [
    ["AMBITION", "People with the drive to make a real, lasting difference"],
    ["EXECUTION", "focusing our energy on what works so we can keep growing together"],
    ["ACCESS", "Institutional networks, capital and expert guidance"],
  ] as const;

  const different = [
    ["Complete Founder Pipeline", "providing the structure and support you need at every stage, closing the gaps so you can move fast and lead with confidence."],
    ["Execution-Centric Model", "No passive learning. Every layer is designed around real output and measurable progress. We ship."],
    ["Integrated Support System", "Product, growth, legal, and capital: all critical functions are built into the ecosystem so founders stay focused."],
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
      <section className="bg-surface-container-low py-20 md:py-28 overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0 }}
            className="font-mono-label text-accent block"
          >
            Who We Are
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[36px] md:text-[56px] leading-tight font-extrabold tracking-[-0.03em] mt-4"
          >
            Beacon Indica
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg text-on-surface-variant mt-6"
          >
            Beacon Indica is a venture-building platform designed to help students and early-stage founders build real, scalable companies from the ground up. We operate at the intersection of ambition, execution, and institutional access, enabling individuals to move from raw ideas to venture-backed startups.
          </motion.p>
          <motion.blockquote
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.35 }}
            className="mt-10 text-[24px] md:text-[32px] font-bold tracking-tight text-primary"
          >
            "Startups are not learned. They are built."
          </motion.blockquote>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
            {pillars.map(([label, body], index) => (
              <AnimateIn
                key={label}
                delay={0.4 + index * 0.1}
                className="bg-surface border border-outline-variant rounded-xl p-6"
              >
                <span className="font-mono-label text-accent">{label}</span>
                <p className="mt-3 text-on-surface-variant">{body}</p>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Advisory Board */}
      <section className="bg-surface py-24 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          
          {/* Header */}
          <div className="text-center mb-16">
            <span data-animate="fade-up" className="font-mono-label text-accent block">
              ADVISORY BOARD
            </span>
            <h2 data-animate="fade-up" className="text-[32px] md:text-[44px] font-bold mt-4 tracking-[-0.02em]">
              Guided by Those Who've Built Before
            </h2>
            <Link to="/advisory-board" className="inline-flex items-center gap-1 text-accent text-sm font-semibold hover:underline mt-2">
              View Full Board →
            </Link>
            <p data-animate="fade-up" className="text-on-surface-variant mt-4 max-w-2xl mx-auto text-lg">
              Our advisors are more than just experts—they're operators, founders, and investors who have built and scaled businesses from scratch. They bring real-world experience and deep pattern recognition to support every founder in the Beacon Indica community.
            </p>
          </div>

          {/* Advisor Cards Grid */}
          <div data-animate="stagger" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {advisors.map((advisor, index) => {
              return (
                <AnimateIn key={advisor.slug} delay={index * 0.1} className="w-full">
                  <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                    style={{ willChange: "transform" }}
                    className="bg-card border border-outline-variant rounded-2xl overflow-hidden hover:border-accent hover:shadow-md transition-all duration-300 group h-full"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] min-h-[280px] h-full">
                      
                      {/* Photo — left column */}
                      <div className="relative overflow-hidden min-h-[240px] sm:min-h-0 sm:h-full">
                        {advisor.photo ? (
                          <img
                            src={advisor.photo}
                            alt={advisor.name}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 absolute inset-0"
                          />
                        ) : (
                          <div className="w-full h-full min-h-[240px] bg-surface-container flex items-center justify-center absolute inset-0">
                            <span className="text-5xl font-bold text-accent/20">{advisor.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>

                      {/* Content — right column */}
                      <div className="p-7 flex flex-col justify-between h-full">
                        <div>
                          <span className="font-mono-label text-on-surface-variant/50 text-[10px]">▲ BEACON INDICA</span>
                          <h3 className="text-xl font-bold tracking-tight text-primary mt-2">{advisor.name}</h3>
                          <p className="font-mono-label text-accent text-[11px] mt-1">{advisor.title}</p>
                          <hr className="my-4 border-outline-variant" />
                          <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-4">{advisor.shortBio}</p>
                          <div className="flex flex-wrap gap-2 mt-4">
                            {advisor.tags.map((tag) => (
                              <span key={tag} className="text-[10px] font-mono-label bg-surface-container text-on-surface-variant px-2.5 py-1 rounded-full border border-outline-variant">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Link
                          to="/advisors/$slug"
                          params={{ slug: advisor.slug }}
                          className="inline-flex items-center gap-1.5 mt-5 font-mono-label text-accent text-[11px] hover:gap-2.5 transition-all cursor-pointer"
                        >
                          READ MORE →
                        </Link>
                      </div>

                    </div>
                  </motion.div>
                </AnimateIn>
              );
            })}
          </div>

          {/* Join CTA */}
          <div data-animate="fade-up" className="mt-16 text-center">
            <p className="text-on-surface-variant text-sm">Interested in joining our advisory network?</p>
            <a
              href="mailto:admin@beaconindica.com"
              className="inline-flex items-center gap-2 mt-3 text-accent font-semibold hover:underline"
            >
              Reach out to us →
            </a>
          </div>

        </div>
      </section>

      {/* Vision */}
      <section className="bg-primary text-primary-foreground py-20 overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 md:px-10 text-center">
          <AnimateIn direction="up" delay={0}>
            <span className="font-mono-label text-accent">Our Vision</span>
            <h2 className="text-[32px] md:text-[48px] font-bold mt-4 tracking-[-0.02em]">
              India's Most Effective Founder Pipeline.
            </h2>
            <p className="text-primary-foreground/70 mt-4 text-lg">
              Starting from campuses. Leading to globally scalable companies.
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="bg-surface py-20 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <div className="text-center">
            <AnimateIn>
              <span className="font-mono-label text-accent">What Makes Us Different</span>
              <h2 className="text-[32px] md:text-[44px] font-bold mt-4 tracking-[-0.02em]">
                Built Different. By Design.
              </h2>
            </AnimateIn>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {different.map(([title, body], index) => (
              <AnimateIn
                key={title}
                delay={index * 0.1}
                className="w-full"
              >
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="bg-card border border-outline-variant rounded-xl p-8 hover:border-accent transition-colors h-full"
                  style={{ willChange: "transform" }}
                >
                  <h3 className="text-xl font-bold tracking-tight">{title}</h3>
                  <p className="text-on-surface-variant mt-3">{body}</p>
                </motion.div>
              </AnimateIn>
            ))}
          </div>

          <div className="text-center mt-24">
            <AnimateIn>
              <h2 className="text-[32px] md:text-[44px] font-bold tracking-[-0.02em]">
                Built for the Relentless Builder
              </h2>
            </AnimateIn>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {builtFor.map(([title, body], index) => (
              <AnimateIn
                key={title}
                delay={index * 0.1}
                className="w-full"
              >
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="bg-surface-container-low rounded-xl p-6 border border-outline-variant h-full"
                  style={{ willChange: "transform" }}
                >
                  <h3 className="font-bold">{title}</h3>
                  <p className="text-on-surface-variant text-sm mt-3">{body}</p>
                </motion.div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="bg-surface-container-low py-20 overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 md:px-10 text-center">
          <AnimateIn direction="up">
            <blockquote className="text-[26px] md:text-[36px] font-bold tracking-tight leading-snug">
              "Beacon Indica is not a program. It is an engine for building companies."
            </blockquote>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-block mt-10"
              style={{ willChange: "transform" }}
            >
              <Link
                to="/contact"
                className="bg-accent text-accent-foreground font-bold px-8 py-4 rounded-md cta-shadow block"
              >
                Get in Touch
              </Link>
            </motion.div>
          </AnimateIn>
        </div>
      </section>
    </>
  );
}