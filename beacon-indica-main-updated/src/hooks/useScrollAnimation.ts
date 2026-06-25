import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollAnimation() {
  useEffect(() => {
    // Fade up — every card, stat, and content block
    gsap.utils.toArray('[data-animate="fade-up"]').forEach((el: any, i) => {
      gsap.fromTo(el,
        { opacity: 0, y: 60, filter: 'blur(6px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 0.8,
          ease: 'power3.out',
          delay: (i % 4) * 0.1,
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // Slide in from left
    gsap.utils.toArray('[data-animate="slide-left"]').forEach((el: any) => {
      gsap.fromTo(el,
        { opacity: 0, x: -80 },
        {
          opacity: 1, x: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
        }
      );
    });

    // Slide in from right
    gsap.utils.toArray('[data-animate="slide-right"]').forEach((el: any) => {
      gsap.fromTo(el,
        { opacity: 0, x: 80 },
        {
          opacity: 1, x: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
        }
      );
    });

    // Scale up — for stat numbers and big displays
    gsap.utils.toArray('[data-animate="scale-up"]').forEach((el: any) => {
      gsap.fromTo(el,
        { opacity: 0, scale: 0.7, filter: 'blur(8px)' },
        {
          opacity: 1, scale: 1, filter: 'blur(0px)',
          duration: 0.7,
          ease: 'back.out(1.4)',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
        }
      );
    });

    // Staggered children — for grids of cards
    gsap.utils.toArray('[data-animate="stagger"]').forEach((container: any) => {
      const children = container.children;
      gsap.fromTo(children,
        { opacity: 0, y: 50, filter: 'blur(4px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: { trigger: container, start: 'top 85%', toggleActions: 'play none none none' }
        }
      );
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);
}
