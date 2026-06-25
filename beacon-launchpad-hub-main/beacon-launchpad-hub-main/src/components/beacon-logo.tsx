import { Link } from "@tanstack/react-router";

export function BeaconLogo({ subtitle = "STUDIOS" }: { subtitle?: string }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <span className="beacon-mark" aria-hidden />
      <span className="font-bold tracking-tight text-[15px] leading-none">
        BEACON <span className="text-primary">{subtitle}</span>
      </span>
    </Link>
  );
}
