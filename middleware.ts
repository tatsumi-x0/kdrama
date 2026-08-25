import { NextRequest, NextResponse } from "next/server";
import { verifySessionEdge } from "@/lib/session-edge";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionEdge(token) : null;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (session.role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Ne s'applique qu'aux pages d'administration (les routes /api/dramas etc.
// vérifient déjà le rôle admin elles-mêmes, voir lib/auth.ts → requireAdmin).
export const config = {
  matcher: ["/admin/:path*"],
};
