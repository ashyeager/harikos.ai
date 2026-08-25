"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, BrainCircuit, Activity, Database, Users, Settings, FolderOpen, CreditCard, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!open) return null;

  const commands = [
    { category: "Navigation", id: "projects", title: "Project Workspaces", icon: FolderOpen, route: "/app/projects" },
    { category: "Navigation", id: "pricing", title: "View Pricing & Plans", icon: CreditCard, route: "/pricing" },
    { category: "Navigation", id: "settings", title: "System Configuration", icon: Settings, route: "/app/settings" },
    { category: "Current Project", id: "dashboard", title: "Project Overview", icon: Activity, action: "Navigate" },
    { category: "Current Project", id: "truth", title: "Project Truth", icon: Database, action: "Navigate" },
    { category: "Current Project", id: "memory", title: "Project Memory", icon: BrainCircuit, action: "Navigate" },
    { category: "Current Project", id: "agents", title: "Agent Connections", icon: Users, action: "Navigate" },
  ];

  const filteredCommands = commands.filter((command) =>
    command.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div 
        className="fixed inset-0 bg-ink/80 backdrop-blur-sm" 
        onClick={() => setOpen(false)}
      />
      
      <div className="relative w-full max-w-xl bg-ink border border-line rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan/20 via-cyan to-cyan/20"></div>
        
        <div className="flex items-center px-4 py-4 border-b border-line gap-3 bg-ink-soft/50">
          <Search size={18} className="text-cyan" />
          <input
            className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm placeholder:text-muted"
            placeholder="Search commands or type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="font-mono text-[9px] tracking-widest text-muted uppercase bg-ink border border-line px-2 py-1 rounded-sm">ESC</kbd>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-muted font-mono text-xs">
              No results found for "{query}"
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filteredCommands.map((command, index) => {
                const Icon = command.icon;
                return (
                  <button
                    key={command.id}
                    onClick={() => {
                      if (command.route) {
                        router.push(command.route);
                      }
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-sm transition-colors text-left group",
                      index === 0 ? "bg-ink-soft border border-line text-white" : "hover:bg-ink-soft/50 text-muted hover:text-white border border-transparent"
                    )}
                  >
                    <Icon size={16} className={cn("transition-colors", index === 0 ? "text-cyan" : "group-hover:text-cyan")} />
                    <div className="flex-1 flex flex-col min-w-0">
                      <span className="text-sm font-medium">{command.title}</span>
                      <span className="text-[10px] font-mono uppercase tracking-widest opacity-50">{command.category}</span>
                    </div>
                    {index === 0 && (
                      <kbd className="font-mono text-[9px] tracking-widest text-muted uppercase bg-ink border border-line px-2 py-1 rounded-sm">ENTER</kbd>
                    )}
                    <ChevronRight size={14} className={cn("opacity-0 transition-opacity", index === 0 ? "opacity-100 text-cyan" : "group-hover:opacity-100")} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="px-4 py-3 bg-ink-soft border-t border-line flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-muted">
          <span className="flex items-center gap-1.5"><kbd className="bg-ink border border-line px-1.5 py-0.5 rounded-sm">↑</kbd><kbd className="bg-ink border border-line px-1.5 py-0.5 rounded-sm">↓</kbd> to navigate</span>
          <span className="flex items-center gap-1.5"><kbd className="bg-ink border border-line px-1.5 py-0.5 rounded-sm">↵</kbd> to select</span>
        </div>
      </div>
    </div>
  );
}
