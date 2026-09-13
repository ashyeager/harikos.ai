"use client";

import { useEffect, useRef } from "react";

const productDemoMedia = {
  poster: "/media/harikos-product-poster.svg",
  sources: [
    { src: "/media/harikos-product-demo.mp4", type: "video/mp4" },
  ],
} as const;

export function ProductDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const video = videoRef.current;
    if (!video) return;

    let inView = false;
    const syncPlayback = () => {
      if (reducedMotion.matches || !inView) {
        video.pause();
        return;
      }

      void video.play().catch(() => undefined);
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = Boolean(entry?.isIntersecting);
      syncPlayback();
    }, { threshold: 0.45 });

    observer.observe(video);
    syncPlayback();
    reducedMotion.addEventListener("change", syncPlayback);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", syncPlayback);
    };
  }, []);

  return (
    <section className="demo-video-section section-shell" id="product-demo">
      <div className="product-demo-heading">
        <span className="eyebrow"><i /> PRODUCT WALKTHROUGH</span>
        <p>Evidence, current Truth, useful Memory, and task-specific Context stay connected across agent work.</p>
      </div>
      <div className="demo-video-frame">
        <div className="demo-video-chrome"><span><i /><i /><i /></span><strong>HARIKOS / PROJECT LOOP</strong><small>ILLUSTRATIVE STATE</small></div>
        <video aria-label="HARIKOS project state product walkthrough" controls loop muted playsInline poster={productDemoMedia.poster} preload="metadata" ref={videoRef}>
          {productDemoMedia.sources.map((source) => <source key={source.src} src={source.src} type={source.type} />)}
        </video>
        <div className="demo-video-meta"><span>01 / EVIDENCE</span><span>02 / TRUTH</span><span>03 / MEMORY</span><span>04 / CONTEXT</span></div>
      </div>
      <p className="demo-disclaimer">Product workflow shown with illustrative non-customer state.</p>
      <p className="sr-only">The walkthrough shows a repository being connected, scanned for evidence, resolved into current Truth, and prepared as task-specific Context for an authorized coding agent.</p>
    </section>
  );
}
