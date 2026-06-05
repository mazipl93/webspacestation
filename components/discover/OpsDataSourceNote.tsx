import OpsPreviewBadge from "@/components/discover/OpsPreviewBadge";

type Props = {
  live: boolean;
  fetchedAt?: string;
};

export default function OpsDataSourceNote({ live, fetchedAt }: Props) {
  if (!live) {
    return (
      <div className="card-surface shrink-0 max-w-[300px] rounded-xl border border-hairline px-4 py-3">
        <div className="mb-2">
          <OpsPreviewBadge />
        </div>
        <p className="text-[11px] leading-relaxed text-text-tertiary">
          API niedostępne — wyświetlamy dane zapasowe. Spróbuj odświeżyć za chwilę.
        </p>
      </div>
    );
  }

  const time = fetchedAt
    ? new Intl.DateTimeFormat("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(fetchedAt))
    : null;

  return (
    <div className="card-surface shrink-0 max-w-[300px] rounded-xl border border-hairline px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent-cyan">
        Dane na żywo
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-text-tertiary">
        Launch Library · ISS · NASA
        {time ? ` · odświeżono ${time}` : ""}
      </p>
    </div>
  );
}
