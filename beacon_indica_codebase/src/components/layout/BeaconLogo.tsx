/**
 * BeaconLogo — Kinetic Diamond mark + BEACON INDICA wordmark.
 *
 * Color switching is fully CSS-driven via --color-primary (from styles.css),
 * which automatically flips between dark (#1A1A1A) in light mode
 * and white (#F9F9F9) in dark mode — no prop or state needed.
 * The teal accent (#00B3A6) is always fixed.
 *
 * Props:
 *   size – "sm" | "md" | "lg"
 */

type LogoSize = "sm" | "md" | "lg";

interface BeaconLogoProps {
  size?: LogoSize;
  className?: string;
}

// viewBox is 440 x 85 — icon is ~72px tall, text ~42px
const sizeMap: Record<LogoSize, { width: number; height: number }> = {
  sm: { width: 195, height: 38 },
  md: { width: 250, height: 48 },
  lg: { width: 330, height: 64 },
};

export function BeaconLogo({ size = "md", className = "" }: BeaconLogoProps) {
  const { width, height } = sizeMap[size];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 440 85"
      width={width}
      height={height}
      aria-label="Beacon Indica"
      className={className}
      style={{ display: "block" }}
    >
      {/*
        CSS inside inline SVG: targets the .dark class on <html>.
        --color-primary flips automatically via the theme variables in styles.css.
        We use fill: var(--color-primary) for all dark/light-switchable elements.
      */}
      <style>{`
        .bi-logo-tri-left  { fill: var(--color-primary, #0B132B); }
        .bi-logo-text-main { fill: var(--color-primary, #0B132B); }
        .bi-logo-tri-right { fill: #00B3A6; }
        .bi-logo-text-teal { fill: #00B3A6; }
      `}</style>

      {/* ── Icon: Kinetic Diamond (two large triangles) ── */}
      <g transform="translate(4, 6)">
        {/* Left grounded triangle — switches with theme */}
        <path
          className="bi-logo-tri-left"
          d="M 30 5 L 2 42 L 30 78 Z"
        />
        {/* Right ascending triangle — always teal */}
        <path
          className="bi-logo-tri-right"
          d="M 38 0 L 68 37 L 38 73 Z"
        />
      </g>

      {/* ── Wordmark ── */}
      <text
        x="88"
        y="57"
        fontFamily="'Plus Jakarta Sans', 'Hanken Grotesk', system-ui, sans-serif"
        fontSize="42"
        letterSpacing="-0.5"
      >
        <tspan className="bi-logo-text-main" fontWeight="800">BEACON </tspan>
        <tspan className="bi-logo-text-teal" fontWeight="700">INDICA</tspan>
      </text>
    </svg>
  );
}
