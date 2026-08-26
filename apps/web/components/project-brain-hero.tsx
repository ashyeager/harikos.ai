"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Line, Html } from "@react-three/drei";
import * as THREE from "three";

function NodeGraph() {
  const groupRef = useRef<THREE.Group>(null);
  const nodesCount = 40;
  
  // Generate random nodes
  const nodes = useMemo(() => {
    const pts = [];
    for (let i = 0; i < nodesCount; i++) {
      const r = 2.5 + Math.random() * 2;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(Math.random() * 2 - 1);
      pts.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      ));
    }
    return pts;
  }, []);

  // Generate lines between close nodes
  const lines = useMemo(() => {
    const lns = [];
    for (let i = 0; i < nodesCount; i++) {
      for (let j = i + 1; j < nodesCount; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 2.5) {
          lns.push([nodes[i], nodes[j]]);
        }
      }
    }
    return lns;
  }, [nodes]);

  // Particle positions for rendering
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(nodesCount * 3);
    const col = new Float32Array(nodesCount * 3);
    const colorChoices = [
      new THREE.Color("#00d9e8"), // cyan (Truth/Current)
      new THREE.Color("#00d9e8"),
      new THREE.Color("#8a8a98"), // muted (Memory/Stale)
      new THREE.Color("#ff5415"), // orange (Agent action)
    ];

    for (let i = 0; i < nodesCount; i++) {
      pos[i * 3] = nodes[i].x;
      pos[i * 3 + 1] = nodes[i].y;
      pos[i * 3 + 2] = nodes[i].z;
      const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, [nodes]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {lines.map((line, i) => (
        <Line 
          key={i} 
          points={line as any} 
          color="#1e1e24" 
          lineWidth={1}
          transparent
          opacity={0.4}
        />
      ))}
      <Points positions={positions} colors={colors} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={0.08}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      {/* Some active nodes with labels */}
      <Html position={nodes[0]} center className="pointer-events-none">
        <div className="font-mono text-[8px] text-cyan bg-cyan/10 px-1 border border-cyan/20 whitespace-nowrap">TRUTH_VERIFIED</div>
      </Html>
      <Html position={nodes[5]} center className="pointer-events-none">
        <div className="font-mono text-[8px] text-orange bg-orange/10 px-1 border border-orange/20 whitespace-nowrap">AGENT_MCP</div>
      </Html>
      <Html position={nodes[10]} center className="pointer-events-none">
        <div className="font-mono text-[8px] text-muted bg-ink/80 px-1 border border-line whitespace-nowrap">MEMORY_RECORD</div>
      </Html>
    </group>
  );
}

export function ProjectBrainHero() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ink z-10" />
      <Canvas camera={{ position: [0, 0, 8], fov: 40 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <NodeGraph />
      </Canvas>
    </div>
  );
}
