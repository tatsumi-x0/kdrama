import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifySession } from "@/lib/auth";

// GET /api/recommendations — dramas suggérés selon les genres déjà appréciés.
// Approche simple par affinité de genre (à faire évoluer vers un vrai moteur plus tard).
export async function GET(req: NextRequest) {
  const session = verifySession(req.cookies.get("session")?.value ?? "");
  if (!session) {
    // Visiteur non connecté : on renvoie les dramas les plus récents.
    const dramas = await query(`SELECT * FROM dramas ORDER BY created_at DESC LIMIT 6`);
    return NextResponse.json({ dramas });
  }

  const preferredGenres = await query(
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
    [session.id]
  );

  const genreIds = preferredGenres.map((g: any) => g.id);

  const dramas = genreIds.length
    ? await query(
        `SELECT DISTINCT d.* FROM dramas d
         JOIN drama_genres dg ON dg.drama_id = d.id
         WHERE dg.genre_id = ANY($1)
           AND d.id NOT IN (SELECT drama_id FROM favorites WHERE user_id = $2)
         ORDER BY d.created_at DESC LIMIT 6`,
        [genreIds, session.id]
      )
    : await query(`SELECT * FROM dramas ORDER BY created_at DESC LIMIT 6`);

  return NextResponse.json({ dramas });
}
