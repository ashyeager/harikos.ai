import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={`brand ${compact ? "brand-compact" : ""}`} aria-label="HARIKOS AI home">
      <span className="brand-mark" aria-hidden="true">
        <i className="brand-mark-frame" />
        <i className="brand-mark-accent" />
        <i className="brand-mark-signal" />
      </span>
      <span>{compact ? "HARIKOS" : "HARIKOS AI"}</span>
    </Link>
  );
}
