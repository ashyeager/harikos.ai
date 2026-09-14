"use client";

import { useMemo, useState } from "react";
import type { ProjectTruthClaim } from "@harikos/core";
import { TruthCard } from "./truth-card";

const filters = [
  ["all", "ALL"],
  ["verified", "VERIFIED"],
  ["likely", "LIKELY"],
  ["superseded", "SUPERSEDED"],
  ["contradicted", "CONTRADICTED"],
  ["stale", "STALE"],
] as const;

type Filter = (typeof filters)[number][0];

export function TruthBoard({ claims, projectId }: { claims: ProjectTruthClaim[]; projectId: string }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [visibleCount, setVisibleCount] = useState(24);
  const counts = useMemo(() => Object.fromEntries(filters.map(([key]) => [key, key === "all" ? claims.length : claims.filter((claim) => claim.status === key).length])) as Record<Filter, number>, [claims]);
  const visible = filter === "all" ? claims : claims.filter((claim) => claim.status === filter);
  const displayed = visible.slice(0, visibleCount);
  const categories = Array.from(new Set(displayed.map((claim) => claim.category)));

  return (
    <>
      <div className="filter-bar" role="group" aria-label="Filter Truth by status">
        {filters.map(([key, label]) => (
          <button aria-pressed={filter === key} className={filter === key ? "selected-filter" : ""} key={key} onClick={() => { setFilter(key); setVisibleCount(24); }} type="button">
            {label} <b>{counts[key]}</b>
          </button>
        ))}
      </div>
      {visible.length ? (
        <div className="flex flex-col gap-16">
          {categories.map((category) => {
            const categoryClaims = displayed.filter((claim) => claim.category === category);
            return (
              <section className="scroll-mt-24" id={category} key={category}>
                <div className="flex items-end justify-between border-b border-line pb-3 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-orange/50 rounded-full" />
                    <h2 className="text-xl font-bold text-white capitalize">{category}</h2>
                  </div>
                  <span className="font-mono text-[9px] tracking-widest uppercase text-muted bg-ink-soft px-2 py-1 rounded-sm border border-line">
                    {categoryClaims.length} claims
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryClaims.map((claim) => <TruthCard claim={claim} projectId={projectId} key={claim.id} />)}
                </div>
              </section>
            );
          })}
          {visibleCount < visible.length ? <button className="button button-ghost load-more-button" onClick={() => setVisibleCount((count) => count + 24)} type="button">Load 24 more claims <span>↓</span></button> : null}
        </div>
      ) : (
        <section className="bg-ink border border-line rounded-sm p-12 text-center">
          <p className="text-sm text-white mb-2">{claims.length ? "No claims match this status." : "No Project Truth yet."}</p>
          <p className="text-[11px] text-muted">{claims.length ? "Choose another status, or open Memory for historical records." : "Run a repository scan to derive evidence-backed claims."}</p>
          {claims.length ? <button className="button button-ghost mt-5" onClick={() => setFilter("all")} type="button">Reset filters</button> : null}
        </section>
      )}
    </>
  );
}
