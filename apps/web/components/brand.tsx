import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="HARIKOS AI home">
      <span className="w-5 h-5 grid grid-cols-3 gap-0.5 p-[3px] bg-paper" aria-hidden="true">
        <span className="bg-ink" />
        <span className="bg-orange" />
        <span className="bg-cyan" />
      </span>
      <span>{compact ? "HARIKOS" : "HARIKOS AI"}</span>
    </Link>
  );
}
