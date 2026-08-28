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

/** беркут — тот, кто уходит вглубь степи */
function Eagle({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden>
      <path d="M6 5h4v6H6z" fill={color} />
      <path d="M1 6h5v2H2v1H1zM10 6h5v3h-1V8h-4z" fill={color} opacity={0.8} />
      <path d="M7 3h2v2H7z" fill={color} />
      <rect x={9} y={3} width={1} height={1} fill="#1a1008" />
      <path d="M10 4h2v1h-2z" fill="#e8a33d" />
      <path d="M6 11h1v3H6zM9 11h1v3H9z" fill="#e8a33d" opacity={0.9} />
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
        <Eagle size={size} color={color} />
      )}
    </span>
  );
}
