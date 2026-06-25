import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { BeaconLogo } from "./BeaconLogo";

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
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    
    // Initial check for theme
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`sticky top-0 z-50 w-full bg-surface/85 backdrop-blur border-b border-outline-variant/60 transition-shadow ${
        scrolled ? "shadow-sm" : ""
      }`}
      style={{ willChange: "transform, opacity" }}
    >
      <div className="max-w-[1200px] mx-auto flex justify-between items-center px-6 md:px-10 py-4">
        <Link to="/" className="flex items-center" aria-label="Beacon Indica Home">
          <BeaconLogo size="sm" />
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
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="hidden md:inline-flex"
            style={{ willChange: "transform" }}
          >
            <Link
              to="/contact"
              className="bg-accent text-accent-foreground font-bold py-2.5 px-5 rounded-md text-sm cta-shadow block"
            >
              Partner With Us
            </Link>
          </motion.div>

          {/* Theme Toggle Button */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="p-2 md:p-2.5 rounded-lg border border-outline-variant hover:border-accent hover:text-accent transition text-on-surface flex items-center justify-center cursor-pointer bg-surface/30 backdrop-blur"
            aria-label="Toggle light and dark mode"
            style={{ willChange: "transform" }}
          >
            {theme === "dark" ? (
              <Sun className="w-[18px] h-[18px] text-accent" />
            ) : (
              <Moon className="w-[18px] h-[18px] text-on-surface" />
            )}
          </motion.button>

          <motion.button
            aria-label="Toggle menu"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="md:hidden p-2 text-primary"
            onClick={() => setOpen((v) => !v)}
            style={{ willChange: "transform" }}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>
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
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-2 w-full"
              style={{ willChange: "transform" }}
            >
              <Link
                to="/contact"
                className="bg-accent text-accent-foreground font-bold py-3 px-5 rounded-md text-center text-sm block"
              >
                Partner With Us
              </Link>
            </motion.div>
          </div>
        </div>
      )}
    </motion.nav>
  );
}