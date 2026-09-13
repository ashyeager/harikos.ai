"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Disposable = { dispose: () => void };

/** Historical export name retained as the single lazy-loaded 3D entry point. */
export function HexagonHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container || window.matchMedia("(max-width: 700px)").matches) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }); }
    catch { container.dataset.webgl = "unavailable"; return; }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 11.5);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);
    container.dataset.webgl = "ready";

    const disposables: Disposable[] = [];
    const brain = new THREE.Group();
    brain.rotation.set(-0.08, -0.32, 0.04);
    scene.add(brain);
    const neutral = new THREE.LineBasicMaterial({ color: 0x343434, transparent: true, opacity: 0.5 });
    const quiet = new THREE.LineBasicMaterial({ color: 0x777777, transparent: true, opacity: 0.28 });
    const gold = new THREE.LineBasicMaterial({ color: 0xcdb47a, transparent: true, opacity: 0.88 });
    disposables.push(neutral, quiet, gold);
    const addWire = (geometry: THREE.BufferGeometry, material: THREE.LineBasicMaterial, y = 0) => {
      const edges = new THREE.EdgesGeometry(geometry, 12);
      disposables.push(geometry, edges);
      const lines = new THREE.LineSegments(edges, material);
      lines.position.y = y; brain.add(lines); return lines;
    };
    addWire(new THREE.IcosahedronGeometry(2.15, 2), neutral);
    const inner = addWire(new THREE.IcosahedronGeometry(1.68, 1), quiet);
    inner.rotation.set(0.24, 0.18, -0.12);
    const core = addWire(new THREE.IcosahedronGeometry(1.08, 1), quiet);
    core.rotation.set(-0.18, -0.28, 0.14);
    const seam = addWire(new THREE.TorusGeometry(2.22, 0.012, 4, 96), gold);
    seam.rotation.set(Math.PI / 2.7, 0.18, 0.22);
    const nodeGeometry = new THREE.OctahedronGeometry(0.075, 0);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xcdb47a });
    disposables.push(nodeGeometry, nodeMaterial);
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial); node.position.set(1.82, 0.72, 0.76); brain.add(node);
    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(3, 4, 6); scene.add(key);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = reducedMotion.matches;
    const pointer = new THREE.Vector2();
    let visible = true;
    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5, (event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5);
    };
    container.addEventListener("pointermove", onPointerMove, { passive: true });
    const resize = () => { const width = Math.max(container.clientWidth, 1), height = Math.max(container.clientHeight, 1); camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); renderer.render(scene, camera); };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container); resize();
    const started = performance.now();
    const render = (now: number) => { if (!visible) return; const elapsed = (now - started) / 1000; brain.rotation.y = -0.32 + elapsed * 0.045 + pointer.x * 0.12; brain.rotation.x = -0.08 + Math.sin(elapsed * 0.14) * 0.035 + pointer.y * 0.07; renderer.render(scene, camera); };
    const visibilityObserver = new IntersectionObserver(([entry]) => { visible = Boolean(entry?.isIntersecting); renderer.setAnimationLoop(visible && !reduced ? render : null); if (visible && reduced) renderer.render(scene, camera); }, { rootMargin: "100px" });
    visibilityObserver.observe(container);
    const onReducedMotionChange = () => { reduced = reducedMotion.matches; pointer.set(0, 0); renderer.setAnimationLoop(visible && !reduced ? render : null); if (visible) renderer.render(scene, camera); };
    reducedMotion.addEventListener("change", onReducedMotionChange);
    if (reduced) renderer.render(scene, camera); else renderer.setAnimationLoop(render);
    return () => { renderer.setAnimationLoop(null); resizeObserver.disconnect(); visibilityObserver.disconnect(); reducedMotion.removeEventListener("change", onReducedMotionChange); container.removeEventListener("pointermove", onPointerMove); disposables.forEach((item) => item.dispose()); renderer.dispose(); renderer.domElement.remove(); };
  }, []);

  return <div aria-label="A precise layered project-state sphere representing shared verified context" className="hexagon-hero project-state-sphere" ref={containerRef} role="img">
    <div className="sphere-fallback" aria-hidden="true"><i /><i /><span /></div>
    <div className="hexagon-label hexagon-label-top"><span>STATE / VERIFIED</span><strong>EVIDENCE ALIGNED</strong></div>
    <div className="hexagon-label hexagon-label-bottom"><span>BRIDGE / MCP</span><strong>AGENTS IN SYNC</strong></div>
  </div>;
}
