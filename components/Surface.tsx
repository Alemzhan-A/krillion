import type { WorldId } from "@/lib/worlds";

/**
 * Мир над «поверхностью»: у каждого режима свой горизонт.
 * Всё живёт в координатах мира выше нуля (отрицательный top), поэтому
 * уплывает вверх вместе со спуском.
 */

/* ——— океан ————————————————————————————————————— */

function CargoShip() {
  return (
    <svg viewBox="0 0 120 44" width={120} height={44} shapeRendering="crispEdges" aria-hidden>
      <rect x={8} y={30} width={104} height={9} fill="#1b2b3f" />
      <path d="M8 30h104l-8 9H16z" fill="#16232f" />
      <rect x={20} y={20} width={58} height={10} fill="#243449" />
      <rect x={26} y={14} width={8} height={6} fill="#c9553d" />
      <rect x={38} y={14} width={8} height={6} fill="#c9553d" />
      <rect x={50} y={14} width={8} height={6} fill="#3d6b8a" />
      <rect x={62} y={14} width={8} height={6} fill="#c9553d" />
      <rect x={84} y={16} width={16} height={14} fill="#2c3f57" />
      <rect x={88} y={19} width={8} height={4} fill="#8fd0f0" />
      <rect x={103} y={6} width={2} height={12} fill="#2c3f57" />
    </svg>
  );
}

function SailBoat() {
  return (
    <svg viewBox="0 0 54 52" width={54} height={52} shapeRendering="crispEdges" aria-hidden>
      <rect x={26} y={6} width={2} height={32} fill="#2c3f57" />
      <path d="M25 8L9 36h16z" fill="#e6eef8" />
      <path d="M29 12l14 24H29z" fill="#c8d8ea" />
      <path d="M4 38h46l-7 8H11z" fill="#1b2b3f" />
    </svg>
  );
}

function FishingBoat() {
  return (
    <svg viewBox="0 0 46 30" width={46} height={30} shapeRendering="crispEdges" aria-hidden>
      <rect x={20} y={4} width={2} height={12} fill="#2c3f57" />
      <rect x={14} y={16} width={16} height={6} fill="#2c3f57" />
      <path d="M4 22h38l-6 6H10z" fill="#1b2b3f" />
    </svg>
  );
}

function Buoy() {
  return (
    <svg viewBox="0 0 14 26" width={14} height={26} shapeRendering="crispEdges" aria-hidden>
      <rect x={6} y={0} width={2} height={10} fill="#2c3f57" />
      <rect x={3} y={2} width={8} height={3} fill="#ffd166" />
      <path d="M2 10h10l-2 10H4z" fill="#c9553d" />
    </svg>
  );
}

/* ——— стадион ——————————————————————————————————— */

function Floodlight() {
  return (
    <svg viewBox="0 0 40 96" width={40} height={96} shapeRendering="crispEdges" aria-hidden>
      <rect x={18} y={26} width={4} height={70} fill="#1c2b22" />
      <rect x={14} y={80} width={12} height={3} fill="#1c2b22" />
      <rect x={6} y={6} width={28} height={20} fill="#243529" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <rect
            key={`${r}-${c}`}
            x={9 + c * 6}
            y={9 + r * 6}
            width={4}
            height={4}
            fill="#f4ffe8"
            opacity={0.9}
          />
        )),
      )}
    </svg>
  );
}

function Stand() {
  return (
    <svg viewBox="0 0 180 46" width={180} height={46} shapeRendering="crispEdges" aria-hidden>
      <path d="M0 46h180V16L150 6H30L0 16z" fill="#12241a" />
      {Array.from({ length: 34 }, (_, i) => (
        <rect
          key={i}
          x={6 + (i % 17) * 10}
          y={20 + Math.floor(i / 17) * 8}
          width={6}
          height={5}
          fill={["#2c4a35", "#3a5c43", "#24402c"][i % 3]}
        />
      ))}
      <rect x={0} y={42} width={180} height={4} fill="#0d1a12" />
    </svg>
  );
}

function CornerFlag() {
  return (
    <svg viewBox="0 0 20 34" width={20} height={34} shapeRendering="crispEdges" aria-hidden>
      <rect x={4} y={0} width={2} height={34} fill="#d8e6d8" />
      <path d="M6 2h12v8H6z" fill="#ffd166" />
    </svg>
  );
}

function GoalNet() {
  return (
    <svg viewBox="0 0 90 40" width={90} height={40} shapeRendering="crispEdges" aria-hidden>
      <rect x={4} y={4} width={82} height={3} fill="#eaf4ea" />
      <rect x={4} y={4} width={3} height={36} fill="#eaf4ea" />
      <rect x={83} y={4} width={3} height={36} fill="#eaf4ea" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={11 + i * 9} y={7} width={1} height={33} fill="#ffffff" opacity={0.25} />
      ))}
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={i} x={7} y={12 + i * 8} width={76} height={1} fill="#ffffff" opacity={0.25} />
      ))}
    </svg>
  );
}

/* ——— степь ————————————————————————————————————— */

function Yurt() {
  return (
    <svg viewBox="0 0 64 40" width={64} height={40} shapeRendering="crispEdges" aria-hidden>
      <path d="M4 40V22l28-16 28 16v18z" fill="#efe3cd" />
      <path d="M4 22l28-16 28 16z" fill="#f7efe0" />
      <rect x={26} y={26} width={12} height={14} fill="#8a5a2b" />
      <rect x={29} y={3} width={6} height={5} fill="#c98b3a" />
      <rect x={4} y={30} width={56} height={2} fill="#c9b78f" />
    </svg>
  );
}

function Horse() {
  return (
    <svg viewBox="0 0 44 30" width={44} height={30} shapeRendering="crispEdges" aria-hidden>
      <path d="M6 14h22v8H6z" fill="#5b3a1e" />
      <path d="M28 8h6v6h-4v8h-2z" fill="#5b3a1e" />
      <path d="M32 4h3v5h-3z" fill="#5b3a1e" />
      <rect x={8} y={22} width={3} height={8} fill="#4a2f18" />
      <rect x={15} y={22} width={3} height={8} fill="#4a2f18" />
      <rect x={23} y={22} width={3} height={8} fill="#4a2f18" />
      <path d="M2 14h5v10H2z" fill="#4a2f18" />
    </svg>
  );
}

function Eagle() {
  return (
    <svg viewBox="0 0 70 22" width={70} height={22} shapeRendering="crispEdges" aria-hidden>
      <path
        d="M2 12q16-10 31-2 15-8 31 2"
        fill="none"
        stroke="rgba(70,45,20,0.7)"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <rect x={32} y={9} width={6} height={4} fill="rgba(70,45,20,0.75)" />
    </svg>
  );
}

function Rocket() {
  return (
    <svg viewBox="0 0 20 70" width={20} height={70} shapeRendering="crispEdges" aria-hidden>
      <path d="M8 0h4l3 14v42H5V14z" fill="#dfe6ee" />
      <path d="M5 40h10v16H5z" fill="#c2ccd8" />
      <path d="M2 48h3v12H2zM15 48h3v12h-3z" fill="#a8b4c2" />
      <rect x={7} y={56} width={6} height={8} fill="#ff8a3d" opacity={0.85} />
      <rect x={8} y={62} width={4} height={8} fill="#ffd166" opacity={0.7} />
    </svg>
  );
}

/* ——— общие декорации ——————————————————————————— */

function Cloud({ w, fill }: { w: number; fill: string }) {
  return (
    <svg viewBox="0 0 64 22" width={w} height={(w / 64) * 22} aria-hidden>
      <path
        d="M10 18h44a8 8 0 0 0 0-9 11 11 0 0 0-19-5A9 9 0 0 0 22 9a7 7 0 0 0-12 9z"
        fill={fill}
      />
    </svg>
  );
}

function Birds() {
  return (
    <svg viewBox="0 0 60 18" width={60} height={18} aria-hidden>
      {[
        [4, 8],
        [22, 3],
        [38, 11],
      ].map(([x, y]) => (
        <path
          key={`${x}-${y}`}
          d={`M${x} ${y}q4-4 8 0q4-4 8 0`}
          fill="none"
          stroke="rgba(40,60,84,0.55)"
          strokeWidth={1.4}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

export default function Surface({ world }: { world: WorldId }) {
  if (world === "stadium") {
    return (
      <div className="ds-above" aria-hidden>
        <div className="ds-moon" style={{ top: -330, left: "16%" }} />

        {/* мачты освещения заливают поле сверху */}
        <div className="ds-mast" style={{ top: -96, left: "6%" }}>
          <Floodlight />
        </div>
        <div className="ds-mast" style={{ top: -96, left: "88%" }}>
          <Floodlight />
        </div>
        <div className="ds-mast" style={{ top: -120, left: "30%" }}>
          <Floodlight />
        </div>
        <div className="ds-mast" style={{ top: -120, left: "66%" }}>
          <Floodlight />
        </div>

        <div className="ds-cloud ds-drift-b" style={{ top: -250, left: "44%" }}>
          <Cloud w={110} fill="rgba(180,205,225,0.22)" />
        </div>

        <div className="ds-vessel" style={{ left: "8%" }}>
          <Stand />
        </div>
        <div className="ds-vessel" style={{ left: "62%" }}>
          <Stand />
        </div>
        <div className="ds-vessel ds-bob-c" style={{ left: "38%" }}>
          <GoalNet />
        </div>
        <div className="ds-vessel" style={{ left: "2%" }}>
          <CornerFlag />
        </div>
        <div className="ds-vessel" style={{ left: "95%" }}>
          <CornerFlag />
        </div>
      </div>
    );
  }

  if (world === "steppe") {
    return (
      <div className="ds-above" aria-hidden>
        <div className="ds-sun ds-sun-low" style={{ top: -180, left: "78%" }} />

        <div className="ds-cloud ds-drift-a" style={{ top: -380, left: "10%" }}>
          <Cloud w={140} fill="rgba(255,238,205,0.75)" />
        </div>
        <div className="ds-cloud ds-drift-c" style={{ top: -290, left: "50%" }}>
          <Cloud w={180} fill="rgba(255,228,190,0.6)" />
        </div>
        <div className="ds-cloud ds-drift-b" style={{ top: -230, left: "24%" }}>
          <Cloud w={90} fill="rgba(255,240,215,0.5)" />
        </div>

        <div className="ds-birds ds-drift-b" style={{ top: -200, left: "58%" }}>
          <Eagle />
        </div>

        <div className="ds-vessel" style={{ left: "12%" }}>
          <Yurt />
        </div>
        <div className="ds-vessel" style={{ left: "30%" }}>
          <Horse />
        </div>
        <div className="ds-vessel" style={{ left: "40%" }}>
          <Horse />
        </div>
        <div className="ds-vessel" style={{ left: "86%" }}>
          <Rocket />
        </div>
        <div className="ds-vessel" style={{ left: "68%" }}>
          <Yurt />
        </div>
      </div>
    );
  }

  return (
    <div className="ds-above" aria-hidden>
      <div className="ds-sun" style={{ top: -300, left: "72%" }} />

      <div className="ds-cloud ds-drift-a" style={{ top: -420, left: "8%" }}>
        <Cloud w={130} fill="rgba(255,255,255,0.82)" />
      </div>
      <div className="ds-cloud ds-drift-b" style={{ top: -352, left: "58%" }}>
        <Cloud w={92} fill="rgba(255,255,255,0.82)" />
      </div>
      <div className="ds-cloud ds-drift-c" style={{ top: -268, left: "26%" }}>
        <Cloud w={168} fill="rgba(255,255,255,0.82)" />
      </div>
      <div className="ds-cloud ds-drift-b" style={{ top: -210, left: "76%" }}>
        <Cloud w={74} fill="rgba(255,255,255,0.82)" />
      </div>

      <div className="ds-birds ds-drift-a" style={{ top: -172, left: "40%" }}>
        <Birds />
      </div>

      <div className="ds-vessel ds-bob-a" style={{ left: "12%" }}>
        <CargoShip />
      </div>
      <div className="ds-vessel ds-bob-b" style={{ left: "58%" }}>
        <SailBoat />
      </div>
      <div className="ds-vessel ds-bob-c" style={{ left: "82%" }}>
        <FishingBoat />
      </div>
      <div className="ds-vessel ds-bob-b" style={{ left: "42%" }}>
        <Buoy />
      </div>
    </div>
  );
}
