import type { WorldId } from "@/lib/worlds";

/**
 * Что встречается по дороге вниз. Каждая находка привязана к глубине,
 * так что спуск читается как путешествие, а не как смена градиента.
 *
 * [глубина в метрах, что это, положение по горизонтали в %, масштаб]
 */
type Prop = [number, string, number, number];

const DEEP: Record<WorldId, Prop[]> = {
  ocean: [
    [420, "jelly", 22, 1],
    [760, "jelly", 74, 0.7],
    [1180, "angler", 68, 1],
    [1620, "wreck", 18, 1],
    [2180, "squid", 72, 1],
    [2760, "sub", 26, 1],
    [3800, "titanic", 60, 1],
    [4500, "smoker", 20, 1],
    [5300, "brittle", 70, 1],
    [6200, "worms", 30, 1],
    [6850, "worms", 66, 0.8],
  ],
  stadium: [
    [380, "scoreboard", 70, 1],
    [780, "tifo", 20, 1],
    [1220, "dugout", 68, 1],
    [1700, "tunnel", 22, 1],
    [2320, "locker", 70, 1],
    [2900, "lamp", 24, 1],
    [3600, "smallstand", 66, 1],
    [4400, "tornnet", 22, 1],
    [5200, "puddle", 70, 1],
    [6100, "jackets", 26, 1],
    [6800, "muddyball", 62, 1],
  ],
  steppe: [
    [380, "roots", 24, 1],
    [820, "skull", 70, 1],
    [1180, "pottery", 22, 1],
    [1600, "seam", 62, 1],
    [2100, "cart", 24, 1],
    [2700, "timbers", 68, 1],
    [3300, "copper", 22, 1],
    [4000, "drill", 66, 1],
    [4800, "crystals", 24, 1],
    [5600, "fault", 68, 1],
    [6600, "magma", 30, 1],
  ],
};

/* ——— океан ————————————————————————————————————— */

const shapes: Record<string, () => React.ReactElement> = {
  jelly: () => (
    <svg viewBox="0 0 40 60" width={40} height={60} shapeRendering="crispEdges">
      <path d="M8 18a12 12 0 0 1 24 0v6H8z" fill="#ff9ecb" opacity={0.5} />
      <path d="M11 24h4v18h-4zM19 24h4v22h-4zM27 24h4v16h-4z" fill="#ff9ecb" opacity={0.32} />
      <path d="M13 8a10 8 0 0 1 14 0" fill="none" stroke="#ffd9ee" strokeWidth={1.5} opacity={0.5} />
    </svg>
  ),
  angler: () => (
    <svg viewBox="0 0 70 46" width={70} height={46} shapeRendering="crispEdges">
      <path d="M18 12h30v6h6v12h-6v6H18v-6h-6V18h6z" fill="#1b2233" />
      <path d="M22 20h6v4h-6z" fill="#ffd166" opacity={0.9} />
      <path d="M20 26h16v3H20z" fill="#0a0e18" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={21 + i * 3} y={26} width={1} height={4} fill="#e8f1ff" opacity={0.8} />
      ))}
      <path d="M24 12V6h10" fill="none" stroke="#1b2233" strokeWidth={2} />
      <circle cx={36} cy={5} r={4} fill="#ffe9a8" opacity={0.95} />
      <circle cx={36} cy={5} r={9} fill="#ffd166" opacity={0.18} />
      <path d="M54 18l12-6v22l-12-6z" fill="#1b2233" opacity={0.85} />
    </svg>
  ),
  squid: () => (
    <svg viewBox="0 0 80 100" width={80} height={100} shapeRendering="crispEdges">
      <path d="M28 4h16l6 14v20H22V18z" fill="#b3486b" opacity={0.55} />
      <circle cx={32} cy={26} r={3} fill="#ffe9a8" opacity={0.7} />
      <circle cx={44} cy={26} r={3} fill="#ffe9a8" opacity={0.7} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={`M${24 + i * 6} 38q${i % 2 ? 6 : -6} 22 ${i % 2 ? 2 : -2} 58`}
          fill="none"
          stroke="#b3486b"
          strokeWidth={3}
          opacity={0.4}
        />
      ))}
    </svg>
  ),
  wreck: () => (
    <svg viewBox="0 0 140 60" width={140} height={60} shapeRendering="crispEdges">
      <path d="M10 40h110l-14 16H24z" fill="#1a2a2a" opacity={0.85} />
      <path d="M28 24h60v16H28z" fill="#1f3333" opacity={0.85} />
      <rect x={40} y={10} width={4} height={14} fill="#1f3333" opacity={0.8} />
      <rect x={64} y={4} width={3} height={20} fill="#1f3333" opacity={0.8} />
      <path d="M34 30h8v6h-8zM50 30h8v6h-8zM66 30h8v6h-8z" fill="#0b1414" />
      <path d="M96 40l14-6v6z" fill="#162424" opacity={0.7} />
    </svg>
  ),
  titanic: () => (
    <svg viewBox="0 0 220 80" width={220} height={80} shapeRendering="crispEdges">
      <path d="M6 46h200l-24 26H30z" fill="#16211f" opacity={0.9} />
      <path d="M40 28h120v18H40z" fill="#1c2a28" opacity={0.9} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={56 + i * 24} y={10} width={12} height={18} fill="#233330" opacity={0.9} />
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={46 + i * 8} y={34} width={4} height={5} fill="#ffd166" opacity={0.16} />
      ))}
      <path d="M170 46l30-8v8z" fill="#131d1c" opacity={0.8} />
    </svg>
  ),
  smoker: () => (
    <svg viewBox="0 0 60 90" width={60} height={90} shapeRendering="crispEdges">
      <path d="M18 40h24v50H18z" fill="#1a1414" />
      <path d="M22 30h16v10H22z" fill="#241a1a" />
      <path d="M24 0q-6 18 2 30h8q8-12 2-30z" fill="#2b2b33" opacity={0.5} />
      <path d="M26 4q-4 14 2 24" fill="none" stroke="#3d3d4a" strokeWidth={3} opacity={0.4} />
      <rect x={14} y={84} width={32} height={6} fill="#141010" />
    </svg>
  ),
  brittle: () => (
    <svg viewBox="0 0 70 40" width={70} height={40} shapeRendering="crispEdges">
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${i * 22} ${(i % 2) * 8})`}>
          <rect x={10} y={16} width={5} height={5} fill="#c08a6a" opacity={0.6} />
          <path
            d="M12 16l-8-8M15 18l8-7M12 21l-7 9M15 21l7 8"
            stroke="#c08a6a"
            strokeWidth={1.6}
            opacity={0.5}
            fill="none"
          />
        </g>
      ))}
    </svg>
  ),
  worms: () => (
    <svg viewBox="0 0 80 46" width={80} height={46} shapeRendering="crispEdges">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x={6 + i * 12} y={14 + (i % 3) * 4} width={5} height={32} fill="#e8e2d6" opacity={0.35} />
          <rect x={6 + i * 12} y={10 + (i % 3) * 4} width={5} height={5} fill="#d64545" opacity={0.6} />
        </g>
      ))}
    </svg>
  ),
  sub: () => (
    <svg viewBox="0 0 110 50" width={110} height={50} shapeRendering="crispEdges">
      <path d="M20 14h56a18 11 0 0 1 0 22H20a18 11 0 0 1 0-22z" fill="#e8b93d" opacity={0.85} />
      <circle cx={70} cy={25} r={7} fill="#0d1a2a" />
      <circle cx={70} cy={25} r={4} fill="#9fdcff" opacity={0.8} />
      <rect x={34} y={4} width={12} height={10} fill="#c99a2c" opacity={0.85} />
      <rect x={8} y={20} width={12} height={10} fill="#c99a2c" opacity={0.85} />
      <path d="M84 22h26l-26 8z" fill="#9fdcff" opacity={0.16} />
    </svg>
  ),

  /* ——— стадион ————————————————————————————————— */

  scoreboard: () => (
    <svg viewBox="0 0 120 70" width={120} height={70} shapeRendering="crispEdges">
      <rect x={14} y={46} width={6} height={24} fill="#16281d" />
      <rect x={100} y={46} width={6} height={24} fill="#16281d" />
      <rect x={6} y={4} width={108} height={44} fill="#0d1a12" />
      <rect x={12} y={10} width={96} height={32} fill="#04120a" />
      {[18, 34, 62, 78].map((x, i) => (
        <rect key={i} x={x} y={18} width={10} height={16} fill="#5ef08a" opacity={0.65} />
      ))}
      <rect x={56} y={22} width={4} height={4} fill="#5ef08a" opacity={0.65} />
      <rect x={56} y={30} width={4} height={4} fill="#5ef08a" opacity={0.65} />
    </svg>
  ),
  tifo: () => (
    <svg viewBox="0 0 140 60" width={140} height={60} shapeRendering="crispEdges">
      <rect x={4} y={6} width={132} height={44} fill="#123a24" opacity={0.9} />
      <path d="M18 18h30v6H18zM18 30h52v6H18zM78 18h44v6H78z" fill="#ffd166" opacity={0.55} />
      <path d="M78 30h26v6H78z" fill="#5ef08a" opacity={0.5} />
      <rect x={4} y={4} width={132} height={3} fill="#0a2416" />
      <rect x={4} y={50} width={132} height={3} fill="#0a2416" />
    </svg>
  ),
  dugout: () => (
    <svg viewBox="0 0 130 50" width={130} height={50} shapeRendering="crispEdges">
      <path d="M4 18h122v10H4z" fill="#16281d" />
      <path d="M10 28h110v20H10z" fill="#0e1f16" opacity={0.9} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={18 + i * 18} y={32} width={10} height={12} fill="#2c4a35" />
      ))}
      <path d="M4 18q60-16 122 0z" fill="#1d3527" />
    </svg>
  ),
  tunnel: () => (
    <svg viewBox="0 0 110 60" width={110} height={60} shapeRendering="crispEdges">
      <path d="M10 58V26a45 24 0 0 1 90 0v32z" fill="#0a1710" />
      <path d="M20 58V30a35 18 0 0 1 70 0v28z" fill="#04100a" />
      <rect x={44} y={40} width={22} height={18} fill="#5ef08a" opacity={0.14} />
      <path d="M10 26a45 24 0 0 1 90 0" fill="none" stroke="#20402c" strokeWidth={3} />
    </svg>
  ),
  locker: () => (
    <svg viewBox="0 0 130 60" width={130} height={60} shapeRendering="crispEdges">
      <rect x={6} y={6} width={118} height={50} fill="#0e1f16" opacity={0.9} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={12 + i * 23} y={12} width={18} height={38} fill="#16301f" />
          <rect x={26 + i * 23} y={28} width={2} height={5} fill="#5ef08a" opacity={0.5} />
          <rect x={15 + i * 23} y={16} width={12} height={3} fill="#0a2416" />
        </g>
      ))}
    </svg>
  ),
  lamp: () => (
    <svg viewBox="0 0 50 90" width={50} height={90} shapeRendering="crispEdges">
      <rect x={22} y={16} width={4} height={74} fill="#16281d" />
      <rect x={12} y={6} width={26} height={12} fill="#1d3527" />
      <rect x={16} y={9} width={18} height={6} fill="#eaffd0" opacity={0.75} />
      <path d="M6 18h36l-8 26H14z" fill="#eaffd0" opacity={0.1} />
    </svg>
  ),
  smallstand: () => (
    <svg viewBox="0 0 150 44" width={150} height={44} shapeRendering="crispEdges">
      <path d="M0 44h150V18L124 8H26L0 18z" fill="#0e1f16" />
      {Array.from({ length: 18 }, (_, i) => (
        <rect
          key={i}
          x={10 + (i % 9) * 15}
          y={22 + Math.floor(i / 9) * 9}
          width={8}
          height={6}
          fill={i % 3 ? "#1d3527" : "#24402c"}
        />
      ))}
      <rect x={0} y={40} width={150} height={4} fill="#081410" />
    </svg>
  ),
  tornnet: () => (
    <svg viewBox="0 0 100 46" width={100} height={46} shapeRendering="crispEdges">
      <rect x={6} y={6} width={88} height={3} fill="#b9c9bd" opacity={0.7} />
      <rect x={6} y={6} width={3} height={40} fill="#b9c9bd" opacity={0.7} />
      <rect x={91} y={6} width={3} height={30} fill="#b9c9bd" opacity={0.5} />
      {[0, 1, 2, 4, 5, 7].map((i) => (
        <rect key={i} x={14 + i * 10} y={9} width={1} height={26 - (i % 3) * 7} fill="#fff" opacity={0.18} />
      ))}
      {[0, 2].map((i) => (
        <rect key={i} x={9} y={14 + i * 9} width={60 - i * 22} height={1} fill="#fff" opacity={0.18} />
      ))}
    </svg>
  ),
  puddle: () => (
    <svg viewBox="0 0 120 34" width={120} height={34} shapeRendering="crispEdges">
      <ellipse cx={60} cy={20} rx={54} ry={11} fill="#1c3a4a" opacity={0.65} />
      <ellipse cx={48} cy={17} rx={20} ry={4} fill="#7fd8ff" opacity={0.18} />
      <ellipse cx={82} cy={23} rx={12} ry={3} fill="#7fd8ff" opacity={0.12} />
    </svg>
  ),
  jackets: () => (
    <svg viewBox="0 0 120 44" width={120} height={44} shapeRendering="crispEdges">
      <path d="M8 26h26v18H8z" fill="#c0392b" opacity={0.8} />
      <path d="M12 20h18v6H12z" fill="#a5301f" opacity={0.8} />
      <path d="M86 24h26v20H86z" fill="#2f5aa8" opacity={0.8} />
      <path d="M90 18h18v6H90z" fill="#264a8c" opacity={0.8} />
      <path d="M34 40h52v4H34z" fill="#0d1a12" opacity={0.5} />
    </svg>
  ),
  muddyball: () => (
    <svg viewBox="0 0 60 44" width={60} height={44} shapeRendering="crispEdges">
      <ellipse cx={30} cy={38} rx={26} ry={6} fill="#2a1d10" opacity={0.7} />
      <circle cx={30} cy={22} r={15} fill="#d8d2c4" opacity={0.85} />
      <path d="M22 16h8v6h-8z" fill="#3a2c1c" />
      <path d="M38 24h5v6h-5zM22 30h6v5h-6z" fill="#3a2c1c" opacity={0.8} />
      <path d="M16 30q14 8 28 0" fill="none" stroke="#4a3a24" strokeWidth={3} opacity={0.6} />
    </svg>
  ),

  /* ——— степь ————————————————————————————————————— */

  roots: () => (
    <svg viewBox="0 0 120 70" width={120} height={70} shapeRendering="crispEdges">
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M${12 + i * 24} 0v${22 + (i % 3) * 10}q${i % 2 ? 8 : -8} 14 ${i % 2 ? 3 : -3} ${26 - (i % 2) * 8}`}
          fill="none"
          stroke="#8a6b3a"
          strokeWidth={2.4}
          opacity={0.45}
        />
      ))}
    </svg>
  ),
  skull: () => (
    <svg viewBox="0 0 90 56" width={90} height={56} shapeRendering="crispEdges">
      <path d="M24 16h36v22H24z" fill="#ded3bb" opacity={0.75} />
      <path d="M32 38h20v10H32z" fill="#ded3bb" opacity={0.75} />
      <rect x={30} y={22} width={8} height={8} fill="#2a1d10" />
      <rect x={46} y={22} width={8} height={8} fill="#2a1d10" />
      <path d="M24 18q-14-12-20-2 8 6 20 8zM60 18q14-12 20-2-8 6-20 8z" fill="#cbbfa4" opacity={0.7} />
      <path d="M14 50h62v4H14z" fill="#3a2a16" opacity={0.35} />
    </svg>
  ),
  pottery: () => (
    <svg viewBox="0 0 80 60" width={80} height={60} shapeRendering="crispEdges">
      <path d="M24 14h32l6 30a22 10 0 0 1-44 0z" fill="#a5643a" opacity={0.8} />
      <path d="M22 12h36v6H22z" fill="#8d5230" opacity={0.85} />
      <path d="M28 24h24v3H28zM26 32h28v3H26z" fill="#d8b48c" opacity={0.45} />
      <path d="M6 52h20l-4 6H10z" fill="#8d5230" opacity={0.5} />
    </svg>
  ),
  seam: () => (
    <svg viewBox="0 0 240 40" width={240} height={40} shapeRendering="crispEdges">
      <path d="M0 14h240v16H0z" fill="#0d0b09" opacity={0.85} />
      <path d="M0 12h240v3H0z" fill="#3a3128" opacity={0.6} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={14 + i * 34} y={18} width={12} height={7} fill="#2a2622" opacity={0.9} />
      ))}
    </svg>
  ),
  cart: () => (
    <svg viewBox="0 0 100 60" width={100} height={60} shapeRendering="crispEdges">
      <path d="M14 18h72v26H14z" fill="#4a4038" />
      <path d="M20 12h60v6H20z" fill="#5c5148" />
      <path d="M24 22h52v8H24z" fill="#141210" />
      <circle cx={30} cy={50} r={8} fill="#2a2622" />
      <circle cx={70} cy={50} r={8} fill="#2a2622" />
      <circle cx={30} cy={50} r={3} fill="#5c5148" />
      <circle cx={70} cy={50} r={3} fill="#5c5148" />
      <rect x={0} y={56} width={100} height={3} fill="#6b5a44" opacity={0.5} />
    </svg>
  ),
  timbers: () => (
    <svg viewBox="0 0 120 80" width={120} height={80} shapeRendering="crispEdges">
      <rect x={10} y={10} width={12} height={70} fill="#6b4c2a" opacity={0.85} />
      <rect x={98} y={10} width={12} height={70} fill="#6b4c2a" opacity={0.85} />
      <rect x={10} y={10} width={100} height={12} fill="#7d5a33" opacity={0.85} />
      <rect x={10} y={44} width={100} height={8} fill="#5c4124" opacity={0.7} />
      <path d="M22 22h76v22H22z" fill="#120d07" opacity={0.6} />
    </svg>
  ),
  copper: () => (
    <svg viewBox="0 0 140 60" width={140} height={60} shapeRendering="crispEdges">
      <path d="M0 26q34-14 70 0t70 0v10q-34 14-70 0T0 36z" fill="#2f7d6b" opacity={0.5} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={16 + i * 26} y={24 + (i % 2) * 8} width={10} height={8} fill="#48c9a9" opacity={0.55} />
      ))}
    </svg>
  ),
  drill: () => (
    <svg viewBox="0 0 60 100" width={60} height={100} shapeRendering="crispEdges">
      <rect x={24} y={0} width={12} height={60} fill="#5c5148" />
      <path d="M18 60h24v18H18z" fill="#7a6b5c" />
      <path d="M22 78h16l-8 18z" fill="#9a8a76" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={18} y={62 + i * 6} width={24} height={2} fill="#3a332c" />
      ))}
    </svg>
  ),
  crystals: () => (
    <svg viewBox="0 0 100 60" width={100} height={60} shapeRendering="crispEdges">
      {[
        [14, 30, 12, 30],
        [34, 18, 14, 42],
        [56, 26, 10, 34],
        [72, 12, 16, 48],
      ].map(([x, y, w, h], i) => (
        <path
          key={i}
          d={`M${x} ${y + h}L${x + w / 2} ${y}L${x + w} ${y + h}z`}
          fill="#9fd9ff"
          opacity={0.32 + (i % 2) * 0.14}
        />
      ))}
    </svg>
  ),
  fault: () => (
    <svg viewBox="0 0 240 60" width={240} height={60} shapeRendering="crispEdges">
      <path d="M0 24h96l14 12h130v6H104l-14-12H0z" fill="#0a0806" opacity={0.8} />
      <path d="M0 22h96l14 12h130v2H108l-14-12H0z" fill="#6b4a2a" opacity={0.5} />
    </svg>
  ),
  magma: () => (
    <svg viewBox="0 0 200 60" width={200} height={60} shapeRendering="crispEdges">
      <path d="M0 40q30-16 56 0t54 0 56 0 34 0v20H0z" fill="#7d2410" opacity={0.75} />
      <path d="M0 48q30-12 56 0t54 0 56 0 34 0v12H0z" fill="#e05716" opacity={0.6} />
      <path d="M0 54q30-8 56 0t54 0 56 0 34 0v6H0z" fill="#ffb03a" opacity={0.55} />
    </svg>
  ),
};

export default function DeepProps({
  world,
  pxPerM,
}: {
  world: WorldId;
  pxPerM: number;
}) {
  return (
    <>
      {DEEP[world].map(([m, kind, x, scale]) => {
        const Shape = shapes[kind];
        if (!Shape) return null;
        return (
          <div
            key={`${kind}-${m}`}
            className="ds-deep"
            style={{
              top: m * pxPerM,
              left: `${x}%`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              animationDelay: `-${m % 11}s`,
            }}
          >
            <Shape />
          </div>
        );
      })}
    </>
  );
}
