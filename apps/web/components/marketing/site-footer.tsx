import Link from "next/link";

import { Brand } from "../brand";
import { brandLinks } from "../../lib/brand-links";

const columns = [
  ["Product", [["Overview", "/product"], ["Truth", "/truth"], ["Memory", "/memory"], ["Context", "/context"], ["Agents", "/agents"], ["Pricing", "/pricing"]]],
  ["Developers", [["MCP", "/developers"], ["How it works", "/how-it-works"], ["Security", "/security"]]],
  ["Company", [["About", "/about"], ["Sign in", "/login"]]],
  ["Legal", [["Privacy", "/privacy"], ["Terms", "/terms"]]],
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-top">
        <div className="footer-brand-block">
          <Brand />
          <p>Verified project state shared across coding agents, sessions, and repository changes.</p>
          <span><i /> PRODUCT PRINCIPLE / EVIDENCE FIRST</span>
        </div>
        <div className="footer-columns">
          {columns.map(([title, links]) => (
            <div key={title}>
              <strong>{title}</strong>
              {links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
            </div>
          ))}
        </div>
      </div>
      <div className="site-footer-bottom">
        <span>HARIKOS AI — A HARIKOS product.</span>
          <span><a href={`mailto:${brandLinks.contactEmail}`}>{brandLinks.contactEmail}</a> · <a href={brandLinks.instagram} rel="noreferrer" target="_blank">{brandLinks.instagramLabel}</a></span>
          <a href="https://harikos.vercel.app/" rel="noreferrer" target="_blank">HARIKOS <b>→</b></a>
      </div>
    </footer>
  );
}
