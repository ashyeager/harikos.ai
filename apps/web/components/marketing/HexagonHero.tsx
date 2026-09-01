"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Disposable = { dispose: () => void };

export function HexagonHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      container.dataset.webgl = "unavailable";
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.1, 6.4);

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);
    container.dataset.webgl = "ready";

    const disposables: Disposable[] = [];
    const group = new THREE.Group();
    group.rotation.set(0.5, -0.45, 0.12);
    scene.add(group);

    const coreGeometry = new THREE.CylinderGeometry(1.28, 1.28, 0.32, 6, 1, false);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf6f6f4,
      emissive: 0xff6b35,
      emissiveIntensity: 0.16,
      metalness: 0.56,
      roughness: 0.24,
      clearcoat: 0.72,
      clearcoatRoughness: 0.2,
    });
    disposables.push(coreGeometry, coreMaterial);
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.rotation.x = Math.PI / 2;
    group.add(core);

    const insetGeometry = new THREE.CylinderGeometry(0.72, 0.72, 0.345, 6, 1, false);
    const insetMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      emissive: 0xff6b35,
      emissiveIntensity: 0.34,
      metalness: 0.78,
      roughness: 0.28,
    });
    disposables.push(insetGeometry, insetMaterial);
    const inset = new THREE.Mesh(insetGeometry, insetMaterial);
    inset.rotation.x = Math.PI / 2;
    inset.position.z = 0.02;
    group.add(inset);

    const edgeGeometry = new THREE.EdgesGeometry(coreGeometry, 18);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xff8a5f, transparent: true, opacity: 0.72 });
    disposables.push(edgeGeometry, edgeMaterial);
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    edges.rotation.copy(core.rotation);
    group.add(edges);

    const ringGeometry = new THREE.TorusGeometry(1.78, 0.008, 8, 128);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xff6b35, transparent: true, opacity: 0.42 });
    disposables.push(ringGeometry, ringMaterial);
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.set(0.75, 0.2, 0.15);
    group.add(ring);

    const secondRingGeometry = new THREE.TorusGeometry(2.08, 0.004, 8, 128);
    const secondRingMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.14 });
    disposables.push(secondRingGeometry, secondRingMaterial);
    const secondRing = new THREE.Mesh(secondRingGeometry, secondRingMaterial);
    secondRing.rotation.set(-0.35, 0.68, -0.2);
    group.add(secondRing);

    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(42 * 3);
    for (let index = 0; index < 42; index += 1) {
      const angle = (index / 42) * Math.PI * 2;
      const radius = 1.82 + ((index * 17) % 13) * 0.045;
      particlePositions[index * 3] = Math.cos(angle) * radius;
      particlePositions[index * 3 + 1] = Math.sin(angle) * radius;
      particlePositions[index * 3 + 2] = ((index % 7) - 3) * 0.08;
    }
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({ color: 0xff6b35, size: 0.025, transparent: true, opacity: 0.65 });
    disposables.push(particleGeometry, particleMaterial);
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    group.add(particles);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(4, 4, 5);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xff6b35, 14, 10, 2);
    rimLight.position.set(-2.4, -1.2, 2.5);
    scene.add(rimLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.58));

    const pointer = new THREE.Vector2();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = true;
    let animationFrameId = 0;

    const onPointerMove = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      pointer.set(
        ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 2,
        ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * -2,
      );
    };
    const onPointerLeave = () => pointer.set(0, 0);
    container.addEventListener("pointermove", onPointerMove, { passive: true });
    container.addEventListener("pointerleave", onPointerLeave);

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
    }, { rootMargin: "120px" });
    visibilityObserver.observe(container);

    const startedAt = performance.now();
    const animate = (now: number) => {
      animationFrameId = window.requestAnimationFrame(animate);
      if (!visible) return;
      const elapsed = (now - startedAt) / 1000;
      const motion = reduceMotion ? 0 : elapsed;
      group.rotation.y += (pointer.x * 0.22 - group.rotation.y) * 0.035;
      group.rotation.x += (0.5 + pointer.y * 0.14 - group.rotation.x) * 0.035;
      group.rotation.z = 0.12 + Math.sin(motion * 0.42) * 0.1;
      ring.rotation.z = motion * 0.17;
      secondRing.rotation.z = -motion * 0.11;
      particles.rotation.z = motion * 0.08;
      const pulse = reduceMotion ? 1 : 1 + Math.sin(elapsed * 1.8) * 0.025;
      core.scale.setScalar(pulse);
      inset.scale.setScalar(1 / pulse);
      coreMaterial.emissiveIntensity = reduceMotion ? 0.2 : 0.2 + Math.sin(elapsed * 2.1) * 0.08;
      renderer.render(scene, camera);
    };
    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      aria-label="Animated three-dimensional HARIKOS project brain hexagon"
      className="hexagon-hero"
      ref={containerRef}
      role="img"
    >
      <div className="hexagon-fallback" aria-hidden="true"><span>H</span></div>
      <div className="hexagon-label hexagon-label-top"><span>CORE / 01</span><strong>TRUTH + MEMORY</strong></div>
      <div className="hexagon-label hexagon-label-bottom"><span>BRIDGE / MCP</span><strong>CONTEXT READY</strong></div>
      <i className="hexagon-axis hexagon-axis-x" aria-hidden="true" />
      <i className="hexagon-axis hexagon-axis-y" aria-hidden="true" />
    </div>
  );
}
