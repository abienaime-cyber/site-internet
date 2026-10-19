"use client";

import { useState } from "react";
import type { WatchVisual } from "@/lib/visual";
import { WatchArt } from "./watch-art";

type Slide = { kind: "photo"; id: number } | { kind: "art"; view: "front" | "angle" | "dial" };

export function Gallery({ photoIds, visual, alt }: { photoIds: number[]; visual: WatchVisual; alt: string }) {
  const slides: Slide[] = photoIds.length
    ? photoIds.map((id) => ({ kind: "photo", id }))
    : [
        { kind: "art", view: "front" },
        { kind: "art", view: "angle" },
        { kind: "art", view: "dial" },
      ];
  const [index, setIndex] = useState(0);
  const current = slides[Math.min(index, slides.length - 1)];

  const render = (slide: Slide, large: boolean) => {
    if (slide.kind === "photo") {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={`/api/photos/${slide.id}`} alt={alt} className="h-full w-full object-cover" />;
    }
    const transform = {
      front: "",
      angle: "rotate-[-14deg] scale-[0.92]",
      dial: "scale-[2.3] translate-y-[1%]",
    }[slide.view];
    return (
      <div className="grid h-full w-full place-items-center overflow-hidden">
        <WatchArt
          visual={visual}
          className={`${large ? "h-[86%]" : "h-[80%]"} w-auto ${transform} drop-shadow-[0_28px_30px_rgba(0,0,0,0.18)] transition-transform duration-500`}
        />
      </div>
    );
  };

  return (
    <div>
      <div className="stage relative aspect-square overflow-hidden rounded-[1.75rem] border border-line md:aspect-[4/3.6]">
        <div className="relative h-full w-full" role="img" aria-label={alt}>
          {render(current, true)}
        </div>
        {slides.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-text" : "w-1.5 bg-text/20"}`} />
            ))}
          </div>
        )}
      </div>
      {slides.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto">
          {slides.map((slide, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Vue ${i + 1}`}
              aria-current={i === index}
              className={`stage h-20 w-24 shrink-0 overflow-hidden rounded-[1.1rem] border transition ${
                i === index ? "border-text/80 ring-2 ring-text/15" : "border-line opacity-70 hover:opacity-100"
              }`}
            >
              {render(slide, false)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
