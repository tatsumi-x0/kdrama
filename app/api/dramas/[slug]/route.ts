import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifySession, requireAdmin } from "@/lib/auth";

// GET /api/dramas/:slug — fiche complète avec saisons + épisodes
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const [drama] = await query(`SELECT * FROM dramas WHERE slug = $1`, [params.slug]);
  if (!drama) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const seasons = await query(
    `SELECT * FROM seasons WHERE drama_id = $1 ORDER BY number`,
    [drama.id]
  );

  for (const season of seasons as any[]) {
    season.episodes = await query(
      `SELECT id, number, title, description, subtitle_url, duration
       FROM episodes WHERE season_id = $1 ORDER BY number`,
      [season.id]
    );
    // video_url volontairement exclu de la liste publique : renvoyé uniquement
    // à la lecture d'un épisode précis, pour éviter de l'exposer inutilement.
  }

  return NextResponse.json({ drama, seasons });
}

// PUT /api/dramas/:slug — édition (admin)
export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = verifySession(req.cookies.get("session")?.value ?? "");
  try {
    requireAdmin(session);
  } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const [drama] = await query(
    `UPDATE dramas SET title=$1, synopsis=$2, poster_url=$3, year=$4, status=$5
     WHERE slug=$6 RETURNING *`,
    [body.title, body.synopsis, body.poster_url, body.year, body.status, params.slug]
  );

  return NextResponse.json({ drama });
}

// DELETE /api/dramas/:slug (admin)
export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = verifySession(req.cookies.get("session")?.value ?? "");
  try {
    requireAdmin(session);
  } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await query(`DELETE FROM dramas WHERE slug = $1`, [params.slug]);
  return NextResponse.json({ ok: true });
}
