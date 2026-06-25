import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import React, { useEffect, useRef, useState } from "react";
import { ScrollingPosters } from '@/components/ScrollingPosters';
import { motion } from "framer-motion";
import { AnimateIn } from "@/components/ui/AnimateIn";
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
      { property: "og:url", content: "https://beaconindica.com/" },
    ],
    links: [{ rel: "canonical", href: "https://beaconindica.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Beacon Indica",
          url: "https://beaconindica.com",
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
    <section className="relative overflow-hidden cursor-default min-h-screen min-h-[100dvh]">
      {/* Bubbles — clipped inside hero only by overflow-hidden */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0, opacity: typeof window !== 'undefined' && window.innerWidth <= 768 ? 0.35 : 0.65 }}>
        <BubbleAnimation />
      </div>

      {/* Dot grid on top */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          backgroundImage: "radial-gradient(circle, #E0E0E0 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.3,
        }}
      />

      <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center text-center">
        <div style={{ position: 'relative', zIndex: 2 }} className="w-full flex flex-col items-center px-5 sm:px-6 py-16">


          {/* Hook headline — word-by-word reveal */}
          <h1 className="text-[40px] sm:text-[64px] md:text-[96px] lg:text-[120px] font-extrabold tracking-[-0.04em] sm:tracking-[-0.05em] leading-[1] sm:leading-[0.95] max-w-5xl">
            {["Got", "an", "Idea?"].map((word, i) => (
              <motion.span
                key={`l1-${i}`}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 + i * 0.08 }}
                style={{ display: "inline-block", marginRight: "0.25em", willChange: "transform, opacity" }}
              >
                {word}
              </motion.span>
            ))}
            <br />
            {["Let's", "Build", "It."].map((word, i) => (
              <motion.span
                key={`l2-${i}`}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.5 + i * 0.08 }}
                style={{ display: "inline-block", marginRight: "0.25em", willChange: "transform, opacity" }}
                className={i === 1 ? "text-accent relative" : ""}
              >
                {word}
                {i === 1 && (
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 1.1 }}
                    style={{ transformOrigin: "left" }}
                    className="absolute left-0 right-0 -bottom-1 h-[5px] md:h-[10px] bg-accent/30 rounded-full"
                  />
                )}
              </motion.span>
            ))}
          </h1>

          {/* Subtext below the headline */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 1.3 }}
            style={{ willChange: "transform, opacity" }}
            className="text-lg sm:text-xl md:text-2xl text-on-surface-variant mt-6 sm:mt-8 max-w-3xl leading-relaxed"
          >
            India's campus venture studio network - turning students into funded founders, one cohort at a time.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 1.65 }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none"
          >
            <Link to="/programs" className="inline-flex items-center justify-center gap-2 bg-accent text-white font-bold text-sm md:text-base px-6 sm:px-7 py-3.5 rounded-full hover:opacity-90 transition shadow-[0_10px_30px_-10px_rgba(255,92,0,0.5)]">
              Explore the Ecosystem →
            </Link>
            <Link to="/venture-studio" className="inline-flex items-center justify-center gap-2 border border-outline-variant bg-surface text-on-surface font-bold text-sm md:text-base px-6 sm:px-7 py-3.5 rounded-full hover:border-accent hover:text-accent transition">
              Venture Studio
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


function AnimatedStat({ value, suffix, label, sublabel, delay, prefix = '' }: {
  value: number; suffix: string; label: string; sublabel: string; delay: number; prefix?: string;
}) {
  const [count, setCount] = React.useState(0);
  const startedRef = React.useRef(false);

  const startCountUp = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    
    setTimeout(() => {
      let startTime: number | null = null;
      const duration = 2500;
      let active = true;
      let animationFrameId: number;

      const animate = (timestamp: number) => {
        if (!active) return;
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.floor(easeProgress * value);
        setCount(currentVal);
        
        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
          setCount(value);
        }
      };
      
      animationFrameId = requestAnimationFrame(animate);
      return () => {
        active = false;
        cancelAnimationFrame(animationFrameId);
      };
    }, delay * 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
      onViewportEnter={startCountUp}
      style={{ willChange: "transform, opacity" }}
      className="flex flex-col items-center text-center px-6 py-7"
    >
      <span className="text-[38px] md:text-[48px] font-extrabold tracking-tight text-white leading-none">
        {prefix}{count}{suffix}
      </span>
      <span className="font-semibold text-[13px] text-white mt-1">{label}</span>
      <span className="text-[11px] text-white/60 mt-0.5">{sublabel}</span>
    </motion.div>
  );
}

function Stats() {
  return (
    <div className="w-full bg-black border-y border-neutral-900 overflow-hidden">
      {/* Mobile: horizontal scroll ticker */}
      <div className="flex md:hidden overflow-x-auto scrollbar-hide divide-x divide-white/10 bg-black">
        {[
          { value: 600, suffix: '+', label: 'Students Trained', sublabel: 'per campus annually', prefix: '' },
          { value: 150, suffix: '+', label: 'MVPs Built', sublabel: 'shipped in 8 weeks', prefix: '' },
          { value: 5, suffix: 'L', label: 'Fellowship Funding', sublabel: 'per selected founder', prefix: '₹' },
          { value: 1, suffix: 'Cr+', label: 'Accelerator Funding', sublabel: 'for the best teams', prefix: '₹' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
            style={{ willChange: "transform, opacity" }}
            className="flex flex-col items-center text-center px-8 py-5 min-w-[160px] flex-shrink-0"
          >
            <span className="text-[32px] font-extrabold tracking-tight text-white leading-none">
              {s.prefix || ''}{s.value}{s.suffix}
            </span>
            <span className="font-semibold text-[12px] text-white mt-1">{s.label}</span>
            <span className="text-[11px] text-white/60 mt-0.5">{s.sublabel}</span>
          </motion.div>
        ))}
      </div>

      {/* Desktop: animated count-up grid */}
      <div className="hidden md:grid grid-cols-4 divide-x divide-white/10 max-w-[1200px] mx-auto">
        <AnimatedStat value={600} suffix="+" label="Students Trained" sublabel="per campus annually" delay={0} />
        <AnimatedStat value={150} suffix="+" label="MVPs Built" sublabel="shipped in 8 weeks" delay={0.1} />
        <AnimatedStat value={5} suffix="L" prefix="₹" label="Fellowship Funding" sublabel="per selected founder" delay={0.2} />
        <AnimatedStat value={1} suffix="Cr+" prefix="₹" label="Accelerator Funding" sublabel="for the best teams" delay={0.3} />
      </div>
    </div>
  );
}


function Ecosystem() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-20">
      <AnimateIn className="text-center">
        <p className="font-mono-label text-accent text-xs tracking-widest uppercase mb-3">THE ECOSYSTEM</p>
        <h2 className="text-[28px] md:text-[40px] font-extrabold tracking-tight mb-3">A Complete Founder Pipeline</h2>
        <p className="text-on-surface-variant max-w-xl mx-auto mb-16">From campus to capital, every stage structured, every founder supported.</p>
      </AnimateIn>

      {/* Programs in a beautiful 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {[
          {
            num: '01', name: 'Genesis', tag: null,
            desc: 'The foundational layer of Beacon Indica, embedded within universities and colleges. A high-performance environment where students explore, build, and validate startup ideas alongside their academic journey.',
            bullets: ['Structured startup environment', 'Problem identification & validation', 'Mentors & peer builders', 'Idea development & experimentation'],
            cta: 'Apply to Genesis', href: '/programs#genesis',
          },
          {
            num: '02', name: 'Fellowship', tag: 'INVITE ONLY',
            desc: 'For founders with strong intent and early execution. The focus shifts from exploration to building investable companies.',
            bullets: ['Up to ₹5 Lakhs funding', 'MVP & technical support', 'Marketing & GTM strategy', 'Legal & compliance support'],
            cta: 'Apply to Fellowship', href: '/programs#fellowship',
          },
          {
            num: '03', name: 'Accelerator', tag: null,
            desc: 'For startups ready to scale and raise capital. Focus on growth, positioning, and investor readiness.',
            bullets: ['Curated investor network', 'Fundraising support', 'Business scaling frameworks', 'Strategic partnerships'],
            cta: 'Apply to Accelerator', href: '/programs#accelerator',
          },
        ].map((item, i) => (
          <AnimateIn key={item.num} delay={i * 0.12} className="w-full">
            <motion.div
              whileHover={{ y: -6, boxShadow: '0 20px 48px rgba(0,0,0,0.12)' }}
              transition={{ duration: 0.2 }}
              style={{ willChange: "transform" }}
              className="bg-surface-container border border-outline-variant rounded-2xl p-7 h-full flex flex-col justify-between"
            >
              <div>
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
              </div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{ display: "inline-block", willChange: "transform" }}
                className="mt-auto pt-4"
              >
                <Link to={item.href} className="inline-flex items-center gap-2 bg-accent text-white font-bold text-sm px-5 py-2.5 rounded-full hover:opacity-90 transition w-full justify-center">
                  {item.cta} →
                </Link>
              </motion.div>
            </motion.div>
          </AnimateIn>
        ))}
      </div>

      {/* Bottom CTA */}
      <AnimateIn className="text-center mt-16">
        <p className="text-on-surface-variant text-sm mb-4">Want to bring these programs to your campus?</p>
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{ display: "inline-block", willChange: "transform" }}
        >
          <Link to="/contact" className="inline-flex items-center gap-2 border border-accent text-accent font-bold text-sm px-6 py-3 rounded-full hover:bg-accent hover:text-white transition">
            Talk to Us →
          </Link>
        </motion.div>
      </AnimateIn>
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
        <AnimateIn className="md:col-span-4 mb-8 md:mb-0">
          <span className="font-mono-label text-accent">Active Venture Studios</span>
          <h2 className="text-[32px] md:text-[48px] leading-tight font-bold mt-4 mb-6 tracking-[-0.02em]">
            Student-Led Innovation Hubs
          </h2>
          <p className="text-on-surface-variant mb-8">
            Each Beacon studio is operated by a 10-person student leadership team
            on the ground.
          </p>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{ display: "inline-block", willChange: "transform" }}
          >
            <Link
              to="/venture-studio"
              className="font-bold border-b-2 border-primary pb-1 hover:text-accent hover:border-accent transition-colors"
            >
              Browse Studio Locations
            </Link>
          </motion.div>
        </AnimateIn>
        <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-4">
          {STUDIO_IMAGES.map((src, i) => (
            <AnimateIn
              key={i}
              delay={i * 0.08}
              className="overflow-hidden rounded-xl w-full h-48"
            >
              <motion.img
                src={src}
                alt="Campus studio"
                loading="lazy"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
                style={{ willChange: "transform" }}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer"
              />
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}


function PartnerCTA() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-20">
      <AnimateIn>
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
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{ willChange: "transform" }}
          >
            <Link
              to="/contact"
              className="bg-primary text-primary-foreground font-bold px-10 py-5 rounded-md text-lg whitespace-nowrap hover:bg-primary/90 transition-colors block"
            >
              Partner With Us
            </Link>
          </motion.div>
        </div>
      </AnimateIn>
    </section>
  );
}

const FAQS = [
  { q: "What is Beacon Indica?", a: "Beacon Indica is an entrepreneurial launchpad that empowers students and emerging founders to transform raw ideas into scalable, venture-backed companies" },
  { q: "Who can join Genesis?", a: "Any college student, no prior startup experience needed. If you have ambition and are willing to execute, Genesis is built for you." },
  { q: "Is Genesis paid or free?", a: "Genesis is a paid program. We provide mentorship from people that have actually built something with hands on exprerience , think of it as not only a paid programee but as an investment for your future" },
  { q: "How does a college partner with Beacon Indica?", a: "Fill the inquiry form on our Venture Studio page or email partnerships@beaconindica.com. We handle everything: program, mentors, and resources. Zero cost to the institution." },
  { q: "What do Fellows receive?", a: "Selected Fellows receive up to ₹5 Lakhs in funding, MVP support, marketing and GTM guidance, legal help, and hands-on mentorship from founders and operators." },
  { q: "How is Beacon Indica different from a college E-Cell?", a: "E-Cells run events. Beacon Indica runs a structured execution pipeline. Every cohort ends with a working MVP, real users, and investor exposure at Demo Day." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-20">
      <AnimateIn>
        <p className="font-mono-label text-accent text-xs tracking-widest uppercase mb-3">FAQ</p>
        <h2 className="text-[28px] md:text-[40px] font-extrabold tracking-tight mb-10">Frequently Asked Questions</h2>
      </AnimateIn>
      <AnimateIn delay={0.1}>
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
      </AnimateIn>
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
  return (
    <>
      {/* All page content */}
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
