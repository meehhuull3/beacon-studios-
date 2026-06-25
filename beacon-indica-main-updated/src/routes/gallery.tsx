import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { MasonryGallery } from '@/components/MasonryGallery';

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
      { property: "og:url", content: "https://beacon-indica.lovable.app/gallery" },
    ],
    links: [{ rel: "canonical", href: "https://beacon-indica.lovable.app/gallery" }],
  }),
});

type Photo = { category: string; ratio: string };

const photos: Photo[] = [
  { category: "Campus Events", ratio: "aspect-[4/3]" },
  { category: "Founder Sessions", ratio: "aspect-square" },
  { category: "Office", ratio: "aspect-[3/4]" },
  { category: "Campus Events", ratio: "aspect-[16/9]" },
  { category: "Demo Days", ratio: "aspect-square" },
  { category: "Founder Sessions", ratio: "aspect-[4/3]" },
  { category: "Office", ratio: "aspect-square" },
  { category: "Campus Events", ratio: "aspect-[3/4]" },
  { category: "Founder Sessions", ratio: "aspect-[16/9]" },
  { category: "Office", ratio: "aspect-[4/3]" },
  { category: "Campus Events", ratio: "aspect-square" },
  { category: "Demo Days", ratio: "aspect-[3/4]" },
];

const tabs = ["All", "Campus Events", "Founder Sessions", "Office", "Demo Days"] as const;

function GalleryPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const filtered = photos.filter((p) => tab === "All" || p.category === tab);

  return (
    <section className="bg-surface py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <span className="font-mono-label text-accent">Gallery</span>
        <h1 className="text-[36px] md:text-[56px] font-extrabold tracking-[-0.03em] mt-4">
          Moments from the Studio
        </h1>
        <p className="text-lg text-on-surface-variant mt-4 max-w-2xl">
          A look inside Beacon Indica — campus events, founder sessions, and the
          work in progress.
        </p>

        <div className="bg-accent/10 border border-accent/30 rounded-xl px-6 py-4 mb-10 text-sm text-on-surface-variant">
          📸 Gallery coming soon — real photos from Genesis cohorts, Demo Days, and campus events will be added here.
        </div>

        <div className="flex flex-wrap gap-3 mt-10">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                t === tab
                  ? "bg-accent text-accent-foreground rounded-full px-5 py-2 text-sm font-semibold"
                  : "border border-outline-variant rounded-full px-5 py-2 text-sm text-on-surface-variant hover:border-accent"
              }
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-10">
          <MasonryGallery
            items={filtered.map((p, i) => ({
              id: String(i),
              img: `https://picsum.photos/seed/${p.category.replace(' ', '')}${i}/600/400`,
              height: i % 3 === 0 ? 400 : i % 3 === 1 ? 280 : 500,
              title: p.category,
            }))}
            animateFrom="bottom"
            blurToFocus={true}
            stagger={0.08}
            scaleOnHover={true}
            hoverScale={0.96}
            colorShiftOnHover={true}
          />
        </div>

        <p className="text-on-surface-variant text-sm text-center mt-8 italic">
          Real photos coming soon. These are placeholder images for layout purposes only.
        </p>
      </div>

      {openIdx !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setOpenIdx(null)}
        >
          <button
            className="absolute top-6 right-6 text-white"
            onClick={() => setOpenIdx(null)}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            className="absolute left-6 text-white"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIdx((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length));
            }}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <div
            className="max-w-4xl w-full aspect-video rounded-xl bg-gradient-to-br from-surface-container to-surface-container-high flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-mono-label text-on-surface-variant">
              {filtered[openIdx]?.category}
            </span>
          </div>
          <button
            className="absolute right-6 text-white"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIdx((i) => (i === null ? null : (i + 1) % filtered.length));
            }}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}
    </section>
  );
}