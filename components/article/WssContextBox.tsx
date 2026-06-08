import { Sparkles } from "lucide-react";

/** Editorial context block — CMS „Kontekst WSS” (RSS + manual articles). */
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
    </aside>
  );
}
