import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword, signSession } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "8 caractères minimum"),
});

export async function POST(req: NextRequest) {
  const body = schema.parse(await req.json());

  const existing = await query(`SELECT id FROM users WHERE email = $1`, [body.email]);
  if (existing.length) {
    return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
  }

  const password_hash = await hashPassword(body.password);
  const [user] = await query(
    `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'user') RETURNING id, email, role`,
    [body.email, password_hash]
  );

  const token = signSession({ id: user.id, role: user.role });
  const res = NextResponse.json({ user });
  res.cookies.set("session", token, { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
  return res;
}
