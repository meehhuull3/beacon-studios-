import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/advisory-board")({
  component: AdvisoryBoardPage,
  head: () => ({
    meta: [
      { title: "Board of Advisors | Beacon Indica" },
      {
        name: "description",
        content: "Detailed biographies of the operators, founders, and investors guiding the Beacon Indica ecosystem.",
      },
      { property: "og:title", content: "Board of Advisors | Beacon Indica" },
      { property: "og:description", content: "Detailed biographies of the operators, founders, and investors guiding the Beacon Indica ecosystem." },
      { property: "og:url", content: "https://beaconindica.com/advisory-board" },
    ],
    links: [{ rel: "canonical", href: "https://beaconindica.com/advisory-board" }],
  }),
});

interface Advisor {
  name: string;
  title: string;
  photo: string;
  bio: string;
  tags: string[];
}

const advisors: Advisor[] = [
  {
    name: "Aurbind Sharma",
    title: "Serial Entrepreneur & Investor",
    photo: "https://i.ibb.co/gbQJ1xv7/Aurbind-Corporate.png",
    bio: "Aurbind Sharma is a highly accomplished serial entrepreneur and early-stage investor with a proven track record of building and scaling high-growth technology companies across multiple continents.\n\nHe founded SEND App, an innovative 10-minute grocery delivery startup in Australia, raising approximately $23 million at a time when delivery platforms like Blinkit and Zepto were still operating in single cities within India. This venture proved his exceptional capabilities in fundraising, logistics, high-velocity hiring, and operational scaling in complex environments.\n\nPrior to SEND, Aurbind founded VAttendance, India's first mobile-based attendance platform, breaking new ground in cloud enterprise productivity. Currently, he is actively building Rentfree and Freehold to disrupt the Australian Proptech market, leveraging technology to democratize property transactions and leasing.\n\nAs an advisory board member, Aurbind brings invaluable, direct pattern recognition to young founders navigating product-market fit, international expansion, high-scale engineering operations, and institutional fundraising rounds.",
    tags: ["Proptech", "Consumer Apps", "Fundraising", "Australia"],
  },
  {
    name: "Amit Kumar Pandey",
    title: "CTO, Jellyfish Technologies",
    photo: "https://i.ibb.co/5W8cPmqX/oo.jpg",
    bio: "Amit Kumar Pandey is a distinguished technology executive, engineering leader, and systems architect with over two decades of hands-on experience designing, scaling, and managing large-scale software platforms.\n\nCurrently serving as the Chief Technology Officer at Jellyfish Technologies, Amit directs global engineering teams, oversees cross-platform development operations, and drives cutting-edge research in cloud architectures, AI integration, and blockchain technologies.\n\nOver the course of his illustrious career, he has served as a key engineering advisor for numerous startup accelerators, growth-stage ventures, and enterprises — helping companies build robust engineering cultures, scale their product velocity, and execute high-fidelity technology roadmaps.\n\nAmit's advisory role at Beacon Indica is centered around guiding student founders through hard technical design choices, engineering recruitment, technology scoping, and transforming raw product concepts into enterprise-grade software architectures.",
    tags: ["Engineering", "Product", "Tech Leadership", "System Architecture"],
  },
];

function AdvisoryBoardPage() {
  useEffect(() => {
    const handleScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = decodeURIComponent(hash.replace("#", ""));
        const element = document.getElementById(id);
        if (element) {
          const scrollToElement = () => {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          };
          
          // Trigger scroll immediately and after a short delay to account for dynamic React layouts
          scrollToElement();
          setTimeout(scrollToElement, 150);
          setTimeout(scrollToElement, 400);

          // Highlight the scrolled element temporarily
          element.classList.add("ring-2", "ring-accent/30", "ring-offset-8", "rounded-2xl");
          setTimeout(() => {
            element.classList.remove("ring-2", "ring-accent/30", "ring-offset-8", "rounded-2xl");
          }, 2500);
        }
      }
    };

    handleScroll();
    window.addEventListener("hashchange", handleScroll);
    return () => window.removeEventListener("hashchange", handleScroll);
  }, []);

  return (
    <section className="bg-surface py-20 md:py-28 overflow-hidden min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        
        {/* Navigation & Header */}
        <div className="mb-16">
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-accent transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to About
          </Link>
          <AnimateIn>
            <span className="font-mono-label text-accent block">— GUIDANCE & LEADERSHIP —</span>
            <h1 className="text-[36px] md:text-[56px] font-extrabold tracking-[-0.03em] mt-4">
              Board of Advisors
            </h1>
            <p className="text-lg text-on-surface-variant mt-4 max-w-2xl">
              Meet the builders, engineers, and visionaries guiding our student founders from product validation to institutional venture capital.
            </p>
          </AnimateIn>
        </div>

        {/* Profiles List */}
        <div className="space-y-24 md:space-y-32">
          {advisors.map((advisor, index) => {
            const slug = advisor.name.toLowerCase().replace(/\s+/g, "-");
            return (
              <AnimateIn
                key={advisor.name}
                id={slug}
                delay={index * 0.1}
                className="scroll-mt-24 flex flex-col md:flex-row gap-10 md:gap-16 items-start py-12 border-b border-outline-variant/60 last:border-b-0 transition-all duration-500"
              >
                {/* LEFT Side: Image, Name, Title */}
                <div className="w-full md:w-[280px] shrink-0 flex flex-col items-center text-center">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    style={{ willChange: "transform" }}
                    className="w-[280px] h-[340px] rounded-2xl overflow-hidden shadow-md bg-surface-container flex items-center justify-center relative shrink-0"
                  >
                    {advisor.photo ? (
                      <img
                        src={advisor.photo}
                        alt={advisor.name}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <span className="w-20 h-20 bg-accent/15 flex items-center justify-center rounded-full">
                        <span className="text-accent text-4xl font-bold">
                          {advisor.name.charAt(0)}
                        </span>
                      </span>
                    )}
                  </motion.div>
                  <div className="mt-6">
                    <h2 className="text-2xl font-extrabold text-primary tracking-tight">{advisor.name}</h2>
                    <p className="text-[11px] font-mono-label text-accent font-bold tracking-wider uppercase mt-1.5">{advisor.title}</p>
                  </div>
                </div>

                {/* RIGHT Side: Biography & Domain Tags */}
                <div className="flex-1 w-full md:mt-2">
                  <span className="font-mono-label text-on-surface-variant/50 text-[10px] block mb-4">▲ BOARD OF ADVISORS PROFILE</span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight mb-6">Detailed Biography</h3>
                  <p className="text-[15px] md:text-base text-on-surface-variant leading-[28px] whitespace-pre-line">
                    {advisor.bio}
                  </p>
                  
                  {/* Domain tags */}
                  <div className="flex flex-wrap gap-2 mt-8">
                    {advisor.tags.map(tag => (
                      <span key={tag} className="text-[11px] font-mono-label bg-accent/8 text-accent px-2.5 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </AnimateIn>
            );
          })}
        </div>

      </div>
    </section>
  );
}
