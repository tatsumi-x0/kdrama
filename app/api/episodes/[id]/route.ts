import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifySession } from "@/lib/auth";

// GET /api/episodes/:id — renvoie video_url + subtitle_url pour la lecture
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const [episode] = await query(
    `SELECT id, title, description, video_url, subtitle_url, duration
     FROM episodes WHERE id = $1`,
    [params.id]
  );
  if (!episode) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json({ episode });
}

// POST /api/episodes/:id — enregistre la progression de lecture (utilisateur connecté)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = verifySession(req.cookies.get("session")?.value ?? "");
  if (!session) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });

  const { progress_seconds } = await req.json();

  await query(
    `INSERT INTO watch_history (user_id, episode_id, progress_seconds, updated_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (user_id, episode_id)
     DO UPDATE SET progress_seconds = $3, updated_at = now()`,
    [session.id, params.id, progress_seconds]
  );

  return NextResponse.json({ ok: true });
}
