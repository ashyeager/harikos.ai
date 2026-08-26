import Link from "next/link";
import { Brand } from "./brand";

export function MarketingNav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 border-b border-line bg-ink/80 backdrop-blur-md px-6 md:px-16 flex items-center justify-between">
      <Brand />
      
      <nav className="hidden md:flex items-center gap-8 text-xs font-mono text-muted">
        <Link href="/product" className="hover:text-orange transition-colors">Product</Link>
        <Link href="/developers" className="hover:text-cyan transition-colors">Developers</Link>
        <Link href="/pricing" className="hover:text-orange transition-colors">Pricing</Link>
        <Link href="/about" className="hover:text-white transition-colors">Company</Link>
      </nav>

      <div className="flex items-center gap-4">
        <Link href="/login" className="hidden sm:block text-xs font-mono text-muted hover:text-white transition-colors">
          Sign In
        </Link>
        <Link href="/login" className="h-9 px-4 flex items-center justify-center border border-line bg-ink-soft hover:border-cyan text-xs font-mono font-bold tracking-wide transition-all duration-300">
          Start Free
        </Link>
      </div>
    </header>
  );
}
