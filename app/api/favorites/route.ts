import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifySession } from "@/lib/auth";

function getSession(req: NextRequest) {
  return verifySession(req.cookies.get("session")?.value ?? "");
}

// GET /api/favorites — dramas favoris de l'utilisateur connecté
export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });

  const dramas = await query(
    `SELECT d.* FROM favorites f
     JOIN dramas d ON d.id = f.drama_id
     WHERE f.user_id = $1
     ORDER BY d.title`,
    [session.id]
  );
  return NextResponse.json({ dramas });
}

// POST /api/favorites  { drama_id } — ajoute un favori
export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });

  const { drama_id } = await req.json();
  await query(
    `INSERT INTO favorites (user_id, drama_id) VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [session.id, drama_id]
  );
  return NextResponse.json({ ok: true });
}

// DELETE /api/favorites  { drama_id } — retire un favori
export async function DELETE(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });

  const { drama_id } = await req.json();
  await query(`DELETE FROM favorites WHERE user_id = $1 AND drama_id = $2`, [session.id, drama_id]);
  return NextResponse.json({ ok: true });
}
