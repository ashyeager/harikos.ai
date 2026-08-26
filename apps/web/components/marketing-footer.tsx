import Link from "next/link";
import { Brand } from "./brand";

export function MarketingFooter() {
  return (
    <footer className="min-h-[250px] px-6 md:px-16 py-16 grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 bg-[#030304] text-muted text-xs border-t border-line">
      <div className="flex flex-col gap-4">
        <Brand />
        <p className="font-mono text-[9px] tracking-widest uppercase max-w-[250px] leading-relaxed">
          A shared, continuously verified Project Brain for AI coding agents.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <h4 className="font-bold text-white mb-2">PRODUCT</h4>
        <Link href="/truth" className="hover:text-cyan transition-colors">Project Truth</Link>
        <Link href="/memory" className="hover:text-cyan transition-colors">Memory</Link>
        <Link href="/context" className="hover:text-cyan transition-colors">Context</Link>
        <Link href="/agents" className="hover:text-cyan transition-colors">Agents</Link>
        <Link href="/pricing" className="hover:text-cyan transition-colors">Pricing</Link>
      </div>

      <div className="flex flex-col gap-4">
        <h4 className="font-bold text-white mb-2">DEVELOPERS</h4>
        <Link href="/developers" className="hover:text-orange transition-colors">MCP</Link>
        <Link href="/how-it-works" className="hover:text-orange transition-colors">How it works</Link>
        <Link href="/security" className="hover:text-orange transition-colors">Security</Link>
        <Link href="/docs" className="hover:text-orange transition-colors">Docs</Link>
      </div>

      <div className="flex flex-col justify-between">
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-white mb-2">COMPANY</h4>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <a href="https://harikos.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">HARIKOS Main &rarr;</a>
        </div>
        <div className="flex flex-col gap-4 mt-8 md:mt-0">
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
          <p className="text-[10px]">
            &copy; {new Date().getFullYear()} HARIKOS AI &mdash; A HARIKOS product.
          </p>
        </div>
      </div>
    </footer>
  );
}
