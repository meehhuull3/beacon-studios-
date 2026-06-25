import { useEffect, useRef } from "react";
import gsap from "gsap";

export interface MasonryItem {
  id: string;
  img: string;
  height: number;
  title: string;
}

interface MasonryGalleryProps {
  items: MasonryItem[];
  animateFrom?: "bottom" | "top" | "left" | "right";
  blurToFocus?: boolean;
  stagger?: number;
  scaleOnHover?: boolean;
  hoverScale?: number;
  colorShiftOnHover?: boolean;
}

export function MasonryGallery({
  items,
  animateFrom = "bottom",
  blurToFocus = true,
  stagger = 0.08,
  scaleOnHover = true,
  hoverScale = 0.96,
  colorShiftOnHover = true,
}: MasonryGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollVelocityRef = useRef(0);
  const lastScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
  const lastScrollTime = useRef(Date.now());

  // Scroll velocity tracker
  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      const deltaY = Math.abs(window.scrollY - lastScrollY.current);
      const deltaT = now - lastScrollTime.current || 1;
      scrollVelocityRef.current = deltaY / deltaT; // px per ms
      lastScrollY.current = window.scrollY;
      lastScrollTime.current = now;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Entrance animation
  useEffect(() => {
    if (!containerRef.current) return;

    const els = itemRefs.current.filter(Boolean) as HTMLDivElement[];

    const fromVars: gsap.TweenVars = {
      opacity: 0,
      filter: blurToFocus ? "blur(12px)" : "none",
      ...(animateFrom === "bottom" && { y: 48 }),
      ...(animateFrom === "top" && { y: -48 }),
      ...(animateFrom === "left" && { x: -48 }),
      ...(animateFrom === "right" && { x: 48 }),
    };

    const velocity = scrollVelocityRef.current;
    // Fast scroll (velocity > 2) = duration 0.3, slow scroll = duration 1.2, clamped between
    const dynamicDuration = Math.max(0.3, Math.min(1.2, 1.2 - velocity * 0.3));

    gsap.fromTo(els, fromVars, {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      x: 0,
      duration: dynamicDuration,
      ease: "power3.out",
      stagger: {
        each: Math.max(0.02, stagger - velocity * 0.01),
      },
    });

    return () => {
      gsap.killTweensOf(els);
    };
  }, [items, animateFrom, blurToFocus, stagger]);

  // Hover handlers
  const handleMouseEnter = (el: HTMLDivElement | null) => {
    if (!el) return;
    const tl = gsap.timeline();
    if (scaleOnHover) {
      tl.to(el, { scale: hoverScale, duration: 0.25, ease: "power2.out" }, 0);
    }
    if (colorShiftOnHover) {
      tl.to(
        el.querySelector(".masonry-overlay"),
        { opacity: 1, duration: 0.25 },
        0,
      );
    }
  };

  const handleMouseLeave = (el: HTMLDivElement | null) => {
    if (!el) return;
    const tl = gsap.timeline();
    if (scaleOnHover) {
      tl.to(el, { scale: 1, duration: 0.3, ease: "power2.inOut" }, 0);
    }
    if (colorShiftOnHover) {
      tl.to(
        el.querySelector(".masonry-overlay"),
        { opacity: 0, duration: 0.3 },
        0,
      );
    }
  };

  // Simple responsive column count
  const colCount =
    typeof window !== "undefined"
      ? window.innerWidth >= 1024
        ? 4
        : window.innerWidth >= 768
          ? 3
          : 2
      : 4;

  // Distribute items across columns
  const columns: MasonryItem[][] = Array.from({ length: colCount }, () => []);
  items.forEach((item, i) => {
    columns[i % colCount].push(item);
  });

  let globalIdx = 0;

  return (
    <div
      ref={containerRef}
      className="flex gap-4 w-full items-start"
      style={{ alignItems: "flex-start" }}
    >
      {columns.map((col, colIdx) => (
        <div
          key={colIdx}
          className="flex flex-col gap-4"
          style={{ flex: "1 1 0%", minWidth: 0 }}
        >
          {col.map((item) => {
            const idx = globalIdx++;
            return (
              <div
                key={item.id}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                className="relative rounded-xl overflow-hidden cursor-pointer"
                style={{ height: item.height }}
                onMouseEnter={() => handleMouseEnter(itemRefs.current[idx])}
                onMouseLeave={() => handleMouseLeave(itemRefs.current[idx])}
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
                {/* Overlay */}
                <div
                  className="masonry-overlay absolute inset-0 flex items-end p-4 pointer-events-none"
                  style={{
                    opacity: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)",
                  }}
                >
                  <span className="text-white text-sm font-semibold tracking-wide drop-shadow">
                    {item.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
