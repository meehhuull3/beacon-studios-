import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import React, { useEffect, useRef, useState } from "react";
import { ScrollingPosters } from '@/components/ScrollingPosters';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import BubbleAnimation from '@/components/BubbleAnimation';

import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Lightbulb,
  Hammer,
  Rocket,
  Search,
  Users,
  Code,
  TrendingUp,
  BarChart3,
  Star,
  Building2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Beacon Indica | Where Young Founders Begin" },
      { name: "description", content: "Venture studios inside Indian colleges — structured ecosystems that take students from idea to funded startup." },
      { property: "og:title", content: "Beacon Indica | Where Young Founders Begin" },
      { property: "og:description", content: "Venture studios inside Indian colleges — structured ecosystems that take students from idea to funded startup." },
      { property: "og:url", content: "https://beacon-indica.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://beacon-indica.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Beacon Indica",
          url: "https://beacon-indica.lovable.app",
        }),
      },
    ],
  }),
});

function PipelineNode({
  icon: Icon,
  label,
  active = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 group">
      <div
        className={
          active
            ? "w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center transition-transform group-hover:scale-110 shadow-[0_8px_24px_-8px_rgba(255,92,0,0.4)]"
            : "w-12 h-12 rounded-full border-2 border-accent bg-surface flex items-center justify-center transition-transform group-hover:scale-110"
        }
      >
        <Icon className={active ? "w-6 h-6" : "w-5 h-5 text-accent"} />
      </div>
      <span
        className={`font-mono-label ${active ? "text-accent font-bold" : "text-on-surface"}`}
      >
        {label}
      </span>
    </div>
  );
}

function AnimatedHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h1 className={`${className} select-none cursor-default`}>
      {typeof children === 'string'
        ? children.split('').map((char, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                opacity: 0,
                animation: `letterIn 0.6s ease forwards`,
                animationDelay: `${i * 30}ms`,
                whiteSpace: char === ' ' ? 'pre' : undefined,
              }}
            >
              {char}
            </span>
          ))
        : children}
    </h1>
  );
}

function Hero() {
  const steps: Array<[React.ComponentType<{ className?: string }>, string, boolean]> = [
    [GraduationCap, "Campus", false],
    [Lightbulb, "Idea", false],
    [Hammer, "Build", false],
    [Rocket, "Venture", true],
  ];
  return (
    <section className="relative overflow-hidden cursor-default min-h-screen">
      {/* Background treatment */}


      {/* Dot grid on top */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: -10,
          backgroundImage: "radial-gradient(circle, #E0E0E0 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.3,
        }}
      />


      <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center text-center">
        <div style={{ position: 'relative', zIndex: 2 }} className="w-full flex flex-col items-center">
          <div className="flex flex-wrap items-baseline justify-center gap-4">
            <AnimatedHeading className="text-[72px] md:text-[130px] font-extrabold tracking-[-0.05em] leading-none">
              BEACON
            </AnimatedHeading>
            <AnimatedHeading className="text-[72px] md:text-[130px] font-extrabold tracking-[-0.05em] leading-none text-accent">
              INDICA
            </AnimatedHeading>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats: Array<[string, string]> = [
    ["600+", "Students Trained Per Campus Annually"],
    ["150+", "MVPs Built Each Year"],
    ["₹5L", "Funding Per Fellowship Startup"],
    ["₹1Cr+", "Accelerator Stage Funding"],
  ];
  return (
    <section className="bg-primary text-primary-foreground py-12">
      <div data-animate="stagger" className="max-w-[1200px] mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map(([n, l]) => (
          <div key={l}>
            <div className="text-[40px] md:text-[48px] leading-tight font-bold tracking-tight text-white">
              {n}
            </div>
            <p className="font-mono-label opacity-60 mt-1">{l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Ecosystem() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-20">
      <p className="font-mono-label text-accent text-xs tracking-widest uppercase mb-3 text-center">THE ECOSYSTEM</p>
      <h2 className="text-[28px] md:text-[40px] font-extrabold tracking-tight text-center mb-3">A Complete Founder Pipeline</h2>
      <p className="text-on-surface-variant text-center max-w-xl mx-auto mb-16">From campus to capital — every stage structured, every founder supported.</p>

      {/* Programs + Process combined */}
      <div className="relative">
        {/* Vertical connecting line */}
        <div className="hidden md:block absolute left-[50%] top-0 bottom-0 w-[2px] bg-outline-variant -translate-x-1/2" />

        {[
          {
            num: '01', name: 'Genesis', tag: null,
            desc: 'The foundational layer of Beacon Indica — embedded within universities and colleges. A high-performance environment where students explore, build, and validate startup ideas alongside their academic journey.',
            bullets: ['Structured startup environment', 'Problem identification & validation', 'Mentors & peer builders', 'Idea development & experimentation'],
            process: 'Discovery — Entrepreneurial students identified across the campus through structured scouting.',
            cta: 'Apply to Genesis', href: '/programs#genesis',
          },
          {
            num: '02', name: 'Fellowship', tag: 'INVITE ONLY',
            desc: 'For founders with strong intent and early execution. The focus shifts from exploration to building investable companies.',
            bullets: ['Up to ₹5 Lakhs funding', 'MVP & technical support', 'Marketing & GTM strategy', 'Legal & compliance support'],
            process: 'Team Formation — Students grouped into startup teams by skill, domain, and shared vision.',
            cta: 'Apply to Fellowship', href: '/programs#fellowship',
          },
          {
            num: '03', name: 'Accelerator', tag: null,
            desc: 'For startups ready to scale and raise capital. Focus on growth, positioning, and investor readiness.',
            bullets: ['Curated investor network', 'Fundraising support', 'Business scaling frameworks', 'Strategic partnerships'],
            process: 'Investor Access — Top startups connect to the Fellowship program and the Beacon investor network.',
            cta: 'Apply to Accelerator', href: '/programs#accelerator',
          },
        ].map((item, i) => (
          <div key={item.num} className={`relative flex flex-col md:flex-row gap-6 mb-16 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
            {/* Program card */}
            <div className="flex-1 bg-surface-container border border-outline-variant rounded-2xl p-7">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[48px] font-extrabold text-on-surface opacity-10 leading-none">{item.num}</span>
                {item.tag && <span className="text-[10px] font-bold tracking-widest text-accent border border-accent rounded-full px-3 py-1">{item.tag}</span>}
              </div>
              <h3 className="text-[22px] font-extrabold mb-3">{item.name}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-4">{item.desc}</p>
              <ul className="space-y-2 mb-6">
                {item.bullets.map(b => (
                  <li key={b} className="flex items-center gap-2 text-sm text-on-surface">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <Link to={item.href} className="inline-flex items-center gap-2 bg-accent text-white font-bold text-sm px-5 py-2.5 rounded-full hover:opacity-90 transition">
                {item.cta} →
              </Link>
            </div>

            {/* Center node */}
            <div className="hidden md:flex flex-col items-center justify-center w-16 flex-shrink-0 z-10">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {item.num}
              </div>
            </div>

            {/* Process card */}
            <div className="flex-1 flex items-center">
              <div className="bg-surface border border-outline-variant rounded-2xl p-6 w-full">
                <p className="font-mono-label text-accent text-xs tracking-widest uppercase mb-2">THE PROCESS</p>
                <p className="text-on-surface text-sm leading-relaxed">{item.process}</p>
              </div>
            </div>
          </div>
        ))}

        {/* MVP Build process node — standalone */}
        <div className="flex flex-col md:flex-row gap-6 mb-16">
          <div className="flex-1 flex items-center">
            <div className="bg-surface border border-outline-variant rounded-2xl p-6 w-full">
              <p className="font-mono-label text-accent text-xs tracking-widest uppercase mb-2">THE PROCESS</p>
              <p className="text-on-surface text-sm leading-relaxed">MVP Build — 8-week intensive sprint. Mentors guide teams from idea to a working, tested prototype.</p>
            </div>
          </div>
          <div className="hidden md:block w-16 flex-shrink-0" />
          <div className="flex-1" />
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-4">
        <p className="text-on-surface-variant text-sm mb-4">Want to bring these programs to your campus?</p>
        <Link to="/contact" className="inline-flex items-center gap-2 border border-accent text-accent font-bold text-sm px-6 py-3 rounded-full hover:bg-accent hover:text-white transition">
          Talk to Us →
        </Link>
      </div>
    </section>
  );
}

const STUDIO_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAWDRwctnxwMh-_-079XyooOL1MVQ9ozX_oyBtOC7p_jFBXJ5Jok73pNSwH4LstgOeVY7wsUt5xZTPrJD4dYJGhWPx_uSapxIn_AE27MyoLuW8ong3290MiqiHQxGSpzjWEvMM9cCsVrXMHVdVGKafBJ680rUBVWE8kBeZO501jAHyE4Pe_pZf6DOtoklAj5z6pTFwpFiKCcDe3eLo6b8i21XLhQyk4y74fEKLGhOu2enwm-oMI6OnqaTVT9iQkzIYrhdoMO3GBSeSE",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBnwHw6P2NIXxL6XpCTR1oL5FvJC8IHHIYGtb71mpHZWK8Zb34GvI25DP6AqziCzwVzRfqP70fjnHPxu1kdqKsTix4XCTOkgiDarjn2tGCBY54RgeOCh5kvq_zNll7lYoZWvwq6h2n7boGQKuG4HzGr7i6Rzlkx-fM2oENYuV0jVUDj22xrILY2sCEMulA90p1OB5A0BO_hm0bwOuySXCSzZ60lqAEX5BEE0pIhK0yr9_mCkMdTFgCYK_D65qmxstgvJrp3c4o11Tna",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB6-_PjiaVZsxrgV6CJn8243HEisq2O5uyC7_v8P4G75My5sgG4vyTNCtc5AXjsMVpITwt9D3KCdHI0Rk70QFxZLDirm2irBNrUx771TjQN4avikMjk03_sKF_8VBTt36uPbeoeDHuWrGW9xag_duu9pcRaWW8v7_7E_0fwomIqCThauFBXK3TADcUXBKIdJW93BUcs_SAv4bm9rr0eQw5SsmFXBZSZ_H8FeyAkOdpueHUpekmXJOBxrybGiwHqj6dr24SnHkfGMWTo",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDmOT8zIES32YkD1VlthK7xDRGvW-yYsEAF5YdrvpNKh14-y-3K3bfX-vEh2iNLl0jNumPBACkx3GwMCsx48R9ipgl0NiZRIASBthXtUA4gNXUROTZDjxJjRM4pHRijAXdZhf9LWBjKRIyi0DvxwZqA7LqgYanK4OZVgO4GMHE7ot0rqx7Wuw3ehryoi4Tf6iz4GUhxLweJA-YLK5_IHb-_1eBqqV2KbROnDP0W-c_FC3KN0Gp6zaWja_-53dCd4CHUMluRlQ0RMwZY",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBcgFcYkiw_1lKHJgNoeFn3iZMmXz84OnDxNhc4veH_tqXmveFKPS63sK-Khv6c_AkIxH-2mDzlGpSlIBYRfZ1sy310FY-xFB469NC03WWCyW1WCkklOXjxsLBKUoePKWoYRWbvl1Jx7h5QrgKYK9_pWNsM5eH-Tl8emeNbqcSdBIC5i6DRmeeasvZIDjxtzsk5mJ0bGrgRzMJZdDrt60audi9pSmhy9BrPu0_zpTdUex-z_5O7H9RrIcW3mS82sXHACgB9jIPdBU-H",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBOdEVPyyMbiScnjzNM_o4oiLnu4RoDaj15OgvybMaCvTGzTFMN9JnvB1m092Xnzb7RlZBIXn54GSK5DcIs1emO0KRYHz9HLiOuUvZTonrWwoZwIh7fBQnEeoLUpx0tI9S60GL8rHbUOn2S3DcfTF73zR_MEOfpIhzSA1jzks50LaSKOBhgl7dkp5-jybLlX6XTin-CYvWLv9rRSf7VGVLbU-pU4vWj8au5sis0kOhCDDICjSLl6JkgeyCASAXFtsqGRpFdX-94pfuW",
];

function Studios() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-20 md:py-16">
      <div className="grid md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-4 mb-8 md:mb-0">
          <span className="font-mono-label text-accent">Active Campus Studios</span>
          <h2 className="text-[32px] md:text-[48px] leading-tight font-bold mt-4 mb-6 tracking-[-0.02em]">
            Student-Led Innovation Hubs
          </h2>
          <p className="text-on-surface-variant mb-8">
            Each Beacon studio is operated by a 10-person student leadership team
            on the ground.
          </p>
          <Link
            to="/campus-studios"
            className="font-bold border-b-2 border-primary pb-1 hover:text-accent hover:border-accent transition-colors"
          >
            Browse Studio Locations
          </Link>
        </div>
        <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-4">
          {STUDIO_IMAGES.map((src, i) => (
            <img
              key={i}
              src={src}
              alt="Campus studio"
              loading="lazy"
              className="w-full h-48 object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer"
            />
          ))}
        </div>
      </div>
    </section>
  );
}


function PartnerCTA() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-20">
      <div className="bg-accent-tint p-10 md:p-20 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-10 border border-accent/15">
        <div className="max-w-xl">
          <h2 className="text-[28px] md:text-[40px] leading-tight font-bold mb-4 tracking-[-0.02em]">
            Bring Beacon to Your Institution.
          </h2>
          <p className="text-[18px] leading-[28px] text-on-surface-variant">
            Empower your students with the resources, capital, and network they
            need to build the next generation of industry-defining companies.
          </p>
        </div>
        <Link
          to="/contact"
          className="bg-primary text-primary-foreground font-bold px-10 py-5 rounded-md text-lg whitespace-nowrap hover:bg-primary/90 transition-colors"
        >
          Partner With Us
        </Link>
      </div>
    </section>
  );
}

const FAQS = [
  { q: "What is Beacon Indica?", a: "Beacon Indica is a venture-building platform that embeds startup studios inside college campuses — taking students from raw ideas to funded startups through Genesis, Fellowship, and Accelerator programs." },
  { q: "Who can join Genesis?", a: "Any college student — no prior startup experience needed. If you have ambition and are willing to execute, Genesis is built for you." },
  { q: "Is Genesis paid or free?", a: "Genesis is a paid program. It is priced intentionally to ensure only serious, committed founders join each cohort." },
  { q: "How does a college partner with Beacon Indica?", a: "Fill the inquiry form on our Campus Studios page or email partnerships@beaconindica.com. We handle everything — program, mentors, and resources. Zero cost to the institution." },
  { q: "What do Fellows receive?", a: "Selected Fellows receive up to ₹5 Lakhs in funding, MVP support, marketing and GTM guidance, legal help, and hands-on mentorship from founders and operators." },
  { q: "How is Beacon Indica different from a college E-Cell?", a: "E-Cells run events. Beacon Indica runs a structured execution pipeline — every cohort ends with a working MVP, real users, and investor exposure at Demo Day." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-20">
      <p className="font-mono-label text-accent text-xs tracking-widest uppercase mb-3">FAQ</p>
      <h2 className="text-[28px] md:text-[40px] font-extrabold tracking-tight mb-10">Frequently Asked Questions</h2>
      <div className="divide-y divide-outline-variant border border-outline-variant rounded-2xl overflow-hidden">
        {FAQS.map((item, i) => (
          <div key={i}>
            <button
              className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-surface-container transition-colors"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="font-semibold text-on-surface text-[15px] md:text-[16px]">{item.q}</span>
              <span className="ml-4 flex-shrink-0 text-accent text-xl font-bold">
                {open === i ? '−' : '+'}
              </span>
            </button>
            {open === i && (
              <div
                className="px-6 pb-5 text-on-surface-variant text-[14px] md:text-[15px] leading-relaxed"
                style={{ animation: 'fadeSlideDown 0.25s ease forwards' }}
              >
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function StickyMobileCTA() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface border-t border-outline-variant px-4 py-3 flex gap-3">
      <Link to="/programs" className="flex-1 bg-accent text-white font-bold text-sm py-3 rounded-md text-center">
        Apply to Genesis →
      </Link>
      <Link to="/contact" className="flex-1 border border-primary text-primary font-bold text-sm py-3 rounded-md text-center">
        Partner With Us
      </Link>
    </div>
  );
}

function Index() {
  useScrollAnimation();
  return (
    <>
      {/* Bubbles float full page in background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1, opacity: 0.65 }}>
        <BubbleAnimation />
      </div>
      {/* All page content sits above bubble layer (z-index: 2+) */}
      <div className="relative" style={{ zIndex: 2 }}>
        <Hero />
        <Stats />

        <Ecosystem />
        <Studios />
        <FAQ />
        <PartnerCTA />
      </div>
      <StickyMobileCTA />
    </>
  );
}
