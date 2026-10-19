import { useId } from "react";
import type { WatchVisual } from "@/lib/visual";

const METALS: Record<WatchVisual["metal"], [string, string, string]> = {
  steel: ["#f4f5f7", "#9aa0a8", "#5d636c"],
  titanium: ["#c9cbcd", "#7f8387", "#4a4d51"],
  gold: ["#fbe7b2", "#cfa456", "#8a6326"],
  "two-tone": ["#f4f5f7", "#cfa456", "#5d636c"],
  black: ["#5a5d63", "#26282c", "#0f1012"],
};

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(((n >> 16) & 255) + amount);
  const g = clamp(((n >> 8) & 255) + amount);
  const b = clamp((n & 255) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function isLight(hex: string): boolean {
  const n = parseInt(hex.replace("#", ""), 16);
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 > 150;
}

const CX = 100;
const CY = 140;

function polar(r: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
}

function arc(r1: number, r2: number, from: number, to: number): string {
  const [x1, y1] = polar(r1, from);
  const [x2, y2] = polar(r1, to);
  const [x3, y3] = polar(r2, to);
  const [x4, y4] = polar(r2, from);
  const large = to - from > 180 ? 1 : 0;
  return `M${x1} ${y1} A${r1} ${r1} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${r2} ${r2} 0 ${large} 0 ${x4} ${y4} Z`;
}

function octagon(r: number): string {
  const pts = Array.from({ length: 8 }, (_, i) => polar(r, 22.5 + i * 45));
  return `M${pts.map((p) => p.join(" ")).join(" L")} Z`;
}

export function WatchArt({ visual, className }: { visual: WatchVisual; className?: string }) {
  const id = useId().replace(/:/g, "");
  const [hi, mid, lo] = METALS[visual.metal];
  const lightDial = isLight(visual.dial);
  const ink = lightDial ? "#1a1b1f" : "#eceae4";
  const accent = visual.accent ?? (lightDial ? "#1a1b1f" : "#d9d6cf");
  const caseR = visual.shape === "round" ? 62 : 64;
  const dialR = visual.shape === "round" ? (visual.bezel === "none" ? 54 : 47) : 47;
  const subdials = visual.subdials ?? 0;
  const strapColor = visual.strapColor ?? "#18191c";

  const caseShape = (r: number, fill: string, extra?: { stroke?: string; strokeWidth?: number }) => {
    switch (visual.shape) {
      case "octagon":
        return <path d={octagon(r)} fill={fill} strokeLinejoin="round" {...extra} />;
      case "square":
        return <rect x={CX - r * 0.9} y={CY - r * 0.9} width={r * 1.8} height={r * 1.8} rx={r * 0.32} fill={fill} {...extra} />;
      case "cushion":
        return <rect x={CX - r * 0.92} y={CY - r * 0.92} width={r * 1.84} height={r * 1.84} rx={r * 0.62} fill={fill} {...extra} />;
      default:
        return <circle cx={CX} cy={CY} r={r} fill={fill} {...extra} />;
    }
  };

  const strap = (top: boolean) => {
    const y0 = top ? 0 : 205;
    const h = 75;
    if (visual.strap === "bracelet") {
      const rows = 5;
      return (
        <g>
          {Array.from({ length: rows }, (_, i) => {
            const y = top ? y0 + i * 15 : y0 + i * 15;
            const w = 64 - (top ? (rows - 1 - i) : i) * 1.6;
            return (
              <g key={i}>
                <rect x={CX - w / 2} y={y} width={w * 0.28} height={13.5} rx={3} fill={`url(#${id}-metal)`} />
                <rect x={CX - w / 2 + w * 0.3} y={y} width={w * 0.4} height={13.5} rx={3} fill={visual.metal === "two-tone" ? hi.replace("#f4f5f7", "#e2bd6e") : `url(#${id}-metalv)`} />
                <rect x={CX + w / 2 - w * 0.28} y={y} width={w * 0.28} height={13.5} rx={3} fill={`url(#${id}-metal)`} />
              </g>
            );
          })}
        </g>
      );
    }
    const isRubber = visual.strap === "rubber";
    return (
      <g>
        <rect x={CX - 31} y={y0} width={62} height={h} rx={top ? 6 : 6} fill={strapColor} />
        <rect x={CX - 31} y={y0} width={62} height={h} rx={6} fill={`url(#${id}-strapshade)`} />
        {isRubber ? (
          Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={CX - 22} y={y0 + 8 + i * 11} width={44} height={3} rx={1.5} fill="#000" opacity={0.35} />
          ))
        ) : (
          <rect x={CX - 26} y={y0 - 4} width={52} height={h + 8} rx={4} fill="none" stroke="#ffffff" strokeOpacity={0.22} strokeDasharray="2.5 3" />
        )}
      </g>
    );
  };

  const indices = Array.from({ length: 12 }, (_, i) => {
    const deg = i * 30;
    if (subdials === 3 && (i === 3 || i === 6 || i === 9)) return null;
    if (subdials === 2 && (i === 3 || i === 9)) return null;
    if (visual.date && !subdials && i === 3) return null;
    const [x, y] = polar(dialR - 8, deg);
    const long = i === 0;
    return (
      <rect
        key={i}
        x={x - (long ? 3.2 : 1.8)}
        y={y - (long ? 6 : 5)}
        width={long ? 6.4 : 3.6}
        height={long ? 12 : 10}
        rx={1}
        fill={accent === "#121316" ? "#121316" : `url(#${id}-index)`}
        transform={`rotate(${deg} ${x} ${y})`}
      />
    );
  });

  const minuteTicks = Array.from({ length: 60 }, (_, i) => {
    if (i % 5 === 0) return null;
    const [x1, y1] = polar(dialR - 2, i * 6);
    const [x2, y2] = polar(dialR - 4.5, i * 6);
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeOpacity={0.45} strokeWidth={0.7} />;
  });

  const bezel = () => {
    const outer = 61;
    const inner = dialR + 1;
    switch (visual.bezel) {
      case "diver":
      case "tachy": {
        const color = visual.bezelColor ?? "#121316";
        return (
          <g>
            <circle cx={CX} cy={CY} r={outer} fill={color} />
            <circle cx={CX} cy={CY} r={outer} fill={`url(#${id}-gloss)`} />
            {Array.from({ length: visual.bezel === "diver" ? 12 : 48 }, (_, i) => {
              const step = visual.bezel === "diver" ? 30 : 7.5;
              const deg = i * step;
              if (visual.bezel === "diver" && i === 0) return null;
              const [x1, y1] = polar(outer - 2.5, deg);
              const [x2, y2] = polar(outer - (visual.bezel === "diver" ? 8 : 5), deg);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={visual.accent ?? "#e9e6dd"} strokeOpacity={0.85} strokeWidth={visual.bezel === "diver" ? 2.2 : 0.9} />;
            })}
            {visual.bezel === "diver" && (
              <path d={`M${CX - 4.5} ${CY - outer + 2.5} L${CX + 4.5} ${CY - outer + 2.5} L${CX} ${CY - outer + 9} Z`} fill={visual.accent ?? "#f2efe6"} />
            )}
          </g>
        );
      }
      case "gmt": {
        const top = visual.bezelColor2 ?? "#a3242c";
        const bottom = visual.bezelColor ?? "#1f3f8f";
        return (
          <g>
            <path d={arc(outer, inner, 270.01, 449.99)} fill={top} />
            <path d={arc(outer, inner, 90, 270)} fill={bottom} />
            <circle cx={CX} cy={CY} r={outer} fill={`url(#${id}-gloss)`} />
            {Array.from({ length: 24 }, (_, i) => {
              const [x1, y1] = polar(outer - 2.5, i * 15);
              const [x2, y2] = polar(outer - (i % 2 ? 5 : 8), i * 15);
              return i === 0 ? null : <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#efece4" strokeOpacity={0.85} strokeWidth={i % 2 ? 1 : 2} />;
            })}
            <path d={`M${CX - 4.5} ${CY - outer + 2.5} L${CX + 4.5} ${CY - outer + 2.5} L${CX} ${CY - outer + 9} Z`} fill="#f2efe6" />
          </g>
        );
      }
      case "fluted":
        return (
          <g>
            <circle cx={CX} cy={CY} r={outer} fill={`url(#${id}-metal)`} />
            {Array.from({ length: 72 }, (_, i) => {
              const [x1, y1] = polar(outer - 0.5, i * 5);
              const [x2, y2] = polar(inner + 0.5, i * 5);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 2 ? lo : hi} strokeOpacity={0.7} strokeWidth={1.4} />;
            })}
          </g>
        );
      case "smooth":
        return <circle cx={CX} cy={CY} r={outer} fill={`url(#${id}-ring)`} />;
      default:
        return null;
    }
  };

  const hand = (deg: number, length: number, width: number, color: string, tail = 10) => (
    <g transform={`rotate(${deg} ${CX} ${CY})`}>
      <path
        d={`M${CX - width / 2} ${CY + tail} L${CX - width / 2} ${CY - length + width} L${CX} ${CY - length} L${CX + width / 2} ${CY - length + width} L${CX + width / 2} ${CY + tail} Z`}
        fill={color}
      />
    </g>
  );

  const handColor = lightDial ? "#1d1e22" : "#ecebe6";
  const subColor = lightDial ? shade(visual.dial, -150) : shade(visual.dial, 22);

  return (
    <svg viewBox="0 0 200 280" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={hi} />
          <stop offset="0.45" stopColor={mid} />
          <stop offset="0.7" stopColor={hi} />
          <stop offset="1" stopColor={lo} />
        </linearGradient>
        <linearGradient id={`${id}-metalv`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={mid} />
          <stop offset="0.5" stopColor={hi} />
          <stop offset="1" stopColor={mid} />
        </linearGradient>
        <linearGradient id={`${id}-ring`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={hi} />
          <stop offset="0.5" stopColor={lo} />
          <stop offset="1" stopColor={hi} />
        </linearGradient>
        <radialGradient id={`${id}-dial`} cx="0.42" cy="0.35" r="0.75">
          <stop offset="0" stopColor={shade(visual.dial, lightDial ? 12 : 38)} />
          <stop offset="0.6" stopColor={visual.dial} />
          <stop offset="1" stopColor={shade(visual.dial, lightDial ? -30 : -14)} />
        </radialGradient>
        <linearGradient id={`${id}-gloss`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id={`${id}-index`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={lightDial ? "#3a3c42" : "#ffffff"} />
          <stop offset="1" stopColor={lightDial ? "#121316" : "#b9bcc2"} />
        </linearGradient>
        <linearGradient id={`${id}-strapshade`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.45" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </linearGradient>
        <radialGradient id={`${id}-shadow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx={CX + 6} cy={CY + 12} rx={78} ry={84} fill={`url(#${id}-shadow)`} />
      {strap(true)}
      {strap(false)}

      {/* cornes */}
      <path d={`M${CX - 38} 62 L${CX + 38} 62 L${CX + 46} 100 L${CX - 46} 100 Z`} fill={`url(#${id}-metal)`} />
      <path d={`M${CX - 46} 180 L${CX + 46} 180 L${CX + 38} 218 L${CX - 38} 218 Z`} fill={`url(#${id}-metal)`} />

      {/* couronne et poussoirs */}
      <rect x={CX + caseR - 3} y={CY - 8} width={11} height={16} rx={3} fill={`url(#${id}-metalv)`} />
      {subdials > 0 && (
        <>
          <rect x={CX + caseR - 9} y={CY - 38} width={9} height={10} rx={2.5} fill={`url(#${id}-metalv)`} transform={`rotate(-30 ${CX + caseR - 4} ${CY - 33})`} />
          <rect x={CX + caseR - 9} y={CY + 28} width={9} height={10} rx={2.5} fill={`url(#${id}-metalv)`} transform={`rotate(30 ${CX + caseR - 4} ${CY + 33})`} />
        </>
      )}

      {caseShape(caseR, `url(#${id}-metal)`)}
      {caseShape(caseR - 1.5, "none", { stroke: "#ffffff", strokeWidth: 0.8 })}
      {visual.shape === "round" ? bezel() : caseShape(caseR - 6, `url(#${id}-ring)`)}
      {visual.shape === "octagon" &&
        Array.from({ length: 8 }, (_, i) => {
          const [x, y] = polar(caseR - 10, 22.5 + i * 45);
          return <circle key={i} cx={x} cy={y} r={2.2} fill={mid} stroke={lo} strokeWidth={0.6} />;
        })}

      {visual.shape === "round" ? (
        <circle cx={CX} cy={CY} r={dialR} fill={`url(#${id}-dial)`} />
      ) : visual.shape === "octagon" ? (
        <rect x={CX - dialR + 2} y={CY - dialR + 2} width={(dialR - 2) * 2} height={(dialR - 2) * 2} rx={10} fill={`url(#${id}-dial)`} />
      ) : (
        <rect x={CX - dialR} y={CY - dialR} width={dialR * 2} height={dialR * 2} rx={visual.shape === "cushion" ? 22 : 10} fill={`url(#${id}-dial)`} />
      )}

      {visual.shape === "octagon" &&
        Array.from({ length: 9 }, (_, i) =>
          Array.from({ length: 9 }, (_, j) => (
            <rect key={`${i}-${j}`} x={CX - dialR + 8 + i * 9.4} y={CY - dialR + 8 + j * 9.4} width={6.4} height={6.4} rx={1} fill="#000" opacity={0.14} />
          )),
        )}

      {visual.shape === "round" && minuteTicks}
      {indices}

      {subdials > 0 &&
        (subdials === 3 ? [270, 90, 180] : [270, 90]).map((deg) => {
          const [x, y] = polar(dialR * 0.48, deg);
          return (
            <g key={deg}>
              <circle cx={x} cy={y} r={dialR * 0.24} fill={subColor} stroke={lightDial ? "#00000040" : "#ffffff30"} strokeWidth={0.8} />
              {Array.from({ length: 12 }, (_, k) => {
                const a = ((k * 30 - 90) * Math.PI) / 180;
                const r1 = dialR * 0.24 - 1.2;
                const r2 = dialR * 0.24 - 3.6;
                return (
                  <line key={k} x1={x + r1 * Math.cos(a)} y1={y + r1 * Math.sin(a)} x2={x + r2 * Math.cos(a)} y2={y + r2 * Math.sin(a)} stroke={lightDial ? "#eceae4" : "#eceae4"} strokeOpacity={0.6} strokeWidth={0.6} />
                );
              })}
              <line x1={x} y1={y} x2={x + 6 * Math.cos((deg * 7 * Math.PI) / 180)} y2={y + 6 * Math.sin((deg * 7 * Math.PI) / 180)} stroke="#eceae4" strokeWidth={1} />
            </g>
          );
        })}

      {visual.date && !subdials && (
        <g>
          <rect x={CX + dialR - 22} y={CY - 6} width={14} height={12} rx={1.5} fill="#f6f5f1" stroke={hi} strokeWidth={1} />
          <text x={CX + dialR - 15} y={CY + 3.6} textAnchor="middle" fontSize={9} fontWeight={600} fill="#1a1b1f" fontFamily="Arial, sans-serif">
            18
          </text>
        </g>
      )}

      {hand(305, dialR * 0.55, 6, handColor)}
      {hand(60, dialR * 0.85, 4.4, handColor)}
      <g transform={`rotate(196 ${CX} ${CY})`}>
        <line x1={CX} y1={CY + 14} x2={CX} y2={CY - dialR + 6} stroke={visual.accent && visual.accent !== "#121316" ? visual.accent : "#c8372d"} strokeWidth={1.2} />
      </g>
      <circle cx={CX} cy={CY} r={3.2} fill={handColor} />
      <circle cx={CX} cy={CY} r={1.3} fill={lo} />

      {/* reflet du verre */}
      <path d={`M${CX - dialR * 0.8} ${CY - dialR * 0.3} Q${CX - dialR * 0.2} ${CY - dialR * 1.05} ${CX + dialR * 0.6} ${CY - dialR * 0.7} Q${CX} ${CY - dialR * 0.6} ${CX - dialR * 0.8} ${CY - dialR * 0.3} Z`} fill="#fff" opacity={0.07} />
    </svg>
  );
}
