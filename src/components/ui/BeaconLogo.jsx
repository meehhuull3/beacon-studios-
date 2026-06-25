import React from 'react';

export function BeaconLogo({ className = "w-10 h-10", forceWhite = false }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left Triangle (Navy in light mode, white/light-grey in dark mode, or forced white) */}
      <polygon 
        points="47,5 15,50 47,95" 
        className={forceWhite ? "fill-white" : "fill-[#0B192C] dark:fill-white transition-colors duration-200"} 
      />
      {/* Right Triangle (Teal/Cyan) */}
      <polygon 
        points="53,5 85,50 53,95" 
        className="fill-[#00ADB5]" 
      />
    </svg>
  );
}

export function BeaconBrand({ className = "flex items-center gap-3", showText = true, textClass = "" }) {
  return (
    <div className={className}>
      <BeaconLogo className="w-8 h-8 flex-shrink-0" />
      {showText && (
        <div className="text-left">
          <span className={`font-heading font-bold text-lg tracking-tight leading-none text-foreground ${textClass}`}>
            <span className="text-[#0B192C] dark:text-white">BEACON</span>{" "}
            <span className="text-[#00ADB5]">INDICA</span>
          </span>
        </div>
      )}
    </div>
  );
}
