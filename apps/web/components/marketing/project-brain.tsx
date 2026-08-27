"use client";

import dynamic from "next/dynamic";

const BrainCanvas = dynamic(() => import("./brain-canvas").then((module) => module.default), {
  ssr: false,
  loading: () => <div className="brain-loading" aria-label="Loading interactive Project Brain"><i /><i /><i /><span>INITIALIZING PROJECT GRAPH</span></div>,
});

export function ProjectBrain() { return <BrainCanvas />; }
