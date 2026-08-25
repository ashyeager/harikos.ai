"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LandingDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((current) => (current + 1) % 4);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto border border-line bg-ink-elevated shadow-2xl overflow-hidden rounded-sm font-mono text-xs">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-ink">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-line" />
          <div className="w-2 h-2 rounded-full bg-line" />
          <div className="w-2 h-2 rounded-full bg-line" />
        </div>
        <div className="text-muted tracking-widest text-[9px] uppercase">harikos-truth-engine</div>
        <div className="flex items-center gap-2 text-[9px]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
          <span className="text-cyan">LIVE</span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col gap-6 min-h-[320px]">
        
        {/* INITIAL TASK */}
        <div className="flex gap-4 items-start">
          <div className="text-muted shrink-0 pt-0.5">$</div>
          <div className="flex flex-col gap-1">
            <span className="text-white">harikos context "replace clerk with supabase"</span>
            <AnimatePresence>
              {step >= 0 && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-muted"
                >
                  Analyzing project state...
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* REPO CHANGES */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pl-4 border-l-2 border-line flex flex-col gap-3"
            >
              <div className="text-[10px] tracking-widest text-cyan uppercase mb-1">Evidence Detected</div>
              <div className="text-muted flex justify-between">
                <span><span className="text-red">-</span> middleware.ts:12-48</span>
                <span className="text-red text-[9px] border border-red/20 bg-red/10 px-1">SUPERSEDED</span>
              </div>
              <div className="text-muted flex justify-between">
                <span><span className="text-green">+</span> lib/supabase/server.ts</span>
                <span className="text-green text-[9px] border border-green/20 bg-green/10 px-1">VERIFIED</span>
              </div>
              <div className="text-muted flex justify-between">
                <span><span className="text-orange">~</span> README.md</span>
                <span className="text-orange text-[9px] border border-orange/20 bg-orange/10 px-1">STALE</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MEMORY RESOLUTION */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-ink p-4 border border-line flex flex-col gap-2 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2">
                <span className="text-[9px] bg-white text-ink px-1 font-bold tracking-widest">TRUTH_UPDATE</span>
              </div>
              <span className="text-white">Auth Infrastructure:</span>
              <div className="flex items-center gap-3">
                <span className="text-muted line-through">Clerk</span>
                <span className="text-muted">&rarr;</span>
                <span className="text-cyan font-bold">Supabase</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AGENT HANDOFF */}
        <AnimatePresence>
          {step >= 3 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-auto pt-4 border-t border-line text-cyan"
            >
              <span className="animate-pulse mr-2">▶</span>
              Context Pack created. Ready for next agent.
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </div>
  );
}
