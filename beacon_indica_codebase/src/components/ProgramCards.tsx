import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.07'/%3E%3C/svg%3E")`;

const CARDS = [
  {
    name: 'Genesis',
    desc: 'A pre-idea program for first-time builders. Learn to find problems worth solving, validate fast, and build your first product from scratch.',
    btn: 'Apply Now',
    to: '/programs#genesis',
    color: '#2E7D32',
    num: '01',
  },
  {
    name: 'Fellowship',
    desc: 'A semester-long immersive for committed student founders. Get mentorship, a founding team, and your first paying customer.',
    btn: 'Apply Now',
    to: '/programs#fellowship',
    color: '#B71C1C',
    num: '02',
  },
  {
    name: 'Accelerator',
    desc: 'For post-revenue startups ready to scale. Structured sprints, investor access, and a network that opens real doors.',
    btn: 'Apply Now',
    to: '/programs#accelerator',
    color: '#1A237E',
    num: '03',
  },
  {
    name: 'Venture Studio',
    desc: 'We co-build companies from the ground up with exceptional founders. Shared equity, shared risk, full institutional support.',
    btn: 'Learn More',
    to: '/venture-studio',
    color: '#F57F17',
    num: '04',
  },
];

type CardState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  homeX: number;
  homeY: number;
  isThrown: boolean;
};

const FRICTION = 0.88;
const RETURN_SPRING = 0.08;   // Slightly stronger spring for rubber band snap
const RETURN_DAMPING = 0.65;  // Lower damping = more bouncy/shaky oscillation
const MAX_THROW_DISTANCE = 120;
const MIN_CURSOR_SPEED = 2;

export function ProgramCards() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Cards start invisible and below
    cardRefs.current.forEach(ref => {
      if (ref) {
        ref.style.opacity = "0";
        ref.style.transform = "translate(0px, 120px)";
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Fire staggered slide-up for each card
            cardRefs.current.forEach((ref, i) => {
              if (!ref) return;
              setTimeout(() => {
                ref.style.transition =
                  "transform 900ms cubic-bezier(0.16, 1, 0.3, 1), opacity 700ms ease";
                ref.style.opacity = "1";
                ref.style.transform = "translate(0px, 0px)";
              }, i * 130);
            });

            // After all cards have arrived, hand control to physics
            setTimeout(() => {
              setAnimationComplete(true);
              cardRefs.current.forEach(ref => {
                if (ref) {
                  ref.style.transition = "none";
                }
              });
            }, cardRefs.current.length * 130 + 950);

            observer.disconnect(); // only trigger once
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!animationComplete) return;

    // Only run physics on non-touch devices
    const isTouchDevice = window.matchMedia("(hover: none)").matches;
    if (isTouchDevice) return;

    let rafId: number;
    let prevMouseX = 0;
    let prevMouseY = 0;
    const states: CardState[] = CARDS.map(() => ({ 
      x: 0, y: 0, vx: 0, vy: 0, angle: 0, vAngle: 0, homeX: 0, homeY: 0, isThrown: false 
    }));

    const onMouseMove = (e: MouseEvent) => {
      const dvx = e.clientX - prevMouseX;
      const dvy = e.clientY - prevMouseY;
      const speed = Math.sqrt(dvx * dvx + dvy * dvy);

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      if (speed < MIN_CURSOR_SPEED) return;

      cardRefs.current.forEach((ref, i) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        
        const hitting = (
          e.clientX >= rect.left - 10 &&
          e.clientX <= rect.right + 10 &&
          e.clientY >= rect.top - 10 &&
          e.clientY <= rect.bottom + 10
        );

        if (hitting) {
          const throwScale = Math.min(speed / 8, 3.5);
          states[i].vx += dvx * throwScale * 0.6;
          states[i].vy += dvy * throwScale * 0.6;
          // Add rotational spin based on horizontal cursor movement (reduced for smooth wobble)
          states[i].vAngle += dvx * throwScale * 0.025;
          if (states[i].vAngle > 12) states[i].vAngle = 12;
          if (states[i].vAngle < -12) states[i].vAngle = -12;
          states[i].isThrown = true;
        }
      });
    };

    const tick = () => {
      states.forEach((state, i) => {
        const cardEl = cardRefs.current[i];
        if (!cardEl) return;

        if (!state.isThrown && Math.abs(state.x) < 0.3 && Math.abs(state.y) < 0.3 && Math.abs(state.angle) < 0.3) {
          state.x = 0;
          state.y = 0;
          state.angle = 0;
          cardEl.style.transform = "translate(0px, 0px) rotate(0deg)";
          return;
        }

        if (state.isThrown) {
          state.vx *= FRICTION;
          state.vy *= FRICTION;
          state.vAngle *= FRICTION;

          state.x += state.vx;
          state.y += state.vy;
          state.angle += state.vAngle;

          const dist = Math.sqrt(state.x * state.x + state.y * state.y);
          if (dist > MAX_THROW_DISTANCE) {
            state.x = (state.x / dist) * MAX_THROW_DISTANCE;
            state.y = (state.y / dist) * MAX_THROW_DISTANCE;
            state.vx *= 0.3;
            state.vy *= 0.3;
          }

          if (Math.abs(state.vx) < 0.4 && Math.abs(state.vy) < 0.4 && Math.abs(state.vAngle) < 0.4) {
            state.isThrown = false;
          }
        } else {
          const fx = -RETURN_SPRING * state.x;
          const fy = -RETURN_SPRING * state.y;
          const fAngle = -RETURN_SPRING * state.angle;
          
          state.vx = state.vx * RETURN_DAMPING + fx;
          state.vy = state.vy * RETURN_DAMPING + fy;
          state.vAngle = state.vAngle * RETURN_DAMPING + fAngle;
          
          state.x += state.vx;
          state.y += state.vy;
          state.angle += state.vAngle;
        }

        cardEl.style.transform = `translate(${state.x}px, ${state.y}px) rotate(${state.angle}deg)`;
      });
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMouseMove);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [animationComplete]);

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 flex flex-col items-center overflow-hidden w-full"
      style={{ background: 'transparent' }}
    >
      <p
        className="font-mono-label text-xs tracking-[0.25em] uppercase mb-12 md:mb-16"
        style={{ color: 'var(--on-surface-variant)' }}
      >
        ◆ WHAT WE BUILD ◆
      </p>

      {/* Cards container */}
      <div 
        className="flex flex-col md:flex-row items-stretch justify-center gap-6 px-5 md:px-12 py-10 w-full max-w-[1400px]"
      >
        {CARDS.map((card, i) => (
          <div
            key={card.name}
            ref={el => { cardRefs.current[i] = el; }}
            className="flex flex-col relative w-full md:w-[300px]"
            style={{
              backgroundColor: '#f5f2ec',
              backgroundImage: GRAIN_SVG,
              borderRadius: '20px',
              border: `2px solid ${card.color}`,
              padding: '28px 24px 28px',
              cursor: 'pointer',
              transform: 'translate(0px, 0px)',
              willChange: 'transform',
            }}
          >
            {/* Top-left logo mark */}
            <div className="absolute top-4 left-5 flex items-center gap-[6px]">
              <span
                className="inline-block w-3.5 h-3.5"
                style={{
                  backgroundColor: '#0B8B8B',
                  clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                }}
              />
              <span className="text-[9px] font-[800] tracking-[0.12em] text-[#0B8B8B] font-mono uppercase">
                Beacon
              </span>
            </div>

            {/* Card number */}
            <span
              className="absolute top-3.5 right-4 text-[11px] font-bold tracking-[0.1em] font-mono opacity-70"
              style={{ color: card.color }}
            >
              {card.num}
            </span>

            {/* Decorative top rule */}
            <hr
              style={{
                width: '40px',
                height: '3px',
                backgroundColor: card.color,
                borderRadius: '2px',
                marginTop: '36px',
                marginBottom: '24px',
                border: 'none',
              }}
            />

            {/* Program name */}
            <h3
              className="text-[22px] font-black tracking-[-0.02em] uppercase text-center leading-[1.1] mb-4 font-sans"
              style={{ color: '#1A1A1A' }}
            >
              {card.name}
            </h3>

            {/* Description */}
            <p
              className="text-[14px] leading-[1.6] text-center flex-1 font-sans"
              style={{ color: '#666' }}
            >
              {card.desc}
            </p>

            {/* CTA Button */}
            <Link
              to={card.to as '/programs' | '/venture-studio'}
              className="mt-6 inline-block font-bold text-[12px] tracking-[0.06em] px-5 py-2.5 rounded-full text-center no-underline font-sans transition-all duration-200"
              style={{
                backgroundColor: card.color,
                color: '#fff',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.opacity = '0.9';
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.opacity = '1';
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              }}
            >
              {card.btn}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
