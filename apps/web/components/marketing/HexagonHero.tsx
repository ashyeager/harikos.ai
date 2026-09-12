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
    camera.position.set(0, 0, 8.4);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);
    container.dataset.webgl = "ready";

    const disposables: Disposable[] = [];
    const spear = new THREE.Group();
    spear.rotation.set(-0.08, -0.42, -0.58);
    scene.add(spear);
    const neutral = new THREE.LineBasicMaterial({ color: 0xe8e9e6, transparent: true, opacity: 0.72 });
    const quiet = new THREE.LineBasicMaterial({ color: 0x8d918d, transparent: true, opacity: 0.34 });
    const gold = new THREE.LineBasicMaterial({ color: 0xcdb47a, transparent: true, opacity: 0.88 });
    disposables.push(neutral, quiet, gold);
    const addWire = (geometry: THREE.BufferGeometry, material: THREE.LineBasicMaterial, y = 0) => {
      const edges = new THREE.EdgesGeometry(geometry, 12);
      disposables.push(geometry, edges);
      const lines = new THREE.LineSegments(edges, material);
      lines.position.y = y; spear.add(lines); return lines;
    };
    addWire(new THREE.ConeGeometry(0.58, 2.25, 6, 3, true), neutral, 2.15);
    addWire(new THREE.CylinderGeometry(0.24, 0.36, 3.9, 6, 3, true), neutral, -0.7);
    addWire(new THREE.CylinderGeometry(0.08, 0.2, 1.2, 6, 1, true), quiet, -3.15);
    const inner = addWire(new THREE.CylinderGeometry(0.11, 0.19, 3.55, 4, 4, true), quiet, -0.68);
    inner.rotation.y = Math.PI / 4;
    const seam = addWire(new THREE.TorusGeometry(0.31, 0.012, 3, 6), gold, 0.92);
    seam.rotation.x = Math.PI / 2;
    const nodeGeometry = new THREE.OctahedronGeometry(0.075, 0);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xcdb47a });
    disposables.push(nodeGeometry, nodeMaterial);
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial); node.position.set(0.31, 0.92, 0); spear.add(node);
    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(3, 4, 6); scene.add(key);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = new THREE.Vector2();
    let visible = true;
    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5, (event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5);
    };
    if (!reduced) container.addEventListener("pointermove", onPointerMove, { passive: true });
    const resize = () => { const width = Math.max(container.clientWidth, 1), height = Math.max(container.clientHeight, 1); camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); renderer.render(scene, camera); };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container); resize();
    const started = performance.now();
    const render = (now: number) => { if (!visible) return; const elapsed = (now - started) / 1000; spear.rotation.y = -0.42 + Math.sin(elapsed * 0.18) * 0.12 + pointer.x * 0.16; spear.rotation.x = -0.08 + pointer.y * 0.08; renderer.render(scene, camera); };
    const visibilityObserver = new IntersectionObserver(([entry]) => { visible = Boolean(entry?.isIntersecting); renderer.setAnimationLoop(visible && !reduced ? render : null); if (visible && reduced) renderer.render(scene, camera); }, { rootMargin: "100px" });
    visibilityObserver.observe(container);
    if (reduced) renderer.render(scene, camera); else renderer.setAnimationLoop(render);
    return () => { renderer.setAnimationLoop(null); resizeObserver.disconnect(); visibilityObserver.disconnect(); container.removeEventListener("pointermove", onPointerMove); disposables.forEach((item) => item.dispose()); renderer.dispose(); renderer.domElement.remove(); };
  }, []);

  return <div aria-label="A precise skeletal project-state spear representing shared verified context" className="hexagon-hero project-state-spear" ref={containerRef} role="img">
    <div className="spear-fallback" aria-hidden="true"><i /><i /><i /><span /></div>
    <div className="hexagon-label hexagon-label-top"><span>STATE / VERIFIED</span><strong>EVIDENCE ALIGNED</strong></div>
    <div className="hexagon-label hexagon-label-bottom"><span>BRIDGE / MCP</span><strong>AGENTS IN SYNC</strong></div>
  </div>;
}
