import Link from "next/link";
import { MarketingNav } from "../components/marketing-nav";
import { MarketingFooter } from "../components/marketing-footer";
import { ProjectBrainHero } from "../components/project-brain-hero";
import { LandingDemo } from "../components/landing-demo";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ink text-paper selection:bg-cyan selection:text-ink overflow-x-hidden font-sans relative">
      <MarketingNav />
      
      <main>
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
          {/* 3D Background */}
          <ProjectBrainHero />
          
          <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
            <span className="font-mono text-[10px] tracking-widest text-cyan uppercase mb-8 border border-cyan/20 bg-cyan/10 px-3 py-1">
              CONTINUOUS PROJECT VERIFICATION
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-8 leading-[1.1]">
              Build fast with AI.<br />
              HARIKOS keeps the<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan to-white">project straight.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted max-w-2xl mb-12 leading-relaxed">
              One shared, continuously verified project brain for Codex, Claude, Cursor, and you. Give your agents the truth, not a stale memory.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/login" className="h-14 px-8 flex items-center justify-center gap-3 bg-white text-ink hover:bg-paper-soft font-mono font-bold text-xs tracking-wide transition-colors">
                Connect GitHub &rarr;
              </Link>
              <Link href="#architecture" className="h-14 px-8 flex items-center justify-center gap-3 border border-line hover:border-cyan text-white bg-ink-soft/50 font-mono font-bold text-xs tracking-wide transition-colors">
                Explore Architecture
              </Link>
            </div>
            
            <div className="flex flex-wrap gap-8 mt-16 font-mono text-[9px] tracking-widest text-muted uppercase">
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-cyan animate-pulse"></span> READ-ONLY BY DEFAULT</span>
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-cyan animate-pulse"></span> EVIDENCE ON EVERY TRUTH</span>
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-cyan animate-pulse"></span> AGENT-NEUTRAL</span>
            </div>
          </div>
        </section>

        {/* TERMINAL DEMO SECTION */}
        <section id="architecture" className="py-24 px-6 md:px-16 border-t border-line bg-ink-elevated relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-cyan to-transparent opacity-50" />
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-6">
              <span className="font-mono text-[10px] tracking-widest text-cyan uppercase">TEMPORAL TRUTH RESOLUTION</span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                Agents hallucinate.<br />
                The repository does not.
              </h2>
              <p className="text-muted leading-relaxed text-lg">
                When code changes, HARIKOS reevaluates the project state. Stale documentation is marked as superseded, active implementations are verified, and the next agent receives perfectly scoped, accurate context.
              </p>
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex items-start gap-4">
                  <span className="text-cyan font-mono mt-1">01</span>
                  <div>
                    <strong className="block text-white mb-1">Observe Evidence</strong>
                    <span className="text-sm text-muted">Scan the repository for new facts.</span>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-cyan font-mono mt-1">02</span>
                  <div>
                    <strong className="block text-white mb-1">Resolve Truth</strong>
                    <span className="text-sm text-muted">Contradictions are flattened. The newest evidence wins.</span>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-cyan font-mono mt-1">03</span>
                  <div>
                    <strong className="block text-white mb-1">Pass Context</strong>
                    <span className="text-sm text-muted">Agents retrieve a highly compressed Context Pack.</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-cyan/5 blur-[100px] rounded-full pointer-events-none" />
              <LandingDemo />
            </div>
          </div>
        </section>

        {/* GRID FEATURES SECTION */}
        <section className="py-32 px-6 md:px-16 relative bg-ink">
          <div className="max-w-3xl mx-auto text-center mb-24">
            <span className="font-mono text-[10px] tracking-widest uppercase text-orange mb-6 block">CORE INFRASTRUCTURE</span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
              A project your agents can actually understand.
            </h2>
          </div>
          
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-line border border-line">
            
            {/* Project Truth */}
            <article className="bg-ink p-12 flex flex-col group hover:bg-ink-soft transition-colors duration-500">
              <span className="font-mono text-[10px] tracking-widest text-muted self-end mb-8 transition-colors group-hover:text-cyan">01</span>
              <div className="w-12 h-12 border border-cyan/30 bg-cyan/5 text-cyan flex items-center justify-center font-mono text-xl mb-8">◎</div>
              <h3 className="text-2xl font-bold text-white mb-4">Project Truth</h3>
              <p className="text-muted leading-relaxed mb-12 flex-1">
                Important facts are structured, scoped, confidence-rated, and attached to the raw evidence that supports them.
              </p>
            </article>
            
            {/* Memory Log */}
            <article className="bg-ink p-12 flex flex-col group hover:bg-ink-soft transition-colors duration-500">
              <span className="font-mono text-[10px] tracking-widest text-muted self-end mb-8 transition-colors group-hover:text-orange">02</span>
              <div className="w-12 h-12 border border-orange/30 bg-orange/5 text-orange flex items-center justify-center font-mono text-xl mb-8">⧖</div>
              <h3 className="text-2xl font-bold text-white mb-4">Memory & Outcomes</h3>
              <p className="text-muted leading-relaxed mb-12 flex-1">
                A persistent log of decisions, failed attempts, and constraints. Never let an agent repeat a mistake you fixed last week.
              </p>
            </article>

            {/* Context Packs */}
            <article className="bg-ink p-12 flex flex-col group hover:bg-ink-soft transition-colors duration-500">
              <span className="font-mono text-[10px] tracking-widest text-muted self-end mb-8 transition-colors group-hover:text-white">03</span>
              <div className="w-12 h-12 border border-line bg-ink-elevated text-white flex items-center justify-center font-mono text-xl mb-8">↗</div>
              <h3 className="text-2xl font-bold text-white mb-4">Context Packs</h3>
              <p className="text-muted leading-relaxed mb-12 flex-1">
                Every task gets the smallest useful set of current truths, constraints, changes, and relevant files via the MCP interface.
              </p>
            </article>
          </div>
        </section>

        {/* CTA */}
        <section className="py-40 px-6 border-t border-line flex flex-col items-center justify-center text-center bg-[#050505] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,217,232,0.05),transparent_50%)] pointer-events-none" />
          <span className="font-mono text-[10px] tracking-widest uppercase text-cyan mb-6 block relative z-10">THE PROJECT BRAIN IS WAITING</span>
          <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-12 max-w-4xl relative z-10">
            Stop losing the plot.<br/>Start shipping.
          </h2>
          <Link href="/login" className="h-14 px-10 flex items-center justify-center gap-3 bg-white text-ink hover:bg-paper-soft font-mono font-bold text-sm tracking-wide transition-colors relative z-10">
            Connect your first repository &rarr;
          </Link>
        </section>
      </main>
      
      <MarketingFooter />
    </div>
  );
}
