import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/about", label: "About" },
  { to: "/programs", label: "Programs" },
  { to: "/venture-studio", label: "Venture Studio" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <nav
      className={`sticky top-0 z-50 w-full bg-surface/85 backdrop-blur border-b border-outline-variant/60 transition-shadow ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="max-w-[1200px] mx-auto flex justify-between items-center px-6 md:px-10 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="w-7 h-7 bg-accent"
            style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
          />
          <span className="text-[20px] font-extrabold tracking-tight text-primary">
            BEACON <span className="text-accent">INDICA</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-7 text-[14px] font-medium">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`transition-all duration-200 pb-1 relative ${
                  active
                    ? "text-accent after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-accent after:rounded-full"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
        <Link
          to="/contact"
          className="hidden md:inline-flex bg-accent text-accent-foreground font-bold py-2.5 px-5 rounded-md text-sm cta-shadow"
        >
          Partner With Us
        </Link>
        <button
          aria-label="Toggle menu"
          className="md:hidden p-2 text-primary"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-outline-variant bg-surface">
          <div className="px-6 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="py-3 text-[15px] text-on-surface hover:text-accent"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/contact"
              className="mt-2 bg-accent text-accent-foreground font-bold py-3 px-5 rounded-md text-center text-sm"
            >
              Partner With Us
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}