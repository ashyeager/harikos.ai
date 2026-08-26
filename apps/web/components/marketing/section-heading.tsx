import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, copy, aside }: { eyebrow: string; title: ReactNode; copy?: string; aside?: ReactNode }) {
  return (
    <div className="section-heading" data-reveal>
      <div><span className="eyebrow"><i />{eyebrow}</span><h2>{title}</h2>{copy ? <p>{copy}</p> : null}</div>
      {aside ? <div className="section-heading-aside">{aside}</div> : null}
    </div>
  );
}
