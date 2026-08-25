import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = process.env.AUTH_SECRET as string;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signSession(payload: { id: string; role: string }) {
  if (!SECRET) throw new Error("AUTH_SECRET manquant dans les variables d'environnement");
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifySession(token: string) {
  try {
    return jwt.verify(token, SECRET) as { id: string; role: string };
  } catch {
    return null;
  }
}

export function requireAdmin(session: { role: string } | null) {
  if (!session || session.role !== "admin") {
    throw new Error("Accès refusé : réservé à l'administrateur");
  }
}
