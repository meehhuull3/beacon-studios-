import { useEffect, useRef } from 'react';

const JARGONS = [
  'Entrepreneurs',
  'Startups',
  'Funding',
  'Equity',
  'Market',
  'Vision',
  'Ideation',
  'Burn Rate',
];

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  word: string;
  wobble: number;
  wobbleSpeed: number;
  wobbleOffset: number;
  popping: boolean;
  popProgress: number;
  hueShift: number;
  shimmerAngle: number;
  id: number;
  vx: number;
  vy: number;
  jiggle: number;
  jiggleV: number;
}

let bubbleIdCounter = 0;

function createBubble(W: number, H: number, fromBottom = true, existingBubbles: Bubble[] = []): Bubble {
  const word = JARGONS[Math.floor(Math.random() * JARGONS.length)];
  const mobile = window.innerWidth <= 768;
  const baseRadius = mobile
    ? (word.length <= 8 ? 22 + Math.random() * 6 : 28 + Math.random() * 8)
    : (word.length <= 4 ? 28 + Math.random() * 20
      : word.length <= 8 ? 38 + Math.random() * 18
      : word.length <= 14 ? 50 + Math.random() * 16
      : 62 + Math.random() * 14);
  const radius = baseRadius;
  const minGap = radius * 3.2; // larger gap on spawn to keep bubbles spread out

  // Try up to 30 times to find a non-overlapping spawn position
  let spawnX = radius + Math.random() * (W - radius * 2);
  let spawnY = fromBottom ? H + radius + Math.random() * 80 : H * 0.2 + Math.random() * H * 0.75;
  for (let attempt = 0; attempt < 30; attempt++) {
    const cx = radius + Math.random() * (W - radius * 2);
    const cy = fromBottom ? H + radius + Math.random() * 80 : H * 0.2 + Math.random() * H * 0.75;
    const tooClose = existingBubbles.some(eb => {
      const ddx = eb.x - cx;
      const ddy = eb.y - cy;
      return Math.sqrt(ddx * ddx + ddy * ddy) < (eb.radius + radius + minGap);
    });
    if (!tooClose) { spawnX = cx; spawnY = cy; break; }
  }

  return {
    id: bubbleIdCounter++,
    x: spawnX,
    y: spawnY,
    radius,
    speed: 0.2 + Math.random() * 0.7,
    opacity: fromBottom ? 0 : 0.7 + Math.random() * 0.3,
    word,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.008 + Math.random() * 0.012,
    wobbleOffset: Math.random() * Math.PI * 2,
    popping: false,
    popProgress: 0,
    hueShift: Math.random() * 360,
    shimmerAngle: Math.random() * Math.PI * 2,
    vx: 0,
    vy: 0,
    jiggle: 0,
    jiggleV: 0,
  };
}

function drawRealisticBubble(ctx: CanvasRenderingContext2D, b: Bubble, t: number) {
  const { x, y, radius, opacity, word, hueShift, shimmerAngle, jiggle } = b;

  ctx.save();
  // Jiggle squish — slightly squash/stretch the bubble
  ctx.translate(x, y);
  ctx.scale(
    1 + Math.sin(b.jiggle * 2.2) * 0.025,
    1 - Math.sin(b.jiggle * 2.2) * 0.025
  );
  ctx.translate(-x, -y);
  ctx.globalAlpha = opacity;

  // --- Iridescent film: thin rainbow arc bands ---
  const iridColors = [
    `hsla(${(hueShift + 0) % 360},90%,65%,0.18)`,
    `hsla(${(hueShift + 45) % 360},95%,60%,0.15)`,
    `hsla(${(hueShift + 90) % 360},90%,70%,0.18)`,
    `hsla(${(hueShift + 160) % 360},85%,65%,0.14)`,
    `hsla(${(hueShift + 220) % 360},90%,60%,0.16)`,
    `hsla(${(hueShift + 290) % 360},80%,68%,0.13)`,
  ];

  // Base transparent bubble body with soft warm peach/white highlights
  const bodyGrad = ctx.createRadialGradient(
    x - radius * 0.25, y - radius * 0.2, 0,
    x, y, radius
  );
  bodyGrad.addColorStop(0, 'rgba(255,255,255,0.08)');
  bodyGrad.addColorStop(0.5, 'rgba(11,139,139,0.04)');
  bodyGrad.addColorStop(0.85, 'rgba(11,139,139,0.08)');
  bodyGrad.addColorStop(1, 'rgba(11,139,139,0.14)');

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Subtle inner orange rim glow to coordinate with the orange branding perfectly
  const orangeRim = ctx.createRadialGradient(x, y, radius * 0.82, x, y, radius);
  orangeRim.addColorStop(0, 'rgba(11,139,139,0)');
  orangeRim.addColorStop(0.6, 'rgba(11,139,139,0.08)');
  orangeRim.addColorStop(1, 'rgba(11,139,139,0.20)');
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = orangeRim;
  ctx.fill();

  // Iridescent bands sweeping across surface
  for (let i = 0; i < iridColors.length; i++) {
    const angle = shimmerAngle + (i / iridColors.length) * Math.PI * 2 + t * 0.08;
    const bx = x + Math.cos(angle) * radius * 0.55;
    const by = y + Math.sin(angle) * radius * 0.55;
    const iridGrad = ctx.createRadialGradient(bx, by, 0, bx, by, radius * 0.85);
    iridGrad.addColorStop(0, iridColors[i]);
    iridGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = iridGrad;
    ctx.fill();
  }

  // Thin crisp bubble wall with warm brand-orange tint blending
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  const wallGrad = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
  wallGrad.addColorStop(0, `hsla(${(hueShift + 30) % 360},80%,75%,0.50)`);
  wallGrad.addColorStop(0.4, `hsla(${(hueShift + 120) % 360},70%,80%,0.25)`);
  wallGrad.addColorStop(0.7, 'rgba(11,139,139,0.40)');
  wallGrad.addColorStop(1, `hsla(${(hueShift + 310) % 360},80%,75%,0.45)`);
  ctx.strokeStyle = wallGrad;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Primary specular highlight top-left (bright white blob)
  const hlx = x - radius * 0.33;
  const hly = y - radius * 0.38;
  const hlGrad = ctx.createRadialGradient(hlx, hly, 0, hlx, hly, radius * 0.42);
  hlGrad.addColorStop(0, 'rgba(255,255,255,0.92)');
  hlGrad.addColorStop(0.35, 'rgba(255,255,255,0.40)');
  hlGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = hlGrad;
  ctx.fill();

  // Secondary small highlight (bottom-right)
  const hl2x = x + radius * 0.38;
  const hl2y = y + radius * 0.42;
  const hl2Grad = ctx.createRadialGradient(hl2x, hl2y, 0, hl2x, hl2y, radius * 0.22);
  hl2Grad.addColorStop(0, 'rgba(255,255,255,0.45)');
  hl2Grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = hl2Grad;
  ctx.fill();

  // Word text — dark shadow for contrast on any bg
  const fontSize = Math.max(9, Math.min(14, radius * 0.26));
  ctx.font = `800 ${fontSize}px 'Hanken Grotesk', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Bright orange glow behind text
  ctx.shadowColor = 'rgba(11,139,139,1)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(word, x, y);
  // Second pass for extra crispness
  ctx.shadowBlur = 4;
  ctx.fillText(word, x, y);
  ctx.shadowBlur = 0;

  ctx.restore();
}

function drawPop(ctx: CanvasRenderingContext2D, b: Bubble) {
  const { x, y, radius, popProgress, hueShift } = b;
  const alpha = 1 - popProgress;
  ctx.save();
  ctx.globalAlpha = alpha * 0.9;
  // Expanding ring
  ctx.beginPath();
  ctx.arc(x, y, radius * (1 + popProgress * 0.6), 0, Math.PI * 2);
  ctx.strokeStyle = `hsla(${(hueShift + 60) % 360},90%,75%,${alpha})`;
  ctx.lineWidth = 2 * (1 - popProgress);
  ctx.stroke();
  // Droplet particles
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const dist = popProgress * radius * 1.4;
    const px = x + Math.cos(angle) * dist;
    const py = y + Math.sin(angle) * dist;
    ctx.beginPath();
    ctx.arc(px, py, 2.5 * (1 - popProgress), 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${(hueShift + i * 30) % 360},90%,75%,${alpha})`;
    ctx.fill();
  }
  ctx.restore();
}

export default function BubbleAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth <= 768;
    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    
    // Scale canvas backstore to match high-DPI/Retina displays (iOS, Android, Mac)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const resize = () => {
      const currentDpr = window.devicePixelRatio || 1;
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * currentDpr;
      canvas.height = H * currentDpr;
      ctx.scale(currentDpr, currentDpr);
    };
    window.addEventListener('resize', resize);

    let cursorX = -9999;
    let cursorY = -9999;
    let lastCursorX = -9999;
    let lastCursorY = -9999;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      lastCursorX = cursorX;
      lastCursorY = cursorY;
      cursorX = e.clientX - rect.left;
      cursorY = e.clientY - rect.top;
    };
    if (!isMobile) {
      window.addEventListener('mousemove', onMouseMove);
    }

    const bubbles: Bubble[] = [];
    const MAX = isMobile ? 7 : 14; // perfect mobile bubble count, well separated and spacious
    for (let i = 0; i < MAX; i++) {
      bubbles.push(createBubble(W, H, false, bubbles));
    }

    // Click/touch to pop
    const onClick = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e instanceof TouchEvent ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
      const clientY = e instanceof TouchEvent ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;
      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        if (b.popping) continue;
        const dx = mx - b.x;
        const dy = my - b.y;
        const hitRadius = isMobile ? b.radius * 1.4 : b.radius;
        if (Math.sqrt(dx * dx + dy * dy) <= hitRadius) {
          b.popping = true;
          b.popProgress = 0;
          break;
        }
      }
    };
    canvas.style.pointerEvents = 'none';
    window.addEventListener('click', onClick);
    window.addEventListener('touchend', onClick as EventListener, { passive: true });

    let t = 0;
    let raf: number;

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.016;

      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];

        if (b.popping) {
          b.popProgress += 0.055;
          if (b.popProgress >= 1) {
            bubbles.splice(i, 1);
            const currentMax = window.innerWidth <= 768 ? 7 : 14;
            if (bubbles.length < currentMax) {
              bubbles.push(createBubble(W, H, true, bubbles));
            }
            continue;
          }
          drawPop(ctx, b);
          continue;
        }

        b.y -= b.speed;

        if (!isMobile) {
          const windX = cursorX - lastCursorX;
          const windY = cursorY - lastCursorY;
          const windSpeed = Math.sqrt(windX * windX + windY * windY);

          const dx = cursorX - b.x;
          const dy = cursorY - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influence = Math.max(0, 1 - dist / (b.radius * 5));

          if (influence > 0 && windSpeed > 2) {
            b.vx += windX * influence * 0.06;
            b.vy += windY * influence * 0.04;
            b.jiggleV += influence * windSpeed * 0.012;
          }
        }

        // Bubble-to-bubble repulsion — push apart if too close, stronger on mobile
        for (let j = 0; j < bubbles.length; j++) {
          if (i === j) continue;
          const other = bubbles[j];
          if (other.popping) continue;
          const rdx = b.x - other.x;
          const rdy = b.y - other.y;
          const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
          const minDist = b.radius + other.radius + (isMobile ? 32 : 18);
          if (rdist < minDist && rdist > 0.1) {
            const force = (minDist - rdist) / minDist * (isMobile ? 0.75 : 0.4);
            b.vx += (rdx / rdist) * force;
            b.vy += (rdy / rdist) * force;
          }
        }

        // Horizontal distribution drift (prevent mobile clustering in the center)
        const centerPush = (b.x - W / 2) * (isMobile ? 0.0008 : 0.0002);
        b.vx += centerPush;

        // Very subtle ambient jiggle only
        b.jiggleV += Math.sin(t * 1.2 + b.wobbleOffset) * 0.003;

        // Strong decay so movement stops quickly
        b.vx *= 0.78;
        b.vy *= 0.78;
        b.jiggleV *= 0.72;
        b.jiggle += b.jiggleV;

        b.x += b.vx;
        b.y += b.vy;

        if (b.x - b.radius < 0) { b.x = b.radius; b.vx *= -0.2; }
        if (b.x + b.radius > W) { b.x = W - b.radius; b.vx *= -0.2; }

        b.wobble += b.wobbleSpeed;
        b.x += Math.sin(b.wobble + b.wobbleOffset) * 0.45;
        b.hueShift += 0.4;
        if (b.opacity < 1) b.opacity = Math.min(1, b.opacity + 0.012);

        if (b.y - b.radius < 4) {
          b.popping = true;
          b.popProgress = 0;
        }

        drawRealisticBubble(ctx, b, t);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('click', onClick);
      window.removeEventListener('touchend', onClick as EventListener, { passive: true } as any);
      if (!isMobile) {
        window.removeEventListener('mousemove', onMouseMove);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
