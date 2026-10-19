// Description d'une montre dessinée en SVG (aucune photo externe).
export type WatchVisual = {
  shape: "round" | "octagon" | "square" | "cushion";
  metal: "steel" | "gold" | "two-tone" | "black" | "titanium";
  dial: string;
  bezel: "smooth" | "fluted" | "diver" | "tachy" | "gmt" | "none";
  bezelColor?: string;
  bezelColor2?: string;
  strap: "bracelet" | "leather" | "rubber";
  strapColor?: string;
  subdials?: 0 | 2 | 3;
  date?: boolean;
  accent?: string;
};

export const DEFAULT_VISUAL: WatchVisual = {
  shape: "round",
  metal: "steel",
  dial: "#1d2129",
  bezel: "smooth",
  strap: "bracelet",
  date: true,
};

export function parseVisual(raw: string | null | undefined): WatchVisual {
  if (!raw) return DEFAULT_VISUAL;
  try {
    return { ...DEFAULT_VISUAL, ...(JSON.parse(raw) as Partial<WatchVisual>) };
  } catch {
    return DEFAULT_VISUAL;
  }
}
