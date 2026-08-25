import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { query } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const token = cookies().get("session")?.value;
  const session = token ? verifySession(token) : null;
  if (!session) redirect("/connexion?next=/profil");

  const [user] = await query<any>(`SELECT email FROM users WHERE id = $1`, [session.id]);

  const history = await query<any>(
    `SELECT wh.progress_seconds, wh.updated_at,
            e.id AS episode_id, e.title AS episode_title, e.duration,
            s.number AS season_number,
            d.title AS drama_title, d.slug AS drama_slug
     FROM watch_history wh
     JOIN episodes e ON e.id = wh.episode_id
     JOIN seasons s ON s.id = e.season_id
     JOIN dramas d ON d.id = s.drama_id
     WHERE wh.user_id = $1
     ORDER BY wh.updated_at DESC
     LIMIT 20`,
    [session.id]
  );

  const favorites = await query<any>(
    `SELECT d.title, d.slug, d.year, d.status FROM favorites f
     JOIN dramas d ON d.id = f.drama_id
     WHERE f.user_id = $1
     ORDER BY d.title`,
    [session.id]
  );

  return (
    <div>
      <div className="flex items-center gap-4 px-5 py-8 border-b border-line">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red to-gold flex items-center justify-center font-display text-xl text-[#1a1420]">
          {user.email[0].toUpperCase()}
        </div>
        <div>
          <h1 className="font-display text-xl">{user.email}</h1>
          <p className="text-muted text-xs mt-0.5">Reprends là où tu t'es arrêté·e</p>
        </div>
      </div>

      <section className="px-5 py-8 border-b border-line">
        <h2 className="font-display text-lg mb-4">Continuer à regarder</h2>
        {history.length === 0 && (
          <p className="text-muted text-sm">Les épisodes que tu commences à regarder apparaîtront ici.</p>
        )}
        <div className="divide-y divide-line">
          {history.map((h: any) => {
            const pct = h.duration ? Math.min(100, Math.round((h.progress_seconds / h.duration) * 100)) : 0;
            return (
              <Link key={h.episode_id} href={`/drama/${h.drama_slug}`} className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <b className="text-sm block truncate">{h.drama_title} — {h.episode_title}</b>
                  <span className="text-muted text-xs">Saison {h.season_number}</span>
                  <div className="h-[3px] bg-line rounded mt-1.5 overflow-hidden">
                    <div className="h-full bg-red" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="px-5 py-8">
        <h2 className="font-display text-lg mb-4">Mes favoris</h2>
        {favorites.length === 0 ? (
          <p className="text-muted text-sm">
            Aucun favori pour l'instant —{" "}
            <Link href="/catalogue" className="text-gold">parcours le catalogue</Link>.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {favorites.map((d: any) => (
              <Link key={d.slug} href={`/drama/${d.slug}`} className="block">
                <div className="aspect-[2/3] rounded-lg border border-line bg-surface flex items-end p-2">
                  <span className="font-display text-sm">{d.title}</span>
                </div>
                <p className="text-muted text-xs mt-1">{d.year} · {d.status}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
