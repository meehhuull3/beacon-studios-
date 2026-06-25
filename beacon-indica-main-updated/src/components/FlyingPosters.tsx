import { useEffect, useRef } from 'react';
import { Renderer, Camera, Transform, Plane, Mesh, Program, Texture } from 'ogl';

interface FlyingPostersProps {
  items: string[];
  planeWidth?: number;
  planeHeight?: number;
  distortion?: number;
  scrollEase?: number;
}

const vertexShader = /* glsl */ `
  attribute vec3 position;
  attribute vec2 uv;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uDistortion;
  uniform float uIndex;

  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;

    float wave = sin(pos.x * 1.5 + uTime * 0.8 + uIndex * 1.2) * uDistortion * 0.012;
    pos.z += wave;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform float uAlpha;
  uniform float uHover;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    // slight barrel distortion on hover
    vec2 center = uv - 0.5;
    uv = center * (1.0 - uHover * 0.04 * dot(center, center)) + 0.5;

    vec4 color = texture2D(uTexture, uv);
    gl_FragColor = vec4(color.rgb, color.a * uAlpha);
  }
`;

export function FlyingPosters({
  items,
  planeWidth = 320,
  planeHeight = 440,
  distortion = 3,
  scrollEase = 0.05,
}: FlyingPostersProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement!;
    const W = container.clientWidth || planeWidth;
    const H = container.clientHeight || planeHeight;

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new Renderer({
      canvas,
      width: W,
      height: H,
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio, 2),
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    // ── Camera ────────────────────────────────────────────────────────────
    const camera = new Camera(gl, { fov: 45 });
    camera.position.z = 5;

    // ── Scene ─────────────────────────────────────────────────────────────
    const scene = new Transform();

    // ── Geometry ──────────────────────────────────────────────────────────
    const geometry = new Plane(gl, { width: 1, height: 1, widthSegments: 20, heightSegments: 20 });

    // ── Meshes ────────────────────────────────────────────────────────────
    const count = items.length;
    const meshes: any[] = [];

    // vertical spacing in world units
    const gap = 1.6;
    const totalH = (count - 1) * gap;

    // scroll state
    let scrollY = 0;
    let targetScrollY = 0;
    let time = 0;

    // aspect ratio of one card in world space
    const aspect = W / H;
    const cardW = aspect * 1.2;
    const cardH = cardW * (planeHeight / planeWidth);

    items.forEach((src, idx) => {
      const texture = new Texture(gl, { generateMipmaps: false });

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { texture.image = img; };
      img.src = src;

      const program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          uTexture: { value: texture },
          uTime:    { value: 0 },
          uDistortion: { value: distortion },
          uIndex:   { value: idx },
          uAlpha:   { value: 0 },
          uHover:   { value: 0 },
        },
        transparent: true,
      });

      const mesh = new Mesh(gl, { geometry, program });
      mesh.scale.set(cardW, cardH, 1);
      mesh.position.y = -idx * gap + totalH / 2;
      mesh.setParent(scene);
      meshes.push(mesh);
    });

    // ── Page scroll → drive targetScrollY ────────────────────────────────
    let lastPageY = window.scrollY;
    const onScroll = () => {
      const delta = window.scrollY - lastPageY;
      targetScrollY += delta * 0.003;
      lastPageY = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Wheel fallback (also passive, doesn't block page scroll) ──────────
    const onWheel = (e: WheelEvent) => {
      targetScrollY += e.deltaY * 0.003;
    };
    window.addEventListener('wheel', onWheel, { passive: true });

    // ── Auto-scroll loop ──────────────────────────────────────────────────
    const autoSpeed = 0.012;

    // ── Render loop ───────────────────────────────────────────────────────
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      time += 0.016;

      // auto drift + ease to target
      targetScrollY += autoSpeed;
      scrollY += (targetScrollY - scrollY) * scrollEase;

      // wrap around
      const wrapRange = count * gap;
      if (scrollY > wrapRange) { scrollY -= wrapRange; targetScrollY -= wrapRange; }
      if (scrollY < 0)         { scrollY += wrapRange; targetScrollY += wrapRange; }

      meshes.forEach((mesh, i) => {
        const baseY = -i * gap + totalH / 2;
        let y = baseY + scrollY;

        // wrap individual cards
        const half = wrapRange / 2;
        if (y > half  + cardH)  y -= wrapRange;
        if (y < -half - cardH)  y += wrapRange;

        mesh.position.y = y;

        // fade near edges — use world-space units (camera sees ~4 units vertically)
        const viewHalfH = camera.position.z * Math.tan((45 / 2) * (Math.PI / 180));
        const norm = Math.abs(y) / (viewHalfH * 1.1);
        const alpha = Math.max(0, 1 - Math.pow(Math.min(norm, 1), 2.0));

        mesh.program.uniforms.uTime.value  = time;
        mesh.program.uniforms.uAlpha.value  = alpha;
        mesh.program.uniforms.uHover.value  = 0;
      });

      renderer.render({ scene, camera });
    };
    loop();

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [items, planeWidth, planeHeight, distortion, scrollEase]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}
