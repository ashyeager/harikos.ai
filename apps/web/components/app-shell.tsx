import type { ProjectSnapshot } from "@harikos/core";
import Link from "next/link";
import type { ReactNode } from "react";

import { Brand } from "./brand";
import { SideNav } from "./side-nav";

export function AppShell({
  snapshot,
  children,
}: {
  snapshot: ProjectSnapshot;
  children: ReactNode;
}) {
  return (
    <div className="app-frame">
      <aside className="app-sidebar">
        <Brand compact />
        <Link className="project-switcher" href="/app/projects">
          <span className="repo-avatar">{snapshot.repository.name.slice(0, 2).toUpperCase()}</span>
          <span><small>ACTIVE PROJECT</small><strong>{snapshot.repository.name}</strong></span>
          <b>⌄</b>
        </Link>
        <SideNav projectId={snapshot.projectId} />
        <div className="sidebar-bottom">
          <Link href="/app/settings"><i>⚙</i><span>Settings</span></Link>
          <div className="sidebar-profile">
            <span>AK</span>
            <div><strong>{snapshot.mode === "github" ? "GitHub project" : snapshot.mode === "fixture" ? "Demo workspace" : "Local builder"}</strong><small>{snapshot.mode === "fixture" ? "Verified fixture" : snapshot.mode}</small></div>
          </div>
        </div>
      </aside>
      <div className="app-workspace">
        <header className="app-topbar">
          <Link className="mobile-brand" href="/app/dashboard">H/AI</Link>
          <div className="scan-health"><i /> PROJECT TRUTH CURRENT <span>{snapshot.repository.headSha.slice(0, 8)}</span></div>
          <div className="topbar-actions">
            <Link href={`/app/project/${snapshot.projectId}/context`}>Prepare context</Link>
            <Link className="icon-button" href="/app/settings" aria-label="Open settings">⚙</Link>
          </div>
        </header>
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}
