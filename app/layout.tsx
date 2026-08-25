import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "K-Drama — Streaming",
  description: "Catalogue, fiches séries, épisodes et lecteur vidéo K-drama.",
  openGraph: { title: "K-Drama", description: "Plateforme de streaming K-drama." },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get("session")?.value;
  const session = token ? verifySession(token) : null;

  return (
    <html lang="fr">
      <body className="font-body">
        <header className="sticky top-0 z-50 flex items-center justify-between px-5 py-4 border-b border-line bg-bg/90 backdrop-blur">
          <Link href="/" className="font-display text-xl">
            K<em className="not-italic text-red italic">DRAMA</em>
          </Link>
          <nav className="flex items-center gap-5 text-sm text-muted font-semibold">
            <Link href="/" className="hover:text-ink">Accueil</Link>
            <Link href="/catalogue" className="hover:text-ink">Catalogue</Link>
            {session?.role === "admin" && (
              <Link href="/admin" className="hover:text-ink">Admin</Link>
            )}
            {session ? (
              <>
                <Link href="/profil" className="hover:text-ink">Profil</Link>
                <LogoutButton />
              </>
            ) : (
              <Link href="/connexion" className="hover:text-ink">Connexion</Link>
            )}
          </nav>
        </header>
        <main>{children}</main>
        <footer className="border-t border-line text-muted text-xs text-center py-10 px-5">
          © {new Date().getFullYear()} K-Drama — Diffuse uniquement des contenus dont tu détiens les droits.
        </footer>
      </body>
    </html>
  );
}
