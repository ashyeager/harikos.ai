"use client";

import dynamic from "next/dynamic";

const CanonicalProjectStateSphere = dynamic(() => import("./ProjectStateSphere").then((module) => module.ProjectStateSphere), {
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
  return <CanonicalProjectStateSphere />;
}
