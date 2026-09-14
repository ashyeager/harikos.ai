"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Disposable = { dispose: () => void };

export function ProjectStateSphere() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || window.matchMedia("(max-width: 700px)").matches) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }); }
    catch { container.dataset.webgl = "unavailable"; return; }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
    camera.position.set(0, 0, 11.5);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);
    container.dataset.webgl = "ready";

    const disposables: Disposable[] = [];
    const sphere = new THREE.Group();
    const outerShell = new THREE.Group();
    const innerShell = new THREE.Group();
    sphere.rotation.set(-.12, -.28, .03);
    sphere.add(outerShell, innerShell);
    scene.add(sphere);

    const whiteFull = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .9 });
    const whiteMedium = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .55 });
    const whiteQuiet = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .24 });
    const gold = new THREE.LineBasicMaterial({ color: 0xcdb47a, transparent: true, opacity: .9 });
    disposables.push(whiteFull, whiteMedium, whiteQuiet, gold);

    const addLoop = (points: THREE.Vector3[], material: THREE.LineBasicMaterial, parent = outerShell) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const loop = new THREE.LineLoop(geometry, material);
      disposables.push(geometry);
      parent.add(loop);
      return loop;
    };
    const circle = (radius: number, z = 0) => Array.from({ length: 128 }, (_, index) => {
      const angle = index / 128 * Math.PI * 2;
      return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, z);
    });

    [-1.7, -1.15, -.58, 0, .58, 1.15, 1.7].forEach((y, index) => {
      const radius = Math.sqrt(Math.max(0, 2.25 ** 2 - y ** 2));
      const loop = addLoop(circle(radius), index === 3 ? whiteFull : whiteMedium);
      loop.rotation.x = Math.PI / 2;
      loop.position.y = y;
    });
    [0, Math.PI / 4, Math.PI / 2, Math.PI * .75].forEach((rotation, index) => {
      const loop = addLoop(circle(2.25), index === 0 ? whiteFull : whiteMedium);
      loop.rotation.y = rotation;
    });
    [-.72, 0, .72].forEach((rotation) => {
      const loop = addLoop(circle(1.58), whiteQuiet, innerShell);
      loop.rotation.y = rotation;
      loop.rotation.x = rotation * .36;
    });

    const relationshipGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.55, -.72, .65), new THREE.Vector3(-.42, .92, 1.1),
      new THREE.Vector3(-.42, .92, 1.1), new THREE.Vector3(1.48, .46, .9),
      new THREE.Vector3(1.48, .46, .9), new THREE.Vector3(.62, -1.25, 1.2),
    ]);
    const relationships = new THREE.LineSegments(relationshipGeometry, whiteQuiet);
    disposables.push(relationshipGeometry);
    innerShell.add(relationships);

    const scanGeometry = new THREE.TorusGeometry(2.28, .012, 4, 128);
    const scan = new THREE.LineSegments(new THREE.WireframeGeometry(scanGeometry), gold);
    scan.rotation.set(Math.PI / 2.9, .12, .16);
    disposables.push(scanGeometry, scan.geometry);
    sphere.add(scan);

    const nodeGeometry = new THREE.SphereGeometry(.065, 10, 10);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xcdb47a });
    disposables.push(nodeGeometry, nodeMaterial);
    const nodes = [[1.48,.46,.9],[-1.55,-.72,.65],[-.42,.92,1.1],[.62,-1.25,1.2]].map(([x,y,z]) => {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.set(x, y, z);
      sphere.add(node);
      return node;
    });

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = reducedMotion.matches;
    let visible = true;
    const pointer = new THREE.Vector2();
    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / Math.max(rect.width, 1) - .5, (event.clientY - rect.top) / Math.max(rect.height, 1) - .5);
    };
    container.addEventListener("pointermove", onPointerMove, { passive: true });
    const resize = () => { const width = Math.max(container.clientWidth, 1), height = Math.max(container.clientHeight, 1); camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); renderer.render(scene, camera); };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container); resize();
    const started = performance.now();
    const render = (now: number) => {
      if (!visible) return;
      const elapsed = (now - started) / 1000;
      outerShell.rotation.y = elapsed * .035;
      innerShell.rotation.y = -elapsed * .022;
      scan.rotation.z = .16 + elapsed * .05;
      sphere.rotation.y = -.28 + pointer.x * .12;
      sphere.rotation.x = -.12 + pointer.y * .07;
      nodes.forEach((node, index) => { node.scale.setScalar(1 + Math.sin(elapsed * .7 + index) * .12); });
      renderer.render(scene, camera);
    };
    const visibilityObserver = new IntersectionObserver(([entry]) => { visible = Boolean(entry?.isIntersecting); renderer.setAnimationLoop(visible && !reduced ? render : null); if (visible && reduced) renderer.render(scene, camera); }, { rootMargin: "100px" });
    visibilityObserver.observe(container);
    const onReducedMotionChange = () => { reduced = reducedMotion.matches; pointer.set(0, 0); renderer.setAnimationLoop(visible && !reduced ? render : null); if (visible) renderer.render(scene, camera); };
    reducedMotion.addEventListener("change", onReducedMotionChange);
    if (reduced) renderer.render(scene, camera); else renderer.setAnimationLoop(render);

    return () => { renderer.setAnimationLoop(null); resizeObserver.disconnect(); visibilityObserver.disconnect(); reducedMotion.removeEventListener("change", onReducedMotionChange); container.removeEventListener("pointermove", onPointerMove); disposables.forEach((item) => item.dispose()); renderer.dispose(); renderer.domElement.remove(); };
  }, []);

  return <div aria-label="A white holographic project-state globe with verified gold signals" className="hexagon-hero project-state-sphere" ref={containerRef} role="img">
    <div className="sphere-fallback" aria-hidden="true"><i /><i /><span /></div>
    <div className="hexagon-label hexagon-label-top"><span>STATE / VERIFIED</span><strong>EVIDENCE ALIGNED</strong></div>
    <div className="hexagon-label hexagon-label-bottom"><span>BRIDGE / MCP</span><strong>AGENTS IN SYNC</strong></div>
  </div>;
}
