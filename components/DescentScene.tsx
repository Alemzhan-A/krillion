"use client";

import { useEffect, useRef } from "react";
import { WORLDS, type WorldId } from "@/lib/worlds";
import { MAX_DAY_SCORE, METRES_PER_POINT, TIERS, type TierId } from "@/lib/tiers";
import Mascot from "./Mascot";
import Surface from "./Surface";

const FLOOR_M = MAX_DAY_SCORE * METRES_PER_POINT; // 7000 м
const PX_PER_M = 0.5;
const WORLD_PX = FLOOR_M * PX_PER_M;
/** доля высоты экрана, на которой висит криль */
const EYE = 0.4;

function mix(a: string, b: string, t: number): [number, number, number] {
  const hex = (h: string) =>
    [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
  const [r1, g1, b1] = hex(a);
  const [r2, g2, b2] = hex(b);
  return [r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t];
}

/** цвет толщи на данной глубине */
function depthColor(
  stops: [number, string][],
  m: number,
): [number, number, number] {
  if (m <= stops[0][0]) return mix(stops[0][1], stops[0][1], 0);
  for (let i = 0; i < stops.length - 1; i++) {
    const [m0, c0] = stops[i];
    const [m1, c1] = stops[i + 1];
    if (m <= m1) return mix(c0, c1, (m - m0) / (m1 - m0));
  }
  const last = stops[stops.length - 1][1];
  return mix(last, last, 0);
}

type Flake = { x: number; y: number; r: number; v: number; c: string; a: number };

/** обитатели на глубине: [метры, размер, длительность заплыва, задержка, влево?] */
const FISH: [number, number, number, number, boolean][] = [
  [120, 26, 46, 0, false],
  [340, 18, 62, 8, true],
  [610, 34, 54, 3, false],
  [980, 22, 70, 14, true],
  [1420, 30, 58, 6, false],
  [1900, 20, 76, 18, true],
  [2480, 38, 64, 2, false],
  [3200, 24, 82, 11, true],
  [4100, 30, 68, 5, false],
  [5300, 20, 88, 16, true],
  [6200, 34, 72, 9, false],
];

function Fish({ size, color }: { size: number; color: string }) {
  return (
    <svg
      viewBox="0 0 24 14"
      width={size}
      height={(size / 24) * 14}
      shapeRendering="crispEdges"
      aria-hidden
    >
      <path d="M6 3h9v1h2v1h2v4h-2v1h-2v1H6V3z" fill={color} opacity={0.75} />
      <path d="M0 3h5v8H0V8H2V6H0V3z" fill={color} opacity={0.5} />
      <rect x={15} y={5} width={1} height={1} fill="#050a14" />
    </svg>
  );
}

export default function DescentScene({
  world: worldId,
  depthM,
  landedTier,
  landedKey,
  shake,
  celebrate,
  sad,
}: {
  world: WorldId;
  /** целевая глубина в метрах */
  depthM: number;
  landedTier: TierId | null;
  /** меняется на каждом приземлении — перезапускает вспышку */
  landedKey: number;
  shake: number;
  celebrate: boolean;
  sad: boolean;
}) {
  const world = WORLDS[worldId];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(depthM);
  const currentRef = useRef(depthM);

  targetRef.current = depthM;

  useEffect(() => {
    const canvas = canvasRef.current;
    const worldEl = worldRef.current;
    if (!canvas || !worldEl) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let flakes: Flake[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((w * h) / 9000);
      flakes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.4 + Math.random() * 1.6,
        v: 4 + Math.random() * 16,
        c: world.motes[Math.floor(Math.random() * world.motes.length)],
        a: 0.1 + Math.random() * 0.45,
      }));
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    let last = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // плавно догоняем целевую глубину
      const target = targetRef.current;
      const cur = currentRef.current;
      const next = reduced ? target : cur + (target - cur) * Math.min(1, dt * 1.9);
      currentRef.current = Math.abs(target - next) < 0.5 ? target : next;

      const d = currentRef.current;
      worldEl.style.transform = `translate3d(0, ${-(d * PX_PER_M - h * EYE)}px, 0)`;

      // ватерлиния на экране: выше — небо, ниже — вода
      const waterline = h * EYE - d * PX_PER_M;

      if (waterline > 0) {
        const sky = ctx.createLinearGradient(0, 0, 0, waterline);
        sky.addColorStop(0, world.skyTop);
        sky.addColorStop(1, world.skyHorizon);
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, waterline);

        const sunX = w * 0.72;
        const sunY = waterline - 300;
        const halo = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 190);
        halo.addColorStop(0, `rgba(${world.glow},0.95)`);
        halo.addColorStop(0.35, `rgba(${world.glow},0.35)`);
        halo.addColorStop(1, `rgba(${world.glow},0)`);
        ctx.fillStyle = halo;
        ctx.fillRect(sunX - 190, sunY - 190, 380, 380);
      }

      // вода — от ватерлинии вниз
      const top = Math.max(waterline, 0);
      if (top < h) {
        const [r, g, b] = depthColor(world.stops, d);
        const [r2, g2, b2] = depthColor(world.stops, d + (h - top) / PX_PER_M);
        const grad = ctx.createLinearGradient(0, top, 0, h);
        grad.addColorStop(0, `rgb(${r} ${g} ${b})`);
        grad.addColorStop(1, `rgb(${r2} ${g2} ${b2})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, top, w, h - top);

        // солнечная дорожка сразу под поверхностью: мягкое пятно, без швов
        if (waterline > 0 && waterline < h) {
          const gx = w * 0.72;
          const glare = ctx.createRadialGradient(gx, waterline, 0, gx, waterline, 240);
          glare.addColorStop(0, `rgba(${world.glow},0.26)`);
          glare.addColorStop(0.5, `rgba(${world.glow},0.10)`);
          glare.addColorStop(1, `rgba(${world.glow},0)`);
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, waterline, w, h - waterline);
          ctx.clip();
          ctx.fillStyle = glare;
          ctx.fillRect(gx - 240, waterline, 480, 240);
          ctx.restore();
        }
      }

      // морской снег поднимается вверх, пока мы опускаемся
      const drift = (target - d) * PX_PER_M * 6;
      for (const f of flakes) {
        f.y -= (f.v + Math.abs(drift) * 0.03) * dt * 60 * 0.02;
        if (f.y < -4) {
          f.y = h + 4;
          f.x = Math.random() * w;
        }
        if (f.y < top) continue; // над водой снега нет
        ctx.globalAlpha = f.a * (1 - Math.min(d / 9000, 0.55));
        ctx.fillStyle = `rgb(${f.c})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [world]);

  const tierColor = landedTier ? TIERS[landedTier].color : "var(--pink)";

  return (
    <div
      className="ds-stage"
      data-shake={shake || undefined}
      data-world={worldId}
      style={{ ["--tc" as string]: tierColor }}
    >
      <canvas ref={canvasRef} className="ds-sea" />

      <div ref={worldRef} className="ds-world" style={{ height: WORLD_PX }}>
        <Surface world={worldId} />

        <div className="ds-surface" style={{ top: 0 }}>
          <div className="ds-surface-line" />
          <span className="ds-surface-label">{world.copy.surfaceLabel}</span>
        </div>

        {world.ambient.map(([m, label, side, big]) => (
          <div
            key={m}
            className={`ds-amb ds-amb-${side.toLowerCase()}${big ? " ds-amb-big" : ""}`}
            style={{ top: m * PX_PER_M }}
          >
            <span className="ds-amb-m">
              {m}
              {world.copy.unit}
            </span>
            <span className="ds-amb-t">{label}</span>
          </div>
        ))}

        {worldId === "ocean" && FISH.map(([m, size, dur, delay, leftward]) => (
          <div
            key={m}
            className={`ds-fish ${leftward ? "ds-fish-l" : "ds-fish-r"}`}
            style={{
              top: m * PX_PER_M,
              animationDuration: `${dur}s`,
              animationDelay: `-${delay}s`,
            }}
          >
            <Fish size={size} color={m > 3000 ? "#9d7bff" : "#7d93b8"} />
          </div>
        ))}

        <div className="ds-floor" style={{ top: WORLD_PX, background: world.floor }} />
      </div>

      <div
        className="ds-krill"
        style={{ top: `${EYE * 100}%` }}
        data-celebrate={celebrate || undefined}
        data-sad={sad || undefined}
      >
        <div className="ds-krill-inner">
          <Mascot world={worldId} size={54} tier={landedTier} glow={landedTier === "krillion"} />
        </div>
        <span className="ds-blub">°</span>
      </div>

      <div className="ds-vignette" />
      <div key={`edge-${landedKey}`} className="ds-edge" data-on={landedTier ? "" : undefined} />
      <div key={`flash-${landedKey}`} className="ds-flash" data-on={landedTier ? "" : undefined} />
      <div className="ds-crt" />
    </div>
  );
}
