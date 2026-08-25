"use client";

import { useEffect, useState } from "react";

type Drama = { id: string; title: string; slug: string; year: number; status: string };

export default function AdminPage() {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [form, setForm] = useState({ title: "", slug: "", year: "", status: "En cours", synopsis: "" });
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/dramas");
    const data = await res.json();
    setDramas(data.dramas ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/dramas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, year: Number(form.year) }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erreur lors de la création");
      return;
    }
    setForm({ title: "", slug: "", year: "", status: "En cours", synopsis: "" });
    load();
  }

  async function handleDelete(slug: string) {
    await fetch(`/api/dramas/${slug}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="px-5 py-8">
      <h1 className="font-display text-2xl mb-6">Administration</h1>

      <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-xl p-5 grid gap-3 sm:grid-cols-2 mb-8">
        <input required placeholder="Titre" className="bg-bg border border-line rounded-lg px-3 py-2 text-sm"
          value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input required placeholder="slug-url" className="bg-bg border border-line rounded-lg px-3 py-2 text-sm"
          value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <input required placeholder="Année" className="bg-bg border border-line rounded-lg px-3 py-2 text-sm"
          value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
        <select className="bg-bg border border-line rounded-lg px-3 py-2 text-sm"
          value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option>En cours</option>
          <option>Terminé</option>
        </select>
        <input placeholder="Synopsis" className="bg-bg border border-line rounded-lg px-3 py-2 text-sm sm:col-span-2"
          value={form.synopsis} onChange={(e) => setForm({ ...form, synopsis: e.target.value })} />
        {error && <p className="text-red text-xs sm:col-span-2">{error}</p>}
        <button className="bg-red text-white rounded-full px-5 py-2 text-sm font-bold sm:col-span-2">
          + Ajouter le drama
        </button>
      </form>

      <table className="w-full text-sm">
        <thead className="text-muted text-xs uppercase">
          <tr>
            <th className="text-left py-2">Titre</th>
            <th className="text-left py-2">Année</th>
            <th className="text-left py-2">Statut</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {dramas.map((d) => (
            <tr key={d.id} className="border-t border-line">
              <td className="py-2">{d.title}</td>
              <td className="py-2">{d.year}</td>
              <td className="py-2">{d.status}</td>
              <td className="py-2 text-right">
                <button onClick={() => handleDelete(d.slug)} className="border border-line rounded px-3 py-1 text-xs">
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
