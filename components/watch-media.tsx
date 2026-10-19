import { parseVisual } from "@/lib/visual";
import { WatchArt } from "./watch-art";

export function WatchMedia({
  photoId,
  visual,
  alt,
  className = "",
  artClassName = "h-[88%] w-auto",
}: {
  photoId: number | null;
  visual: string;
  alt: string;
  className?: string;
  artClassName?: string;
}) {
  if (photoId) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={`/api/photos/${photoId}`} alt={alt} className={`h-full w-full object-cover ${className}`} loading="lazy" />
    );
  }
  return (
    <div className={`grid h-full w-full place-items-center ${className}`} role="img" aria-label={alt}>
      <WatchArt visual={parseVisual(visual)} className={`${artClassName} drop-shadow-[0_18px_22px_rgba(0,0,0,0.55)]`} />
    </div>
  );
}
