import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifySession } from "@/lib/auth";

// GET /api/history — épisodes en cours pour "Continuer à regarder"
export async function GET(req: NextRequest) {
  const session = verifySession(req.cookies.get("session")?.value ?? "");
  if (!session) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });

  const items = await query(
    `SELECT wh.progress_seconds, wh.updated_at,
            e.id AS episode_id, e.title AS episode_title, e.duration,
            s.number AS season_number,
            d.title AS drama_title, d.slug AS drama_slug, d.poster_url
     FROM watch_history wh
     JOIN episodes e ON e.id = wh.episode_id
     JOIN seasons s ON s.id = e.season_id
     JOIN dramas d ON d.id = s.drama_id
     WHERE wh.user_id = $1
     ORDER BY wh.updated_at DESC
     LIMIT 20`,
    [session.id]
  );

  return NextResponse.json({ items });
}
