"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";

const stages = [
  { label: "Repository", file: "AUTHORIZED SOURCE", title: "A bounded repository scan finds relevant change.", body: "HARIKOS reads authorized repository signal without executing project code or treating every file as useful evidence.", output: "Relevant sources selected" },
  { label: "Evidence", file: "SOURCE / LINES / COMMIT", title: "Evidence keeps the claim inspectable.", body: "A claim keeps its source, lines, commit, confidence, and authority so agents can check the basis for a conclusion.", output: "Evidence linked to current commit" },
  { label: "Verified state", file: "CURRENT PROJECT STATE", title: "Current Truth separates proof from assumption.", body: "Current evidence supports the active claim. Earlier state stays in history rather than disappearing from the project story.", output: "Current claim verified" },
  { label: "Context", file: "TASK / RELEVANT STATE", title: "Context selects what this task needs.", body: "A Context Pack combines only the relevant Truth, evidence, constraints, changes, and Memory for the task in front of the agent.", output: "Context Pack assembled" },
  { label: "Agent", file: "MCP / PROJECT-SCOPED", title: "The next agent receives one current understanding.", body: "An authorized agent reads the same project-scoped state and can write back a bounded outcome without turning its own claims into Truth.", output: "Agent context ready" },
] as const;

export function ProjectStateFlow() {
  const [active, setActive] = useState(0);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const reducedMotion = useReducedMotion();
  const stage = stages[active]!;

  return (
    <div className="homepage-system-flow">
      <div aria-label="Illustrative HARIKOS project-state sequence" className="system-flow-steps" role="tablist">
        {stages.map((item, index) => (
          <button aria-controls="system-flow-panel" aria-selected={active === index} className={active === index ? "is-active" : ""} id={`system-flow-tab-${index}`} key={item.label} onClick={() => setActive(index)} onKeyDown={(event) => { const key = event.key; if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(key)) return; event.preventDefault(); const next = key === "Home" ? 0 : key === "End" ? stages.length - 1 : (active + (key === "ArrowRight" ? 1 : -1) + stages.length) % stages.length; setActive(next); tabsRef.current[next]?.focus(); }} ref={(node) => { tabsRef.current[index] = node; }} role="tab" tabIndex={active === index ? 0 : -1} type="button">
            <span>0{index + 1}</span><strong>{item.label}</strong>
          </button>
        ))}
      </div>
      <motion.div animate={reducedMotion ? undefined : { opacity: 1, y: 0 }} aria-labelledby={`system-flow-tab-${active}`} className="system-flow-stage" id="system-flow-panel" initial={reducedMotion ? false : { opacity: 0, y: 12 }} key={stage.label} role="tabpanel" transition={{ duration: 0.24, ease: "easeOut" }}>
        <div className="system-flow-source"><small>{stage.file}</small><i /><span>ILLUSTRATIVE SIGNAL</span></div>
        <div className="system-flow-copy"><p>{stage.title}</p><small>{stage.body}</small></div>
        <div className="system-flow-output"><span>HARIKOS OUTPUT</span><strong>{stage.output}</strong></div>
      </motion.div>
      <p className="system-flow-caption">Repository evidence establishes current state. Memory preserves history. Context only carries what the task needs.</p>
    </div>
  );
}
