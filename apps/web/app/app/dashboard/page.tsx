"use client";

import Link from "next/link";
import useSWR from "swr";
import { useMemo, useState } from "react";

import { AppShell } from "../../../components/app-shell";

type Project = { id: string; name: string; owner?: string; repository?: string; private?: boolean; lastCommitSha?: string | null; mode?: string };
type Snapshot = { projectId: string; truths: Array<{ status: string }>; contradictions: Array<{ status: string }>; scannedAt?: string; sourceCount?: number; repository?: { name: string; owner?: string; defaultBranch?: string } };
const fetcher = (url: string) => fetch(url).then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error ?? "Request failed."); return body; });

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR<{ projects?: Project[] }>("/api/projects", fetcher, { revalidateOnFocus: false });
  const projects = data?.projects ?? [];
  const [selectedProject, setSelectedProject] = useState("");
  const selectedId = selectedProject || projects[0]?.id || "";
  const { data: snapshot, error: detailError, isLoading: detailLoading } = useSWR<Snapshot>(selectedId ? `/api/projects/${encodeURIComponent(selectedId)}` : null, fetcher, { revalidateOnFocus: false });
  const verified = useMemo(() => snapshot?.truths.filter((claim) => claim.status === "verified").length ?? 0, [snapshot]);
  const contradictions = useMemo(() => snapshot?.contradictions.filter((item) => item.status === "open").length ?? 0, [snapshot]);

  return (
    <AppShell>
      <main className="dashboard-page" aria-labelledby="dashboard-title">
        <header className="dashboard-heading"><div><span className="eyebrow"><i />PROJECT WORKSPACE</span><h1 id="dashboard-title">HARIKOS Dashboard</h1><p>Build fast with AI. HARIKOS keeps the project straight.</p></div><Link className="button-primary" href="/app/projects">Connect repository <span>&rarr;</span></Link></header>
        <section aria-label="Workspace statistics" className="dashboard-stats"><article className="dashboard-stat"><span>Projects</span><strong>{isLoading ? "—" : projects.length}</strong></article><article className="dashboard-stat"><span>Verified Claims</span><strong>{detailLoading ? "—" : verified}</strong></article><article className="dashboard-stat"><span>Contradictions</span><strong>{detailLoading ? "—" : contradictions}</strong></article><article className="dashboard-stat"><span>Context Freshness</span><strong>{snapshot ? "100%" : "—"}</strong></article></section>
        {error ? <div className="inline-error" role="alert">{error.message}</div> : null}
        <section className="dashboard-section" aria-labelledby="projects-title"><div className="section-heading"><div><span>CONNECTED WORKSPACES</span><h2 id="projects-title">Projects</h2></div><Link href="/app/projects">View all <span>&rarr;</span></Link></div><div className="project-grid">
          {isLoading ? <div className="dashboard-empty"><h3>Loading projects</h3><p>Checking your connected workspaces.</p></div> : projects.length ? projects.map((project) => <button className={`project-card ${selectedId === project.id ? "project-card-selected" : ""}`} key={project.id} onClick={() => setSelectedProject(project.id)} type="button" aria-pressed={selectedId === project.id}><span className="project-card-top"><i className="status-dot healthy" />CONNECTED<span className="project-time">{project.lastCommitSha ? project.lastCommitSha.slice(0, 8) : "NEW"}</span></span><span><h3>{project.name}</h3><p className="project-repo">{project.owner ? `${project.owner}/` : ""}{project.repository ?? project.name}</p></span><span className="project-card-meta"><span>{selectedId === project.id ? verified : "—"} claims</span><span>{selectedId === project.id ? contradictions : "—"} contradictions</span></span></button>) : <div className="dashboard-empty"><h3>No projects yet</h3><p>Connect a repository to create your first Project Brain.</p><Link className="button-primary" href="/app/projects">Connect repository</Link></div>}
        </div></section>
        {detailError ? <div className="inline-error" role="alert">{detailError.message}</div> : null}
        <section className="dashboard-actions" aria-label="Selected project overview"><article><span>SELECTED PROJECT</span><h3>{snapshot?.repository?.name ?? (detailLoading ? "Loading project" : "No project selected")}</h3><p>{snapshot ? `${verified} verified claims are keeping this repository aligned.` : "Choose a connected project to see its current state."}</p><Link href={selectedId ? `/app/project/${selectedId}` : "/app/projects"}>Open project <span>&rarr;</span></Link></article><article><span>CONTEXT HEALTH</span><h3>{snapshot ? "100% fresh" : "Awaiting project"}</h3><p>{snapshot ? "Project context is ready to share with your coding agent." : "Connect a repository to build evidence-backed context."}</p><Link href={selectedId ? `/app/project/${selectedId}/context` : "/app/projects"}>Prepare context <span>&rarr;</span></Link></article></section>
        <section className="dashboard-section" aria-labelledby="activity-title"><div className="section-heading"><div><span>RECENT SIGNALS</span><h2 id="activity-title">Activity</h2></div><span className="dashboard-live-status"><i />LIVE</span></div><div className="panel dashboard-activity"><p className="empty-state">{snapshot ? `Last scan${snapshot.scannedAt ? ` completed ${new Date(snapshot.scannedAt).toLocaleString()}` : " completed"}.` : "No activity recorded yet."}</p></div></section>
      </main>
    </AppShell>
  );
}
