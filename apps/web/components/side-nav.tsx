"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";
import { LayoutDashboard, CheckCircle2, History, Cpu, FileClock, Search, BookOpen } from "lucide-react";

const items = [
  { label: "Overview", icon: LayoutDashboard, suffix: "" },
  { label: "Project Truth", icon: CheckCircle2, suffix: "/truth", color: "text-cyan" },
  { label: "Memory", icon: History, suffix: "/memory", color: "text-orange" },
  { label: "Context Pack", icon: BookOpen, suffix: "/context", color: "text-white" },
  { label: "Changes", icon: FileClock, suffix: "/changes" },
  { label: "Agents", icon: Cpu, suffix: "/agents" },
  { label: "Understand", icon: Search, suffix: "/understand" },
] as const;

export function SideNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/app/project/${projectId}`;

  return (
    <nav aria-label="Project navigation" className="flex flex-col gap-1 w-full overflow-x-auto md:overflow-visible">
      <div className="flex md:flex-col min-w-max md:min-w-0">
        {items.map(({ label, icon: Icon, suffix, color }) => {
          const href = `${base}${suffix}`;
          const active = suffix ? pathname.startsWith(href) : pathname === href;
          
          return (
            <Link 
              key={label}
              href={href}
              className={cn(
                "h-9 px-3 flex items-center gap-3 text-xs transition-all relative rounded-sm group",
                active 
                  ? "text-white bg-ink-elevated border border-line shadow-sm" 
                  : "text-muted hover:text-white hover:bg-ink border border-transparent"
              )}
            >
              <Icon size={14} className={cn(active ? (color || "text-white") : "text-muted group-hover:text-muted-dark transition-colors")} strokeWidth={active ? 2.5 : 2} />
              <span className="hidden md:inline font-medium">{label}</span>
              
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-cyan hidden md:block rounded-r-full shadow-[0_0_8px_rgba(0,217,232,0.6)]"></span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
