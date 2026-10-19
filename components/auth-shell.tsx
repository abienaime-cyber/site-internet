import { WatchArt } from "./watch-art";
import { LogoMark } from "./logo";
import type { WatchVisual } from "@/lib/visual";

const VISUAL: WatchVisual = { shape: "round", metal: "steel", dial: "#1f3a63", bezel: "fluted", strap: "bracelet", date: true };

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto grid min-h-[calc(100dvh-7rem)] max-w-5xl items-center gap-10 px-5 pt-[max(env(safe-area-inset-top),1.5rem)] md:grid-cols-2 md:pt-10">
      <div className="relative hidden h-[30rem] overflow-hidden rounded-[2rem] md:block">
        <div className="stage absolute inset-0" />
        <WatchArt visual={VISUAL} className="absolute left-1/2 top-1/2 h-[26rem] w-auto -translate-x-1/2 -translate-y-1/2 rotate-[10deg] drop-shadow-[0_30px_40px_rgba(0,0,0,0.18)]" />
        <p className="absolute bottom-6 left-6 right-6 text-2xl font-light leading-snug">
          Le temps se transmet.
          <br />
          <span className="font-bold">Les belles montres aussi.</span>
        </p>
      </div>
      <div className="w-full max-w-sm justify-self-center">
        <div className="mb-8 flex items-center gap-2 text-muted md:hidden">
          <LogoMark size={24} />
          <span className="text-sm font-semibold uppercase tracking-[0.2em]">Remontoir</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mb-7 mt-1.5 text-[15px] text-muted">{subtitle}</p>
        {children}
      </div>
    </main>
  );
}
