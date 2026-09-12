"use client";

import dynamic from "next/dynamic";

const HexagonHero = dynamic(() => import("./HexagonHero").then((module) => module.HexagonHero), {
  ssr: false,
  loading: () => (
    <div className="brain-loading" aria-label="Loading interactive project-state object">
      <i />
      <i />
      <i />
      <span>ALIGNING PROJECT STATE</span>
    </div>
  ),
});

export function ProjectBrain() {
  return <HexagonHero />;
}
