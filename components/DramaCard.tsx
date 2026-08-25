import Link from "next/link";
import Image from "next/image";

export type Drama = {
  id: string;
  title: string;
  slug: string;
  year: number;
  status: string;
  poster_url?: string | null;
};

export default function DramaCard({ drama }: { drama: Drama }) {
  return (
    <Link href={`/drama/${drama.slug}`} className="block flex-none w-[150px] group">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-line bg-surface">
        {drama.poster_url ? (
          <Image src={drama.poster_url} alt={drama.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-end p-2 bg-gradient-to-br from-surface to-bg">
            <span className="font-display text-sm">{drama.title}</span>
          </div>
        )}
        <span className="absolute top-2 left-2 text-[9px] font-extrabold bg-red text-white px-2 py-0.5 rounded">
          {drama.status}
        </span>
      </div>
      <div className="mt-2 text-[11px] text-muted flex justify-between">
        <span>{drama.year}</span>
      </div>
    </Link>
  );
}
