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
    const syncPlayback = () => {
      const video = videoRef.current;
      if (!video) return;

      if (reducedMotion.matches) {
        video.pause();
        return;
      }

      void video.play().catch(() => undefined);
    };

    syncPlayback();
    reducedMotion.addEventListener("change", syncPlayback);
    return () => reducedMotion.removeEventListener("change", syncPlayback);
  }, []);

  return (
    <section className="demo-video-section section-shell" id="product-demo">
      <div className="product-demo-heading">
        <span className="eyebrow"><i /> PRODUCT WALKTHROUGH / CURRENT EXPERIENCE</span>
        <p>See how evidence, current Truth, useful Memory, and task-specific Context stay connected across agent work.</p>
      </div>
      <div className="demo-video-frame">
        <div className="demo-video-chrome"><span><i /><i /><i /></span><strong>HARIKOS / PROJECT LOOP</strong><small>SAMPLE STATE</small></div>
        <video aria-label="HARIKOS project state product walkthrough" controls loop muted playsInline poster={productDemoMedia.poster} preload="metadata" ref={videoRef}>
          {productDemoMedia.sources.map((source) => <source key={source.src} src={source.src} type={source.type} />)}
        </video>
        <div className="demo-video-meta"><span>01 / EVIDENCE</span><span>02 / TRUTH</span><span>03 / MEMORY</span><span>04 / CONTEXT</span></div>
      </div>
      <p className="demo-disclaimer">Product workflow shown with non-customer sample state.</p>
    </section>
  );
}
