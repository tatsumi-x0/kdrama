import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyPassword, signSession } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ email: z.string().email(), password: z.string() });

// Rate limiting très simple en mémoire (à remplacer par Redis en production).
const attempts = new Map<string, { count: number; reset: number }>();
const LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;

function tooManyAttempts(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.reset) {
    attempts.set(key, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > LIMIT;
}

export async function POST(req: NextRequest) {
  const body = schema.parse(await req.json());
  const ip = req.headers.get("x-forwarded-for") ?? "local";

  if (tooManyAttempts(`${ip}:${body.email}`)) {
    return NextResponse.json({ error: "Trop de tentatives, réessaie plus tard" }, { status: 429 });
  }

  const [user] = await query(`SELECT * FROM users WHERE email = $1`, [body.email]);
  if (!user || !(await verifyPassword(body.password, user.password_hash))) {
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  }

  const token = signSession({ id: user.id, role: user.role });
  const res = NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } });
  res.cookies.set("session", token, { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
  return res;
}
