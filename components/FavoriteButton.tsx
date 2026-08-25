"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FavoriteButton({
  dramaId,
  initialFavorited,
  loggedIn,
}: {
  dramaId: string;
  initialFavorited: boolean;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!loggedIn) {
      router.push(`/connexion?next=/drama`);
      return;
    }
    setLoading(true);
    const method = favorited ? "DELETE" : "POST";
    const res = await fetch("/api/favorites", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drama_id: dramaId }),
    });
    setLoading(false);
    if (res.ok) setFavorited(!favorited);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-5 py-2.5 rounded-full text-sm font-bold border transition-colors ${
        favorited
          ? "bg-red border-red text-white"
          : "border-line text-ink hover:border-gold hover:text-gold"
      }`}
    >
      {favorited ? "♥ Dans mes favoris" : "♡ Ajouter aux favoris"}
    </button>
  );
}
