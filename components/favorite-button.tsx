"use client";

import { useOptimistic, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toggleFavorite } from "@/app/actions/favorites";
import { HeartIcon } from "./icons";

export function FavoriteButton({
  listingId,
  initial,
  size = "sm",
}: {
  listingId: number;
  initial: boolean;
  size?: "sm" | "lg";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [favorite, setFavorite] = useOptimistic(initial);

  function onClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    startTransition(async () => {
      setFavorite(!favorite);
      const result = await toggleFavorite(listingId);
      if (result.needsLogin) {
        router.push(`/connexion?next=${encodeURIComponent(pathname)}`);
        return;
      }
      router.refresh();
    });
  }

  const dimension = size === "lg" ? "h-11 w-11" : "h-8 w-8";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={favorite}
      aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={`${dimension} grid place-items-center rounded-full border border-line bg-surface/90 text-text backdrop-blur-md transition active:scale-90`}
    >
      <HeartIcon size={size === "lg" ? 20 : 16} filled={favorite} />
    </button>
  );
}
