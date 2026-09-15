"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function Reveal({ children, className, mode = "copy" }: { children: ReactNode; className?: string; mode?: "copy" | "stage" }) {
  const reducedMotion = useReducedMotion();
  const initial = mode === "stage" ? { clipPath: "inset(0 0 12% 0)", opacity: 0, scale: .992 } : { opacity: 0, y: 14 };
  const visible = mode === "stage" ? { clipPath: "inset(0 0 0% 0)", opacity: 1, scale: 1 } : { opacity: 1, y: 0 };

  return <motion.div className={className} initial={reducedMotion ? false : initial} transition={{ duration: .48, ease: [0.22, 1, 0.36, 1] }} viewport={{ amount: .14, once: true }} whileInView={reducedMotion ? undefined : visible}>{children}</motion.div>;
}
