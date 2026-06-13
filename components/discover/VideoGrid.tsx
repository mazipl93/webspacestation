import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import type { OpsVideoItem } from "@/lib/ops/types";

type Props = {
  items: OpsVideoItem[];
};

export default function VideoGrid({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="text-[14px] text-text-secondary">
        Brak materiałów wideo. Spróbuj później.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <a
          key={item.id}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group overflow-hidden rounded-xl border border-hairline bg-space-card"
        >
          <div className="relative aspect-video bg-space-deep">
            {item.thumbnail ? (
              <Image
                src={item.thumbnail}
                alt=""
                fill
                className="object-cover opacity-80"
                sizes="400px"
              />
            ) : null}
            <span className="absolute inset-0 flex items-center justify-center bg-black/35 transition-colors group-hover:bg-black/20">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white">
                <Play size={22} fill="currentColor" />
              </span>
            </span>
          </div>
          <div className="p-3">
            <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-text-primary group-hover:text-accent-cyan">
              {item.title}
            </p>
            <p className="mt-1 text-[10px] text-text-muted">{item.source}</p>
          </div>
        </a>
      ))}
    </div>
  );
}
