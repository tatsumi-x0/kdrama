import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import VideoPlayer from "@/components/VideoPlayer";
import FavoriteButton from "@/components/FavoriteButton";

export const dynamic = "force-dynamic";

export default async function DramaPage({ params }: { params: { slug: string } }) {
  const [drama] = await query<any>(`SELECT * FROM dramas WHERE slug = $1`, [params.slug]);
  if (!drama) notFound();

  const token = cookies().get("session")?.value;
  const session = token ? verifySession(token) : null;

  let isFavorited = false;
  if (session) {
    const [fav] = await query(
      `SELECT 1 FROM favorites WHERE user_id = $1 AND drama_id = $2`,
      [session.id, drama.id]
    );
    isFavorited = !!fav;
  }

  const seasons = await query<any>(`SELECT * FROM seasons WHERE drama_id = $1 ORDER BY number`, [drama.id]);
  for (const season of seasons) {
    season.episodes = await query<any>(
      `SELECT * FROM episodes WHERE season_id = $1 ORDER BY number`,
      [season.id]
    );
  }

  const firstEpisode = seasons[0]?.episodes?.[0];

  let startAt = 0;
  if (session && firstEpisode) {
    const [progress] = await query<any>(
      `SELECT progress_seconds FROM watch_history WHERE user_id = $1 AND episode_id = $2`,
      [session.id, firstEpisode.id]
    );
    startAt = progress?.progress_seconds ?? 0;
  }

  return (
    <div>
      <section className="px-5 py-10 border-b border-line">
        <h1 className="font-display text-3xl md:text-4xl">{drama.title}</h1>
        <p className="text-muted text-sm mt-2">{drama.year} · {drama.status}</p>
        <p className="max-w-xl text-sm mt-4 text-[#D8D5CE] leading-relaxed">{drama.synopsis}</p>
        <div className="mt-5">
          <FavoriteButton dramaId={drama.id} initialFavorited={isFavorited} loggedIn={!!session} />
        </div>
      </section>

      {firstEpisode && (
        <section className="px-5 py-8 border-b border-line">
          <h2 className="font-display text-lg mb-3">{firstEpisode.title}</h2>
          <VideoPlayer
            episodeId={firstEpisode.id}
            videoUrl={firstEpisode.video_url}
            subtitleUrl={firstEpisode.subtitle_url}
            startAt={startAt}
          />
        </section>
      )}

      <section className="px-5 py-8">
        <h2 className="font-display text-lg mb-4">Épisodes</h2>
        {seasons.map((season: any) => (
          <div key={season.id} className="mb-6">
            <h3 className="text-sm font-bold text-gold mb-3">Saison {season.number}</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {season.episodes.map((ep: any) => (
                <div key={ep.id} className="flex-none w-[130px] text-sm">
                  <div className="font-display text-2xl text-muted">{String(ep.number).padStart(2, "0")}</div>
                  <div className="font-semibold text-xs mt-1">{ep.title}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
