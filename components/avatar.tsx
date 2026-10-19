import { initials } from "@/lib/format";

export function Avatar({ name, hue, size = 40 }: { name: string; hue: number; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white ring-1 ring-black/5"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(140deg, hsl(${hue} 45% 52%), hsl(${(hue + 40) % 360} 40% 26%))`,
      }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
