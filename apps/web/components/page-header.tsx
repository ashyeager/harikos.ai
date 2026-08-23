import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div><span>{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>
      {action ? <div className="page-action">{action}</div> : null}
    </div>
  );
}
