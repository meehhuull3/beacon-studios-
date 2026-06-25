import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { BeaconLogo } from "./BeaconLogo";

const cols = [
  {
    title: "Programs",
    links: [
      { label: "Genesis", to: "/programs" },
      { label: "Fellowship", to: "/programs" },
      { label: "Accelerator", to: "/programs" },
      { label: "Ecosystem", to: "/programs" },
    ],
  },
  {
    title: "For Colleges",
    links: [
      { label: "Partner With Us", to: "/contact" },
      { label: "How It Works", to: "/about" },
      { label: "Venture Studio", to: "/venture-studio" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Gallery", to: "/gallery" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant pt-16 pb-8 overflow-hidden">
      <AnimateIn direction="up" delay={0} duration={0.65} className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <BeaconLogo size="sm" />
            <p className="mt-4 text-sm text-on-surface-variant max-w-[260px]">
              Where Founders Are Built. Venture studios embedded inside Indian campuses.
            </p>
            <a
              href="mailto:admin@beaconindica.com"
              className="block mt-4 text-sm text-on-surface-variant hover:text-accent transition-colors"
            >
              admin@beaconindica.com
            </a>
            <a
              href="https://chat.whatsapp.com/DMRdGf9Hify256Jm57a6g8"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 text-sm text-on-surface-variant hover:text-accent transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.552 4.116 1.523 5.845L0 24l6.337-1.497A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.804 9.804 0 01-5.031-1.384l-.361-.214-3.741.883.936-3.618-.235-.372A9.808 9.808 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.421 0 9.818 4.398 9.818 9.818 0 5.421-4.397 9.818-9.818 9.818z"/></svg>
              Join our WhatsApp Community
            </a>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h2 className="font-mono-label text-on-surface mb-4">{c.title}</h2>
              <ul className="space-y-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-on-surface-variant hover:text-accent transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-outline-variant flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant">
          <span>© 2026 Beacon Indica Pvt Ltd. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-accent transition-colors">Terms & Conditions</Link>
            <Link to="/refund" className="hover:text-accent transition-colors">Refund Policy</Link>
          </div>
        </div>
      </AnimateIn>
    </footer>
  );
}