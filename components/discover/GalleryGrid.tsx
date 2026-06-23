import Image from "next/image";
import Link from "next/link";
import type { OpsGalleryItem } from "@/lib/ops/types";

type Props = {
  items: OpsGalleryItem[];
};

export default function GalleryGrid({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="text-[14px] text-text-secondary">
        Galeria tymczasowo niedostępna. Sprawdź{" "}
        <Link href="/astronomia" className="text-accent-cyan hover:underline">
          Astronomię
        </Link>
        .
      </p>
    );
  }

  const [hero, ...rest] = items;

  return (
    <div className="space-y-6">
      {hero && (
        <Link
          href={hero.href ?? hero.imageUrl}
          className="group relative block overflow-hidden rounded-xl border border-hairline"
          target={hero.href?.startsWith("http") ? "_blank" : undefined}
          rel={hero.href?.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          <div className="relative aspect-[16/9] max-h-[420px] w-full">
            <Image
              src={hero.imageUrl}
              alt={hero.title}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 1320px) 100vw, 1320px"
              priority
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent-cyan">
              {hero.source}
            </p>
            <h2 className="mt-1 text-[18px] font-bold text-white">{hero.title}</h2>
            {hero.credit && (
              <p className="mt-1 text-[11px] text-white/70">{hero.credit}</p>
            )}
          </div>
        </Link>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {rest.map((item) => (
          <Link
            key={item.id}
            href={item.href ?? item.imageUrl}
            className="group overflow-hidden rounded-xl border border-hairline bg-space-card"
            target={item.href?.startsWith("http") ? "_blank" : undefined}
            rel={item.href?.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            <div className="relative aspect-square">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                unoptimized
                className="object-cover opacity-90 transition-transform group-hover:scale-105"
                sizes="280px"
              />
            </div>
            <div className="p-2.5">
              <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-text-primary">
                {item.title}
              </p>
              <p className="mt-1 text-[9px] text-text-muted">{item.source}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
