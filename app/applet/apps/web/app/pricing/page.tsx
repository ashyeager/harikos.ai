import Link from "next/link";
import { MarketingNav } from "../../components/marketing-nav";
import { MarketingFooter } from "../../components/marketing-footer";

export const metadata = {
  title: "Pricing",
  description: "Simple pricing for your project brain."
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-ink text-paper selection:bg-cyan selection:text-ink overflow-x-hidden font-sans">
      <MarketingNav />
      <main>
        {/* HEADER */}
        <section className="relative pt-40 pb-20 px-6 text-center max-w-4xl mx-auto flex flex-col items-center">
          <span className="font-mono text-[10px] tracking-widest text-cyan uppercase mb-6">Pricing</span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-8">
            Simple pricing.<br />No surprises.
          </h1>
          <p className="text-lg text-muted max-w-2xl">
            Start verifying your projects for free. Upgrade when your AI agents need more context, memory, and repositories to work across.
          </p>
        </section>

        {/* PRICING GRID */}
        <section className="px-6 md:px-16 pb-40 max-w-6xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line border border-line">
            
            {/* FREE PLAN */}
            <div className="bg-ink flex flex-col group hover:bg-ink-soft transition-colors duration-500">
              <div className="p-12 border-b border-line flex flex-col">
                <span className="font-mono text-[10px] tracking-widest text-muted uppercase mb-4">Free</span>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-6xl font-black text-white">$0</span>
                  <span className="font-mono text-[10px] text-muted tracking-widest uppercase">/ month</span>
                </div>
                <p className="text-sm text-muted">
                  For solo builders needing a verified project brain.
                </p>
              </div>
              <div className="p-12 flex-1 flex flex-col">
                <ul className="flex flex-col gap-6 mb-12 flex-1">
                  <li className="flex items-start gap-4">
                    <span className="text-cyan font-mono font-bold mt-1 text-sm">◎</span>
                    <span className="text-sm text-white">1 repository</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-cyan font-mono font-bold mt-1 text-sm">◎</span>
                    <span className="text-sm text-white">1 active agent connection</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-cyan font-mono font-bold mt-1 text-sm">◎</span>
                    <span className="text-sm text-white">250 memories per project</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-cyan font-mono font-bold mt-1 text-sm">◎</span>
                    <span className="text-sm text-white">25 context packs per month</span>
                  </li>
                </ul>
                <Link href="/login" className="h-14 flex items-center justify-center border border-line hover:border-cyan text-white bg-ink-soft/50 group-hover:bg-ink font-mono font-bold text-xs tracking-wide transition-colors uppercase w-full">
                  Start for Free &rarr;
                </Link>
              </div>
            </div>

            {/* PRO PLAN */}
            <div className="bg-ink flex flex-col relative group hover:bg-ink-soft transition-colors duration-500">
              <div className="absolute top-0 right-0 m-6">
                 <span className="px-4 py-2 font-mono text-[10px] tracking-widest font-bold uppercase rounded-sm border bg-cyan/10 text-cyan border-cyan/20">
                   RECOMMENDED
                 </span>
              </div>
              <div className="p-12 border-b border-line flex flex-col">
                <span className="font-mono text-[10px] tracking-widest text-orange uppercase mb-4">Pro</span>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-6xl font-black text-white">$15</span>
                  <span className="font-mono text-[10px] text-muted tracking-widest uppercase">/ month</span>
                </div>
                <p className="text-sm text-muted">
                  For professional builders scaling multi-agent workflows.
                </p>
              </div>
              <div className="p-12 flex-1 flex flex-col">
                <ul className="flex flex-col gap-6 mb-12 flex-1">
                  <li className="flex items-start gap-4">
                    <span className="text-orange font-mono font-bold mt-1 text-sm">◎</span>
                    <span className="text-sm text-white">Up to 5 repositories</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-orange font-mono font-bold mt-1 text-sm">◎</span>
                    <span className="text-sm text-white">Up to 5 active agent connections</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-orange font-mono font-bold mt-1 text-sm">◎</span>
                    <span className="text-sm text-white">Unlimited memories per project</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-orange font-mono font-bold mt-1 text-sm">◎</span>
                    <span className="text-sm text-white">Unlimited context packs per month</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-orange font-mono font-bold mt-1 text-sm">◎</span>
                    <span className="text-sm text-white">Priority support</span>
                  </li>
                </ul>
                <Link href="/login" className="h-14 flex items-center justify-center bg-white text-ink hover:bg-paper-soft font-mono font-bold text-xs tracking-wide transition-colors uppercase w-full">
                  Sign in to Upgrade &rarr;
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* FAQ OR EXTRA TEXT */}
        <section className="px-6 pb-40 max-w-4xl mx-auto w-full border-t border-line pt-24">
          <h2 className="font-mono text-[10px] tracking-widest uppercase text-cyan mb-16 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="flex flex-col gap-4">
              <h3 className="text-white font-bold text-lg">Do you offer team plans?</h3>
              <p className="text-muted text-sm leading-relaxed">
                We are currently focused on individual builders and multi-agent workflows. Team collaboration and centralized billing will be introduced in an upcoming Enterprise tier.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-white font-bold text-lg">What happens when I hit the free limit?</h3>
              <p className="text-muted text-sm leading-relaxed">
                HARIKOS will pause accepting new memories or generating new context packs until the billing cycle resets, or you upgrade to the Pro plan. Your project truth remains intact and readable by agents.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-white font-bold text-lg">How are repositories counted?</h3>
              <p className="text-muted text-sm leading-relaxed">
                Repositories are counted by the number of active GitHub projects you have connected and scanned. You can disconnect a repository at any time to free up your quota.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-white font-bold text-lg">Can I cancel anytime?</h3>
              <p className="text-muted text-sm leading-relaxed">
                Yes. You can manage your subscription directly from your settings. If you cancel, you will retain access to Pro features until the end of your current billing period.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6 border-t border-line flex flex-col items-center justify-center text-center bg-[#050507]">
          <span className="font-mono text-[10px] tracking-widest uppercase text-orange mb-6 block">ONE CURRENT UNDERSTANDING</span>
          <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-12 max-w-4xl">
            Give your next agent the truth.
          </h2>
          <Link href="/login" className="h-14 px-10 flex items-center justify-center gap-3 bg-white text-ink hover:bg-paper-soft font-mono font-bold text-sm tracking-wide transition-colors">
            Start verifying for free &rarr;
          </Link>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
