import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimateIn } from "@/components/ui/AnimateIn";

export const Route = createFileRoute("/gallery")({
  component: GalleryPage,
  head: () => ({
    meta: [
      { title: "Gallery | Beacon Indica" },
      {
        name: "description",
        content:
          "Moments from inside Beacon Indica — campus events, founder sessions, and work in progress.",
      },
      { property: "og:title", content: "Gallery | Beacon Indica" },
      { property: "og:description", content: "Moments from inside Beacon Indica — campus events, founder sessions, and work in progress." },
      { property: "og:url", content: "https://beaconindica.com/gallery" },
    ],
    links: [{ rel: "canonical", href: "https://beaconindica.com/gallery" }],
  }),
});

interface Photo {
  id: string;
  src: string;
  alt: string;
  category: "Campus Events" | "Founder Sessions" | "Office" | "Demo Days";
}

const photos: Photo[] = [
  // Campus Events (6)
  {
    id: "campus-1",
    src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    alt: "Students attending campus event presentation",
    category: "Campus Events",
  },
  {
    id: "campus-2",
    src: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80",
    alt: "Student pitching startup idea in auditorium",
    category: "Campus Events",
  },
  {
    id: "campus-3",
    src: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
    alt: "Ecosystem launch key speakers on stage",
    category: "Campus Events",
  },
  {
    id: "campus-4",
    src: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
    alt: "Campus hackathon dynamic group work",
    category: "Campus Events",
  },
  {
    id: "campus-5",
    src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
    alt: "Audience watching demo presentation at college",
    category: "Campus Events",
  },
  {
    id: "campus-6",
    src: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
    alt: "Q&A panel session at campus studio hall",
    category: "Campus Events",
  },
  // Founder Sessions (5)
  {
    id: "founder-1",
    src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    alt: "Mentorship session with early stage founders",
    category: "Founder Sessions",
  },
  {
    id: "founder-2",
    src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
    alt: "Collaborative whiteboard brainstorm session",
    category: "Founder Sessions",
  },
  {
    id: "founder-3",
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    alt: "Student startup team coding prototype in lab",
    category: "Founder Sessions",
  },
  {
    id: "founder-4",
    src: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80",
    alt: "Pitch deck feedback presentation with mentors",
    category: "Founder Sessions",
  },
  {
    id: "founder-5",
    src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
    alt: "Founders reviewing business model canvas map",
    category: "Founder Sessions",
  },
  // Office (5)
  {
    id: "office-1",
    src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    alt: "Beacon Indica co-working studio open space",
    category: "Office",
  },
  {
    id: "office-2",
    src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80",
    alt: "Co-working lounge area for student builder teams",
    category: "Office",
  },
  {
    id: "office-3",
    src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
    alt: "Workspace desks with developers coding actively",
    category: "Office",
  },
  {
    id: "office-4",
    src: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&q=80",
    alt: "Creative brainstorming studio hub workstation",
    category: "Office",
  },
  {
    id: "office-5",
    src: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=800&q=80",
    alt: "Meeting room with founder-mentor strategy session",
    category: "Office",
  },
  // Demo Days (4)
  {
    id: "demoday-1",
    src: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=800&q=80",
    alt: "Founder presenting startup on Demo Day stage",
    category: "Demo Days",
  },
  {
    id: "demoday-2",
    src: "https://images.unsplash.com/photo-1560439514-4e9645039924?w=800&q=80",
    alt: "Pitch presentation main stage and auditorium screen",
    category: "Demo Days",
  },
  {
    id: "demoday-3",
    src: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
    alt: "Investor panel evaluating live startup pitches",
    category: "Demo Days",
  },
  {
    id: "demoday-4",
    src: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80",
    alt: "Networking arena after Demo Day pitch sessions",
    category: "Demo Days",
  },
];

const tabs = ["All", "Campus Events", "Founder Sessions", "Office", "Demo Days"] as const;

function GalleryPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const filtered = photos.filter((p) => tab === "All" || p.category === tab);

  return (
    <section className="bg-surface py-20 md:py-28 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <AnimateIn>
          <span className="font-mono-label text-accent">Gallery</span>
          <h1 className="text-[36px] md:text-[56px] font-extrabold tracking-[-0.03em] mt-4">
            Moments from the Studio
          </h1>
          <p className="text-lg text-on-surface-variant mt-4 max-w-2xl">
            A look inside Beacon Indica — campus events, founder sessions, and the
            work in progress.
          </p>
        </AnimateIn>

        {/* Filtering Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ willChange: "transform, opacity" }}
          className="flex flex-wrap gap-3 mt-10"
        >
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                t === tab
                  ? "bg-accent text-white rounded-full px-5 py-2.5 text-sm font-semibold shadow-md cursor-pointer transition-all duration-300"
                  : "border border-neutral-300 text-neutral-500 hover:border-accent hover:text-accent rounded-full px-5 py-2.5 text-sm cursor-pointer transition-all duration-300"
              }
            >
              {t}
            </button>
          ))}
        </motion.div>

        {/* CSS Masonry Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 mt-10">
          {filtered.map((p, index) => (
            <AnimateIn
              key={p.id}
              delay={index * 0.05}
              className="relative mb-4 break-inside-avoid rounded-xl overflow-hidden cursor-pointer group"
            >
              <div onClick={() => setOpenIdx(index)}>
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  className="w-full object-cover rounded-xl transition-all duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-white font-bold text-xs tracking-wider uppercase px-3 py-1.5 border border-white/20 rounded backdrop-blur-sm bg-white/10">
                    {p.category}
                  </span>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>

        {/* Footer Note */}
        <AnimateIn className="text-center mt-8">
          <p className="text-sm text-neutral-400 italic">
            Real photos from Beacon Indica events and offices will replace these shortly.
          </p>
        </AnimateIn>
      </div>

      {/* Lightbox overlay */}
      <AnimatePresence>
        {openIdx !== null && filtered[openIdx] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 md:p-8 select-none"
            onClick={() => setOpenIdx(null)}
          >
            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="absolute top-6 right-6 text-white hover:text-accent transition duration-200 cursor-pointer p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10"
              onClick={() => setOpenIdx(null)}
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </motion.button>

            {/* Prev button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="absolute left-4 md:left-8 text-white hover:text-accent transition duration-200 cursor-pointer p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIdx((openIdx - 1 + filtered.length) % filtered.length);
              }}
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </motion.button>

            {/* Main Image Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ willChange: "transform, opacity" }}
              className="max-w-4xl max-h-[80vh] w-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={filtered[openIdx].src}
                alt={filtered[openIdx].alt}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
              />
              <div className="mt-4 text-center max-w-lg">
                <span className="font-mono-label text-accent text-xs tracking-widest uppercase">
                  {filtered[openIdx].category}
                </span>
                <p className="text-white text-sm md:text-base mt-2 font-medium leading-relaxed">
                  {filtered[openIdx].alt}
                </p>
              </div>
            </motion.div>

            {/* Next button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="absolute right-4 md:right-8 text-white hover:text-accent transition duration-200 cursor-pointer p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIdx((openIdx + 1) % filtered.length);
              }}
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}