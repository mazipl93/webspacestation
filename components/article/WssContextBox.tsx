import { Sparkles } from "lucide-react";

/** Editorial context block for RSS hybrid (B+) articles. */
export default function WssContextBox({ text }: { text: string }) {
  if (!text.trim()) return null;

  return (
    <aside
      className="my-8 rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.06] p-5 sm:p-6"
      aria-label="Kontekst redakcyjny WSS"
    >
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={16} className="text-accent-cyan" aria-hidden />
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-cyan">
          Kontekst WSS
        </p>
      </div>
      <p className="text-[15px] leading-relaxed text-text-secondary">{text}</p>
      <p className="mt-3 text-[11px] text-text-muted">
        Ramowanie redakcyjne Web Space Station — ogólny kontekst branżowy, nie
        cytat ze źródła zewnętrznego.
      </p>
    </aside>
  );
}
