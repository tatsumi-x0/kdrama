import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifySession, requireAdmin } from "@/lib/auth";
import { z } from "zod";

// GET /api/dramas?search=&genre=&year=&status=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const genre = searchParams.get("genre");
  const year = searchParams.get("year");
  const status = searchParams.get("status");

  const conditions: string[] = [];
  const params: any[] = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`d.title ILIKE $${params.length}`);
  }
  if (year) {
    params.push(year);
    conditions.push(`d.year = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`d.status = $${params.length}`);
  }
  if (genre) {
    params.push(genre);
    conditions.push(`g.name = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const dramas = await query(
    `SELECT DISTINCT d.id, d.title, d.slug, d.synopsis, d.poster_url, d.year, d.status
     FROM dramas d
     LEFT JOIN drama_genres dg ON dg.drama_id = d.id
     LEFT JOIN genres g ON g.id = dg.genre_id
     ${where}
     ORDER BY d.created_at DESC`,
    params
  );

  return NextResponse.json({ dramas });
}

const dramaSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  synopsis: z.string().optional(),
  poster_url: z.string().url().optional(),
  year: z.number().int().optional(),
  status: z.enum(["En cours", "Terminé"]).default("En cours"),
  genres: z.array(z.string()).optional(),
});

// POST /api/dramas — réservé admin
export async function POST(req: NextRequest) {
  const session = verifySession(req.cookies.get("session")?.value ?? "");
  try {
    requireAdmin(session);
  } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = dramaSchema.parse(await req.json());

  const [drama] = await query(
    `INSERT INTO dramas (title, slug, synopsis, poster_url, year, status)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [body.title, body.slug, body.synopsis, body.poster_url, body.year, body.status]
  );

  return NextResponse.json({ drama }, { status: 201 });
}
