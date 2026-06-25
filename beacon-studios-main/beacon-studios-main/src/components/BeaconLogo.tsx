import React from 'react';

interface BeaconLogoProps {
  variant?: 'hollow' | 'solid-navy' | 'solid-white' | 'auto';
  size?: number;
  className?: string;
}

export default function BeaconLogo({ variant = 'auto', size = 32, className = '' }: BeaconLogoProps) {
  // Determine fill/stroke colors based on variant
  // hollow (first image): left is hollow with thin border, right is solid teal
  // solid-navy (second image): left is solid navy (#1B2240), right is solid teal
  // solid-white: left is solid white, right is solid teal (ideal for dark backgrounds)
  
  let leftFill = 'none';
  let leftStroke = '#E2E5EC';
  let leftStrokeWidth = 3;
  
  if (variant === 'solid-navy') {
    leftFill = '#1B2240';
    leftStroke = 'none';
    leftStrokeWidth = 0;
  } else if (variant === 'solid-white') {
    leftFill = '#FFFFFF';
    leftStroke = 'none';
    leftStrokeWidth = 0;
  } else if (variant === 'hollow') {
    leftFill = 'none';
    leftStroke = '#2DC5A2'; // thin teal/blue border
    leftStrokeWidth = 3.5;
  } else {
    // auto variant: defaults to crisp hollow style (gorgeous contrast)
    leftFill = 'rgba(255, 255, 255, 0.4)';
    leftStroke = '#8891B0';
    leftStrokeWidth = 3;
  }

  const rightFill = '#2DC5A2';

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none`}
    >
      {/* Left split diamond (pointing left) */}
      <polygon 
        points="44,2 6,50 44,98" 
        fill={leftFill} 
        stroke={leftStroke} 
        strokeWidth={leftStrokeWidth} 
        strokeLinejoin="round" 
      />
      {/* Right split diamond (pointing right) */}
      <polygon 
        points="56,2 94,50 56,98" 
        fill={rightFill} 
        stroke={rightFill}
        strokeWidth={1}
        strokeLinejoin="round" 
      />
    </svg>
  );
}

// Export wordmark logo combination as seen in the third and fourth images as well
export function BeaconWordmark({ dark = false, size = 36, showSub = true }: { dark?: boolean; size?: number; showSub?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <BeaconLogo 
        variant={dark ? 'solid-navy' : 'solid-white'} 
        size={size} 
      />
      <div className="text-left">
        <div className={`font-['Bricolage_Grotesque'] leading-tight tracking-tight font-extrabold flex items-center gap-1.5`}>
          <span style={{ color: dark ? '#1B2240' : '#FFFFFF', fontSize: `${size * 0.45}px` }}>BEACON</span>
          <span style={{ color: '#2DC5A2', fontSize: `${size * 0.45}px` }}>INDICA</span>
        </div>
        {showSub && (
          <div className="text-[9.5px] uppercase tracking-[3px] font-bold text-[#2DC5A2] -mt-0.5">
            VENTURE STUDIO
          </div>
        )}
      </div>
    </div>
  );
}
