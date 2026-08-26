"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";
import { LayoutDashboard, CheckCircle2, History, Cpu, FileClock, Search, BookOpen } from "lucide-react";

const items = [["Overview", "OV", ""], ["Project Truth", "TR", "/truth"], ["Memory", "ME", "/memory"], ["Changes", "CH", "/changes"], ["Agents", "AG", "/agents"], ["Context", "CX", "/context"], ["Understand", "UN", "/understand"]] as const;

export function SideNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/app/project/${projectId}`;
  return <nav className="side-nav" aria-label="Project navigation"><span className="nav-label">PROJECT</span>{items.map(([label, icon, suffix]) => { const href = `${base}${suffix}`; const active = suffix ? pathname.startsWith(href) : pathname === href; return <Link className={active ? "active" : ""} href={href} key={label}><i>{icon}</i><span>{label}</span></Link>; })}</nav>;
}
