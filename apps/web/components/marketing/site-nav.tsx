"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Brand } from "../brand";

const productLinks = [
  ["Project Brain", "/product", "Truth, Memory, Context, and the agent bridge"],
  ["Truth", "/truth", "Current facts backed by repository evidence"],
  ["Memory", "/memory", "Decisions and outcomes that survive sessions"],
  ["Context", "/context", "The smallest useful brief for the task"],
  ["Agents", "/agents", "One neutral bridge for coding agents"],
  ["How it works", "/how-it-works", "From repository signal to agent outcome"],
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setProductOpen(false);
  }, [pathname]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setProductOpen(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <header className={`site-nav-shell ${scrolled ? "is-scrolled" : ""}`}>
      <div className="site-nav">
        <Brand />
        <nav aria-label="Primary navigation" className={`site-nav-links ${open ? "is-open" : ""}`}>
          <div className={`nav-dropdown ${productOpen ? "is-open" : ""}`}>
            <button aria-expanded={productOpen} aria-haspopup="true" onClick={() => setProductOpen((value) => !value)} type="button">
              Product <span aria-hidden="true">⌄</span>
            </button>
            <div className="nav-dropdown-panel">
              <div className="nav-dropdown-intro">
                <span>PROJECT BRAIN / 01</span>
                <strong>Continuity for AI-built software.</strong>
              </div>
              <div className="nav-dropdown-grid">
                {productLinks.map(([label, href, description]) => (
                  <Link href={href} key={href}>
                    <i aria-hidden="true" />
                    <span><strong>{label}</strong><small>{description}</small></span>
                    <b aria-hidden="true">↗</b>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Link href="/developers">Developers</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/about">Company</Link>
          <div className="mobile-nav-actions">
            <Link href="/login">Sign in</Link>
            <Link className="button button-primary" href="/login">Start free <span>↗</span></Link>
          </div>
        </nav>
        <div className="site-nav-actions">
          <Link className="nav-sign-in" href="/login">Sign in</Link>
          <Link className="button button-primary button-small" href="/login">Start free <span>↗</span></Link>
          <button aria-expanded={open} aria-label={open ? "Close navigation" : "Open navigation"} className={`mobile-menu-button ${open ? "is-open" : ""}`} onClick={() => setOpen((value) => !value)} type="button"><i /><i /></button>
        </div>
      </div>
    </header>
  );
}
