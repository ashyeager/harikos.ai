"use client";

import dynamic from "next/dynamic";

const HexagonHero = dynamic(() => import("./HexagonHero").then((module) => module.HexagonHero), {
  ssr: false,
  loading: () => (
    <div className="brain-loading" aria-label="Loading interactive Project Brain">
      <i />
      <i />
      <i />
      <span>INITIALIZING PROJECT BRAIN</span>
    </div>
  ),
});

export function ProjectBrain() {
  return <HexagonHero />;
}
