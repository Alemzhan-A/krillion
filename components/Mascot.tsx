import { TIERS, type TierId } from "@/lib/tiers";
import type { WorldId } from "@/lib/worlds";
import Krill from "./Krill";

/** мяч — тот, кто ныряет по футбольной пирамиде */
function Ball({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden>
      <path d="M5 1h6v1h2v1h1v2h1v6h-1v2h-1v1h-2v1H5v-1H3v-1H2v-2H1V5h1V3h1V2h2z" fill="#f4f8ff" />
      <path d="M7 4h2v1h1v2h-1v1H7V7H6V5h1z" fill={color} />
      <path d="M3 5h2v2H4v1H3zM11 5h2v3h-1V7h-1zM5 10h2v2H6v1H5zM9 10h2v3h-1v-1H9z" fill={color} opacity={0.75} />
      <path d="M5 1h6v1H5zM2 5h1v6H2zM13 5h1v6h-1zM5 14h6v1H5z" fill="#0d1a12" opacity={0.35} />
    </svg>
  );
}

/** конь — тот, кто уходит вглубь степи */
function Horse({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden>
      {/* корпус */}
      <path d="M3 7h8v4H3z" fill={color} />
      {/* шея и голова */}
      <path d="M10 5h3v2h1v2h-3V7h-1z" fill={color} />
      <path d="M12 3h1v2h-1z" fill={color} opacity={0.85} />
      {/* грива */}
      <path d="M9 4h1v3H9zM10 3h1v2h-1z" fill={color} opacity={0.6} />
      {/* хвост */}
      <path d="M1 7h2v5H1V9h1V8H1z" fill={color} opacity={0.65} />
      {/* ноги */}
      <path d="M4 11h1v4H4zM6 11h1v4H6zM8 11h1v4H8zM10 11h1v4h-1z" fill={color} opacity={0.85} />
      {/* глаз и морда */}
      <rect x={12} y={6} width={1} height={1} fill="#1a1008" />
      <path d="M13 8h1v1h-1z" fill="#1a1008" opacity={0.5} />
    </svg>
  );
}

export default function Mascot({
  world,
  size = 54,
  tier = null,
  glow = false,
}: {
  world: WorldId;
  size?: number;
  tier?: TierId | null;
  glow?: boolean;
}) {
  if (world === "ocean") return <Krill size={size} tier={tier} glow={glow} />;

  const color = tier ? TIERS[tier].color : world === "stadium" ? "#5ef08a" : "#f2c46b";
  const style = {
    filter: glow ? `drop-shadow(0 0 8px ${color})` : `drop-shadow(0 0 3px ${color}66)`,
  };

  return (
    <span style={style}>
      {world === "stadium" ? (
        <Ball size={size} color={color} />
      ) : (
        <Horse size={size} color={color} />
      )}
    </span>
  );
}
