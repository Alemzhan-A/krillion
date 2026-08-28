import type { TierId } from "@/lib/tiers";
import { TIERS } from "@/lib/tiers";

/** пиксельный криль — маскот погружения */
export default function Krill({
  size = 64,
  tier = null,
  glow = false,
}: {
  size?: number;
  tier?: TierId | null;
  glow?: boolean;
}) {
  const color = tier ? TIERS[tier].color : "var(--tier-schooler)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      aria-hidden
      style={{
        filter: glow ? `drop-shadow(0 0 6px ${color})` : `drop-shadow(0 0 3px ${color}66)`,
      }}
    >
      {/* тело */}
      <path
        d="M4 6h7v1h1v3h-1v1H4V6z"
        fill={color}
        opacity={0.92}
      />
      {/* хвост */}
      <path d="M2 6h2v5H2V9H1V8h1V6z" fill={color} opacity={0.7} />
      {/* сегменты панциря */}
      <path d="M6 6h1v5H6V6zM8 6h1v5H8V6z" fill="var(--color-abyss)" opacity={0.35} />
      {/* глаз */}
      <rect x={10} y={7} width={1} height={1} fill="#050a14" />
      {/* усики */}
      <path d="M12 5h1V4h1M12 12h1v1h1" stroke={color} strokeWidth={0.6} fill="none" opacity={0.8} />
      {/* лапки */}
      <path d="M5 11h1v1H5zM7 11h1v1H7zM9 11h1v1H9z" fill={color} opacity={0.55} />
    </svg>
  );
}
