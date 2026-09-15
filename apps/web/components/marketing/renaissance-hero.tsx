"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export function RenaissanceHero({ startHref }: { startHref: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const progress = useSpring(scrollYProgress, { damping: 34, mass: .18, stiffness: 180 });
  const artY = useTransform(progress, [0, 1], [0, reducedMotion ? 0 : 52]);
  const artScale = useTransform(progress, [0, 1], [1.035, reducedMotion ? 1.035 : 1.09]);
  const artOpacity = useTransform(progress, [0, .82], [.72, reducedMotion ? .72 : .15]);
  const copyY = useTransform(progress, [0, 1], [0, reducedMotion ? 0 : -18]);
  const copyOpacity = useTransform(progress, [0, .78], [1, reducedMotion ? 1 : .12]);

  return (
    <section className="home-hero final-home-hero renaissance-hero" ref={sectionRef}>
      <motion.div aria-hidden="true" className="renaissance-hero-art" style={{ opacity: artOpacity, scale: artScale, y: artY }}>
        <Image alt="" fill priority sizes="100vw" src="/media/harikos-fresco-hands.webp" />
      </motion.div>
      <div aria-hidden="true" className="renaissance-construction"><i /><i /><span /></div>
      <motion.div className="hero-copy" style={{ opacity: copyOpacity, y: copyY }}>
        <h1><span>Your agents can read the code.</span><strong>HARIKOS tells them what&apos;s actually true.</strong></h1>
        <p className="hero-support">One verified project state. Every agent.</p>
        <div className="hero-actions">
          <Link className="button button-primary button-large" href={startHref}>Start Free <span aria-hidden="true">↗</span></Link>
          <Link className="button button-secondary button-large" href="#product-demo">Watch the product walkthrough <span aria-hidden="true">↓</span></Link>
        </div>
      </motion.div>
      <div aria-hidden="true" className="hero-state-gap"><span>HUMAN INTENT</span><i /><span>MACHINE EXECUTION</span></div>
    </section>
  );
}
