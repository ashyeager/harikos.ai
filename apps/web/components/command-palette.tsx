"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const globalItems = [["Dashboard", "/app/dashboard", "GD"], ["Projects", "/app/projects", "GP"], ["Profile", "/app/settings/profile", "SP"], ["Billing", "/app/settings/billing", "SB"], ["Security", "/app/settings/security", "SS"]] as const;

export function CommandPalette({ projectId }: { projectId?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setOpen((value) => !value); }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const items = useMemo(() => {
    const projectItems = projectId ? [["Project overview", `/app/project/${projectId}`, "PO"], ["Project Truth", `/app/project/${projectId}/truth`, "PT"], ["Memory", `/app/project/${projectId}/memory`, "PM"], ["Changes", `/app/project/${projectId}/changes`, "PC"], ["Agents", `/app/project/${projectId}/agents`, "PA"], ["Context", `/app/project/${projectId}/context`, "PX"], ["Understand", `/app/project/${projectId}/understand`, "PU"]] as const : [];
    return [...projectItems, ...globalItems].filter(([label]) => label.toLowerCase().includes(query.toLowerCase()));
  }, [projectId, query]);
  return <><button aria-label="Open command palette" className="command-trigger" onClick={() => setOpen(true)} type="button"><span>COMMANDS</span><kbd>CTRL K</kbd></button>{open ? <div className="command-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }} role="presentation"><section aria-label="Command palette" aria-modal="true" className="command-palette" role="dialog"><header><span>&gt;_</span><input autoFocus aria-label="Filter commands" onChange={(event) => setQuery(event.target.value)} placeholder="Go to a page..." value={query} /><kbd>ESC</kbd></header><div>{items.length ? items.map(([label, href, shortcut]) => <Link href={href} key={href} onClick={() => setOpen(false)}><i>{shortcut}</i><strong>{label}</strong><span>&rarr;</span></Link>) : <p>No matching command.</p>}</div><footer><span>Navigate</span><span>Enter to open</span><span>Esc to close</span></footer></section></div> : null}</>;
}
