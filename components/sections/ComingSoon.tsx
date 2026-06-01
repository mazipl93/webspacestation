import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

type Props = {
  title: string;
  description: string;
  icon?: string;
};

export default function ComingSoon({ title, description, icon = "🚀" }: Props) {
  return (
    <div className="flex min-h-[calc(100vh-280px)] items-center justify-center py-20">
      <div className="container-site">
        <div className="mx-auto max-w-[520px] text-center">

          {/* Icon */}
          <div
            className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-hairline text-3xl"
            style={{ background: "var(--glass-fill)" }}
          >
            {icon}
          </div>

          {/* Badge */}
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-accent-blue/30 bg-accent-blue/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-blue" />
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-blue">
              Wkrótce
            </span>
          </div>

          {/* Title */}
          <h1
            className="mb-4 font-extrabold text-text-primary"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", letterSpacing: "-0.03em" }}
          >
            {title}
          </h1>

          {/* Description */}
          <p className="mb-10 text-[14px] leading-relaxed text-text-secondary">
            {description}
          </p>

          {/* Divider */}
          <div
            className="mx-auto mb-10 h-px max-w-[180px]"
            style={{ background: "var(--hairline)" }}
          />

          {/* CTAs */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/aktualnosci"
              className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-glass px-5 py-2.5 text-[13px] font-medium text-text-secondary transition-all duration-300 hover:border-hairline-strong hover:bg-glass-hover hover:text-text-primary active:scale-[0.97]"
            >
              <ArrowLeft size={14} />
              Aktualności
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-blue px-5 py-2.5 text-[13px] font-semibold text-white transition-all duration-300 hover:bg-accent-blue-hover hover:shadow-[0_8px_24px_-8px_rgba(47,109,255,0.6)] active:scale-[0.97]"
            >
              Strona główna
              <ChevronRight size={14} />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
