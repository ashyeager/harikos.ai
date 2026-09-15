"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { usePathname } from "next/navigation";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reducedMotion = useReducedMotion();
  const pathname = usePathname();
  const scaleX = useSpring(scrollYProgress, { damping: 34, mass: .2, stiffness: 210 });

  if (pathname.startsWith("/app") || pathname.startsWith("/auth") || pathname === "/login") return null;
  return <motion.div aria-hidden="true" className="scroll-progress" style={{ scaleX: reducedMotion ? scrollYProgress : scaleX }} />;
}
