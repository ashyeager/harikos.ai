import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="HARIKOS AI home">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span>{compact ? "HARIKOS" : "HARIKOS AI"}</span>
    </Link>
  );
}
