"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { Brand } from "./brand";
import { CommandPalette } from "./command-palette";
import { SideNav } from "./side-nav";

export interface AppProjectSummary { id: string; name: string; owner?: string; branch: string; sha: string; scannedAt: string; mode: string; openContradictions: number; }

export function AppChrome({ project, children }: { project: AppProjectSummary | undefined; children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => { if (!menuOpen) return; const close = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); }; window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, [menuOpen]);
  return <div className={`app-frame ${menuOpen ? "mobile-nav-open" : ""}`}>
    <button aria-label="Close navigation" className="sidebar-scrim" onClick={() => setMenuOpen(false)} type="button" />
    <aside className="app-sidebar"><div className="sidebar-brand"><Brand /></div><Link className="project-switcher" href="/app/projects"><span className="repo-avatar">{project ? project.name.slice(0, 2).toUpperCase() : "H"}</span><span><small>{project ? "ACTIVE PROJECT" : "PROJECT WORKSPACE"}</small><strong>{project?.name ?? "Choose a project"}</strong></span><b>&#8964;</b></Link>{project ? <SideNav projectId={project.id} /> : <nav aria-label="Workspace navigation" className="side-nav"><span className="nav-label">WORKSPACE</span><Link className={pathname === "/app/dashboard" ? "active" : ""} href="/app/dashboard"><i>DB</i><span>Dashboard</span></Link><Link className={pathname === "/app/projects" ? "active" : ""} href="/app/projects"><i>RP</i><span>Repositories</span></Link></nav>}<div className="sidebar-bottom"><Link className={pathname.startsWith("/app/settings") ? "active" : ""} href="/app/settings/profile"><i>ST</i><span>Settings</span></Link><div className="sidebar-profile"><span>AI</span><div><strong>{project ? (project.mode === "github" ? "GitHub project" : "Local proof") : "HARIKOS account"}</strong><small>{project ? `${project.branch} / ${project.sha.slice(0, 8)}` : "Authenticated workspace"}</small></div></div></div></aside>
    <div className="app-workspace"><header className="app-topbar"><button aria-expanded={menuOpen} aria-label="Open navigation" className="app-menu-button" onClick={() => setMenuOpen((value) => !value)} type="button"><i /><i /></button><div className={`scan-health ${project?.openContradictions ? "has-attention" : ""}`}><i />{project ? <><strong>{project.openContradictions ? `${project.openContradictions} OPEN CONTRADICTION${project.openContradictions === 1 ? "" : "S"}` : "LAST SCAN COMPLETE"}</strong><span>{new Date(project.scannedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} / {project.sha.slice(0, 8)}</span></> : <><strong>WORKSPACE</strong><span>SELECT OR CONNECT A PROJECT</span></>}</div><div className="topbar-actions"><CommandPalette projectId={project?.id} />{project ? <Link className="topbar-context" href={`/app/project/${project.id}/context`}>Prepare context <span>&rarr;</span></Link> : <Link className="topbar-context" href="/app/projects">Projects <span>&rarr;</span></Link>}</div></header><main className="app-content">{children}</main></div>
  </div>;
}
