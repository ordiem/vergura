"use client";

import { useEffect, useRef } from "react";

/**
 * Gauss-style halftone dot-matrix backdrop.
 * A fixed, full-viewport grid of tiny dots whose brightness drifts on a slow
 * flow field. Subtle by design — ambient texture behind all content.
 */
export function HalftoneBackdrop() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const GAP = 12; // px between dots
    let w = 0,
      h = 0,
      dpr = 1,
      cols = 0,
      rows = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / GAP) + 1;
      rows = Math.ceil(h / GAP) + 1;
    };
    resize();

    let raf = 0;
    let t = 0;
    let last = 0;

    const frame = (now: number) => {
      // ~18fps — deliberate, low-cost
      if (now - last < 55) {
        raf = requestAnimationFrame(frame);
        return;
      }
      last = now;
      t += 0.02;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#bfa46a";

      for (let j = 0; j < rows; j++) {
        const y = j * GAP;
        // even field with a gentle top bias; never fully fades out below
        const vert = 0.66 + 0.34 * Math.max(0, 1 - y / (h * 0.85));
        for (let i = 0; i < cols; i++) {
          const x = i * GAP;
          const wave =
            0.5 +
            0.5 *
              Math.sin(i * 0.22 + t) *
              Math.cos(j * 0.19 - t * 0.7) *
              Math.sin((i + j) * 0.08 + t * 0.4);
          const intensity = (0.42 + 0.58 * wave) * vert;
          if (intensity < 0.14) continue;
          ctx.globalAlpha = Math.min(0.5, intensity * 0.5);
          const s = intensity > 0.72 ? 2 : 1;
          ctx.fillRect(x, y, s, s);
        }
      }
      ctx.globalAlpha = 1;

      if (!reduced) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
