import { query } from "@/lib/db";
import DramaCard, { Drama } from "@/components/DramaCard";

export const dynamic = "force-dynamic";

type SearchParams = { search?: string; genre?: string; year?: string; status?: string };

export default async function CataloguePage({ searchParams }: { searchParams: SearchParams }) {
  const conditions: string[] = [];
  const params: any[] = [];

  if (searchParams.search) {
    params.push(`%${searchParams.search}%`);
    conditions.push(`title ILIKE $${params.length}`);
  }
  if (searchParams.year) {
    params.push(searchParams.year);
    conditions.push(`year = $${params.length}`);
  }
  if (searchParams.status) {
    params.push(searchParams.status);
    conditions.push(`status = $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const dramas = await query<Drama>(
    `SELECT id, title, slug, year, status, poster_url FROM dramas ${where} ORDER BY created_at DESC`,
    params
  );

  return (
    <div className="px-5 py-8">
      <h1 className="font-display text-2xl mb-6">Catalogue</h1>

      <form className="flex gap-2 mb-6 flex-wrap" method="get">
        <input
          name="search"
          defaultValue={searchParams.search}
          placeholder="Rechercher un titre..."
          className="bg-surface border border-line rounded-full px-4 py-2 text-sm"
        />
        <select name="status" defaultValue={searchParams.status} className="bg-surface border border-line rounded-lg px-3 py-2 text-sm">
          <option value="">Statut</option>
          <option value="En cours">En cours</option>
          <option value="Terminé">Terminé</option>
        </select>
        <button className="bg-red text-white px-4 py-2 rounded-full text-sm font-bold">Filtrer</button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {dramas.map((d) => (
          <DramaCard key={d.id} drama={d} />
        ))}
        {dramas.length === 0 && <p className="text-muted text-sm">Aucun résultat.</p>}
      </div>
    </div>
  );
}
