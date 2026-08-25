import { query } from "@/lib/db";
import DramaCard, { Drama } from "@/components/DramaCard";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getRecommendations(userId: string | null) {
  if (!userId) {
    return query<Drama>(`SELECT id, title, slug, year, status, poster_url FROM dramas ORDER BY created_at DESC LIMIT 6`);
  }

  const genreRows = await query<any>(
    `SELECT DISTINCT g.id FROM genres g
     JOIN drama_genres dg ON dg.genre_id = g.id
     WHERE dg.drama_id IN (
       SELECT drama_id FROM favorites WHERE user_id = $1
       UNION
       SELECT s.drama_id FROM watch_history wh
       JOIN episodes e ON e.id = wh.episode_id
       JOIN seasons s ON s.id = e.season_id
       WHERE wh.user_id = $1
     )`,
    [userId]
  );
  const genreIds = genreRows.map((g: any) => g.id);

  if (!genreIds.length) {
    return query<Drama>(`SELECT id, title, slug, year, status, poster_url FROM dramas ORDER BY created_at DESC LIMIT 6`);
  }

  return query<Drama>(
    `SELECT DISTINCT d.id, d.title, d.slug, d.year, d.status, d.poster_url FROM dramas d
     JOIN drama_genres dg ON dg.drama_id = d.id
     WHERE dg.genre_id = ANY($1)
       AND d.id NOT IN (SELECT drama_id FROM favorites WHERE user_id = $2)
     ORDER BY d.created_at DESC LIMIT 6`,
    [genreIds, userId]
  );
}

export default async function HomePage() {
  const token = cookies().get("session")?.value;
  const session = token ? verifySession(token) : null;

  const dramas = await query<Drama>(
    `SELECT id, title, slug, year, status, poster_url FROM dramas ORDER BY created_at DESC LIMIT 12`
  );
  const recommended = await getRecommendations(session?.id ?? null);
  const hero = dramas[0];

  return (
    <div>
      {hero && (
        <section className="px-5 py-16 border-b border-line">
          <p className="text-gold text-xs font-bold tracking-widest uppercase mb-3">À la une</p>
          <h1 className="font-display text-4xl md:text-6xl max-w-2xl">{hero.title}</h1>
          <div className="flex gap-3 mt-6">
            <a
              href={`/drama/${hero.slug}`}
              className="bg-red text-white px-6 py-3 rounded-full text-sm font-bold"
            >
              ▶ Voir la fiche
            </a>
          </div>
        </section>
      )}

      <section className="px-5 py-10">
        <h2 className="font-display text-xl mb-4">Derniers ajouts</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {dramas.map((d) => (
            <DramaCard key={d.id} drama={d} />
          ))}
          {dramas.length === 0 && (
            <p className="text-muted text-sm">
              Aucun drama pour l'instant — ajoute-en un depuis l'espace admin.
            </p>
          )}
        </div>
      </section>

      <section className="px-5 py-10">
        <h2 className="font-display text-xl mb-4">Recommandé pour toi</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {recommended.map((d) => (
            <DramaCard key={d.id} drama={d} />
          ))}
        </div>
      </section>
    </div>
  );
}
