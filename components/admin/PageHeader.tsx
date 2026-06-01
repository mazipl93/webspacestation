import type { ReactNode } from "react";

export default function PageHeader({
  overline,
  title,
  description,
  actions,
}: {
  overline?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {overline ? (
          <p className="overline mb-2 text-text-tertiary">{overline}</p>
        ) : null}
        <h1 className="text-headline font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1.5 text-body text-text-secondary">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
