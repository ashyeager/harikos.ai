import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
      <div className="flex flex-col gap-2 max-w-2xl">
        {eyebrow && (
          <span className="font-mono text-[9px] tracking-widest uppercase text-cyan mb-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyan animate-pulse"></span>
            {eyebrow}
          </span>
        )}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">{title}</h1>
        {copy && <p className="text-muted text-sm leading-relaxed">{copy}</p>}
      </div>
      {action && <div className="mt-4 md:mt-0 flex-shrink-0">{action}</div>}
    </header>
  );
}
