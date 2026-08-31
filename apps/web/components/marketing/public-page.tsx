import Link from "next/link";
import type { ReactNode } from "react";

export function PublicHero({
  eyebrow,
  title,
  accent,
  copy,
  visual,
  primary = ["Start free", "/login"],
  secondary,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  copy: string;
  visual: ReactNode;
  primary?: readonly [string, string];
  secondary?: readonly [string, string];
}) {
  return (
    <section className="public-hero">
      <div className="public-hero-grid" aria-hidden="true" />
      <div className="public-hero-copy">
        <span className="eyebrow"><i />{eyebrow}</span>
        <h1>{title}<br /><span>{accent}</span></h1>
        <p>{copy}</p>
        <div className="hero-actions">
          <Link className="button button-primary button-large" href={primary[1]}>{primary[0]} <span aria-hidden="true">&rarr;</span></Link>
          {secondary ? <Link className="button button-secondary button-large" href={secondary[1]}>{secondary[0]}</Link> : null}
        </div>
      </div>
      <div className="public-hero-visual">{visual}</div>
    </section>
  );
}

export function PrincipleStrip({ items }: { items: ReadonlyArray<readonly [string, string]> }) {
  return (
    <section className="principle-strip" aria-label="Product principles">
      {items.map(([label, value], index) => <div key={label}><span>0{index + 1}</span><strong>{label}</strong><small>{value}</small></div>)}
    </section>
  );
}

export function PublicSection({
  eyebrow,
  title,
  copy,
  children,
  tone = "dark",
}: {
  eyebrow: string;
  title: ReactNode;
  copy: string;
  children: ReactNode;
  tone?: "dark" | "deeper" | "accent";
}) {
  return (
    <section className={`public-section public-section-${tone}`}>
      <div className="public-section-heading" data-reveal>
        <span className="eyebrow"><i />{eyebrow}</span>
        <h2>{title}</h2>
        <p>{copy}</p>
      </div>
      <div data-reveal>{children}</div>
    </section>
  );
}

export function ProductCTA({ title, copy = "Connect a repository and give every coding agent one current, evidence-backed understanding." }: { title: string; copy?: string }) {
  return (
    <section className="product-cta">
      <div className="cta-grid" aria-hidden="true" />
      <span className="eyebrow"><i />PROJECT BRAIN / READY</span>
      <h2>{title}</h2>
      <p>{copy}</p>
      <div><Link className="button button-primary button-large" href="/login">Connect your repository <span aria-hidden="true">&rarr;</span></Link><Link className="button button-secondary button-large" href="/how-it-works">Trace the system</Link></div>
    </section>
  );
}

export function ExampleLabel() {
  return <span className="example-label">ILLUSTRATIVE PRODUCT EXAMPLE</span>;
}
