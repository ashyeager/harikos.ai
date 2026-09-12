import Link from "next/link";
import Image from "next/image";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={`brand ${compact ? "brand-compact" : ""}`} aria-label="HARIKOS AI home">
      <Image alt="" aria-hidden="true" className="brand-logo" height={36} priority src="/harikos-mark.svg" width={36} />
      <span>HARIKOS</span>
    </Link>
  );
}
