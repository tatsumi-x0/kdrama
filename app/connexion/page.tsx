"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ConnexionPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Une erreur est survenue");
      return;
    }

    router.push(next);
    router.refresh(); // pour que le layout relise la session côté serveur
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5">
      <div className="w-full max-w-sm bg-surface border border-line rounded-2xl p-7">
        <h1 className="font-display text-2xl">{mode === "login" ? "Connexion" : "Inscription"}</h1>
        <p className="text-muted text-xs mt-1 mb-6">
          Accède à tes favoris et à ta reprise de lecture.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted font-bold block mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bg border border-line rounded-lg px-3 py-2 text-sm"
              placeholder="toi@exemple.com"
            />
          </div>
          <div>
            <label className="text-xs text-muted font-bold block mb-1">Mot de passe</label>
            <input
              type="password"
              required
              minLength={mode === "signup" ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg border border-line rounded-lg px-3 py-2 text-sm"
              placeholder={mode === "signup" ? "8 caractères minimum" : "••••••••"}
            />
          </div>

          {error && <p className="text-red text-xs">{error}</p>}

          <button
            disabled={loading}
            className="w-full bg-red text-white rounded-full py-2.5 text-sm font-bold disabled:opacity-60"
          >
            {loading ? "Patiente..." : mode === "login" ? "Se connecter" : "S'inscrire"}
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-5">
          {mode === "login" ? "Pas de compte ?" : "Déjà inscrit·e ?"}{" "}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            className="text-gold font-bold"
          >
            {mode === "login" ? "Inscris-toi" : "Connecte-toi"}
          </button>
        </p>
      </div>
    </div>
  );
}
