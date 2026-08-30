"use client";

import { Canvas, type ThreeEvent, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, type Group, type Mesh, Vector3 } from "three";

const nodeData = [
  { position: [0, 0, 0], kind: "core", label: "PROJECT BRAIN" },
  { position: [-2.6, 1.3, -0.5], kind: "truth", label: "TRUTH" },
  { position: [2.4, 1.55, -0.8], kind: "memory", label: "MEMORY" },
  { position: [-2.3, -1.45, 0.2], kind: "context", label: "CONTEXT" },
  { position: [2.5, -1.25, 0.1], kind: "agent", label: "AGENTS" },
  { position: [-0.2, 2.4, -1.2], kind: "file", label: "middleware.ts" },
  { position: [0.5, -2.35, -0.6], kind: "file", label: "schema.ts" },
  { position: [-3.5, -0.15, -1.4], kind: "evidence", label: "EVIDENCE" },
  { position: [3.5, 0.1, -1.5], kind: "change", label: "CHANGE" },
] as const;

const nodeColors: Record<string, string> = { core: "#fffdf8", truth: "#f3b562", memory: "#ff9d5c", context: "#ff7d3d", agent: "#ffd58c", file: "#8f8173", evidence: "#f3b562", change: "#ffb56e" };

function NetworkLines() {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const core = new Vector3(...nodeData[0].position);
    nodeData.slice(1).forEach((node) => positions.push(core.x, core.y, core.z, ...node.position));
    [[1, 5], [1, 7], [2, 8], [2, 5], [3, 6], [4, 8], [4, 6]].forEach(([a, b]) => positions.push(...nodeData[a!]!.position, ...nodeData[b!]!.position));
    const next = new BufferGeometry();
    next.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
    return next;
  }, []);
  return <lineSegments geometry={geometry}><lineBasicMaterial color="#ff9d5c" transparent opacity={0.3} blending={AdditiveBlending} /></lineSegments>;
}

function Packet({ index }: { index: number }) {
  const ref = useRef<Mesh>(null);
  const start = useMemo(() => new Vector3(...nodeData[(index % (nodeData.length - 1)) + 1]!.position), [index]);
  const destination = useMemo(() => new Vector3(0, 0, 0), []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const progress = (clock.elapsedTime * (0.18 + index * 0.015) + index * 0.21) % 1;
    ref.current.position.lerpVectors(start, destination, progress);
    const scale = Math.sin(progress * Math.PI) * 0.7 + 0.35;
    ref.current.scale.setScalar(scale);
  });
  return <mesh ref={ref}><sphereGeometry args={[0.035, 10, 10]} /><meshBasicMaterial color={index % 2 ? "#ff9d5c" : "#ffe0a6"} toneMapped={false} /></mesh>;
}

function BrainNode({ node, index, onHover }: { node: (typeof nodeData)[number]; index: number; onHover: (label?: string) => void }) {
  const ref = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const color = nodeColors[node.kind]!;
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 1.8 + index) * (index === 0 ? 0.05 : 0.1);
    ref.current.scale.setScalar(pulse * (hovered ? 1.35 : 1));
  });
  const enter = (event: ThreeEvent<PointerEvent>) => { event.stopPropagation(); setHovered(true); onHover(node.label); };
  const leave = () => { setHovered(false); onHover(undefined); };
  return (
    <mesh position={node.position} ref={ref} onPointerEnter={enter} onPointerLeave={leave}>
      <sphereGeometry args={[index === 0 ? 0.54 : node.kind === "file" ? 0.13 : 0.2, 24, 24]} />
      <meshStandardMaterial color={color} emissive={new Color(color)} emissiveIntensity={hovered ? 2.6 : index === 0 ? 1.1 : 0.7} metalness={0.25} roughness={0.28} />
    </mesh>
  );
}

function Network({ onHover }: { onHover: (label?: string) => void }) {
  const group = useRef<Group>(null);
  useFrame(({ clock, pointer }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.elapsedTime * 0.075 + pointer.x * 0.12;
    group.current.rotation.x += ((-pointer.y * 0.08) - group.current.rotation.x) * 0.04;
  });
  return <group ref={group}><NetworkLines />{nodeData.map((node, index) => <BrainNode index={index} key={node.label} node={node} onHover={onHover} />)}{Array.from({ length: 8 }, (_, index) => <Packet index={index} key={index} />)}</group>;
}

export default function BrainCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const [hovered, setHovered] = useState<string>();
  useEffect(() => {
    if (!hostRef.current) return;
    const observer = new IntersectionObserver(([entry]) => setActive(Boolean(entry?.isIntersecting)), { threshold: 0.04 });
    observer.observe(hostRef.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="brain-canvas-host" ref={hostRef}>
      <Canvas camera={{ position: [0, 0, 8.6], fov: 42 }} dpr={[1, 1.6]} frameloop={active ? "always" : "never"} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
        <ambientLight intensity={0.35} /><pointLight color="#ff9d5c" intensity={35} position={[0, 0, 4]} /><pointLight color="#f3b562" intensity={18} position={[-4, 3, 2]} /><Network onHover={setHovered} />
      </Canvas>
      <div className="brain-core-label"><span>NODE / 00</span><strong>{hovered ?? "PROJECT BRAIN"}</strong><small>{hovered ? "Inspecting relationship" : "Illustrative evidence network"}</small></div>
      <div className="brain-corner brain-corner-top">ILLUSTRATIVE REPOSITORY <span>MAIN</span></div>
      <div className="brain-corner brain-corner-bottom">TRUTH + MEMORY + CONTEXT + AGENT BRIDGE</div>
    </div>
  );
}
