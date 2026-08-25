import { jwtVerify } from "jose";

// jsonwebtoken (utilisé dans lib/auth.ts) ne fonctionne pas dans le runtime Edge
// du middleware — on utilise ici "jose", compatible, avec le même secret et le
// même algorithme (HS256) pour vérifier les jetons signés côté API.
const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

export async function verifySessionEdge(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { id: string; role: string };
  } catch {
    return null;
  }
}
