"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`harikos-skeleton ${className}`} />;
}

export function EmptyState({ eyebrow, title, description, action, compact = false }: { eyebrow: string; title: string; description: string; action?: ReactNode; compact?: boolean }) {
  return <section className={`harikos-empty-state ${compact ? "is-compact" : ""}`}><div aria-hidden="true" className="empty-state-mark"><i /><i /><span /></div><div><span>{eyebrow}</span><h3>{title}</h3><p>{description}</p>{action ? <div className="empty-state-action">{action}</div> : null}</div></section>;
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return <span className="tooltip-root">{children}<span className="tooltip-content" role="tooltip">{label}</span></span>;
}

export function LoadingButton({ loading, loadingLabel, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; loadingLabel: string }) {
  return <button {...props} aria-busy={loading || undefined} disabled={loading || props.disabled}><span className="loading-button-content">{loading ? <i aria-hidden="true" className="button-progress" /> : null}{loading ? loadingLabel : children}</span></button>;
}
