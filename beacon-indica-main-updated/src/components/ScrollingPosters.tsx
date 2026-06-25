import React from 'react';

// Startup ecosystem images — regular img tags, zero CORS issues
const IMAGES = [
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=480&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=480&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=480&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=480&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=480&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=480&fit=crop&q=80',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=480&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=480&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=480&fit=crop&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=480&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=480&fit=crop&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=480&fit=crop&q=80',
];

const COLS = [
  IMAGES.slice(0, 4),
  IMAGES.slice(4, 8),
  IMAGES.slice(8, 12),
];

function Column({
  images,
  duration,
  reverse = false,
  mt = 0,
}: {
  images: string[];
  duration: number;
  reverse?: boolean;
  mt?: number;
}) {
  // Duplicate so the loop is seamless
  const all = [...images, ...images];
  return (
    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', marginTop: mt }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          animation: `${reverse ? 'postersDown' : 'postersUp'} ${duration}s linear infinite`,
          willChange: 'transform',
        }}
      >
        {all.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            aria-hidden
            style={{
              width: '100%',
              height: 280,
              objectFit: 'cover',
              borderRadius: 14,
              flexShrink: 0,
              display: 'block',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function ScrollingPosters() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -20,
        display: 'flex',
        gap: 14,
        padding: 14,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <Column images={COLS[0]} duration={22} mt={-40} />
      <Column images={COLS[1]} duration={28} reverse mt={-120} />
      <Column images={COLS[2]} duration={19} mt={-80} />
    </div>
  );
}
