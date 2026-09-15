"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const globalItems = [["Dashboard", "/app/dashboard", "G D", "WORKSPACE"], ["Projects", "/app/projects", "G P", "WORKSPACE"], ["Truth", "/truth", "", "PRODUCT"], ["Evidence", "/truth", "", "PRODUCT"], ["Changes", "/how-it-works", "", "PRODUCT"], ["Memory", "/memory", "", "PRODUCT"], ["Context", "/context", "", "PRODUCT"], ["Agents", "/agents", "", "PRODUCT"], ["Profile", "/app/settings/profile", "", "ACCOUNT"], ["Billing", "/app/settings/billing", "", "ACCOUNT"], ["Settings", "/app/settings", "", "ACCOUNT"], ["Pricing", "/pricing", "", "COMPANY"], ["Security", "/security", "", "COMPANY"], ["Developers", "/developers", "", "COMPANY"]] as const;

export function CommandPalette({ projectId }: { projectId?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  function closePalette() {
    setOpen(false);
    setQuery("");
    setActive(0);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setOpen((value) => { if (value) window.requestAnimationFrame(() => triggerRef.current?.focus()); return !value; }); }
      if (event.key === "Escape" && open) closePalette();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, [pathname]);
  function trapFocus(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab") return;
    const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
  const items = useMemo(() => {
    const projectItems = projectId ? [["Project overview", `/app/project/${projectId}`, "", "CURRENT PROJECT"], ["Truth and Evidence", `/app/project/${projectId}/truth`, "G T", "CURRENT PROJECT"], ["Memory", `/app/project/${projectId}/memory`, "", "CURRENT PROJECT"], ["Changes", `/app/project/${projectId}/changes`, "", "CURRENT PROJECT"], ["Agents", `/app/project/${projectId}/agents`, "", "CURRENT PROJECT"], ["Context", `/app/project/${projectId}/context`, "G C", "CURRENT PROJECT"], ["Understand", `/app/project/${projectId}/understand`, "", "CURRENT PROJECT"]] as const : [];
    return [...projectItems, ...globalItems].filter(([label]) => label.toLowerCase().includes(query.toLowerCase()));
  }, [projectId, query]);
  return <><button aria-haspopup="dialog" aria-label="Open command palette" className="command-trigger" onClick={() => setOpen(true)} ref={triggerRef} type="button"><span>COMMANDS</span><kbd>CTRL K</kbd></button>{open ? <div className="command-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) closePalette(); }} role="presentation"><section aria-label="Command palette" aria-modal="true" className="command-palette" onKeyDown={(event) => { trapFocus(event); if ((event.key === "ArrowDown" || event.key === "ArrowUp") && items.length) { event.preventDefault(); const next = (active + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length; setActive(next); dialogRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-command]")[next]?.focus(); } }} ref={dialogRef} role="dialog"><header><span>&gt;_</span><input autoComplete="off" autoFocus aria-label="Filter commands" onChange={(event) => { setQuery(event.target.value); setActive(0); }} onKeyDown={(event) => { if (event.key === "ArrowDown" && items.length) { event.preventDefault(); dialogRef.current?.querySelector<HTMLAnchorElement>("a[data-command]")?.focus(); } }} placeholder="Search pages and project tools…" value={query} /><kbd>ESC</kbd></header><div>{items.length ? items.map(([label, href, shortcut, group], index) => <Link aria-current={pathname === href ? "page" : undefined} className={active === index ? "is-active" : ""} data-command href={href} key={`${label}-${href}`} onFocus={() => setActive(index)}><small>{group}</small><strong>{label}</strong>{shortcut ? <kbd>{shortcut}</kbd> : <span>&rarr;</span>}</Link>) : <div className="command-empty"><strong>No matching command.</strong><button onClick={() => setQuery("")} type="button">Clear search</button></div>}</div><footer><span>↑↓ Navigate</span><span>Enter Open</span><span>Esc Close</span></footer></section></div> : null}</>;
}
