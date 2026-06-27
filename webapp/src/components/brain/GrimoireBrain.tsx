"use client";

/**
 * GrimoireBrain - living neural mirror of the agent economy.
 * Uses unified neuron graph (agents · skills · memories · synaptic plasticity).
 */

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { buildNeuronGraph } from "@/lib/neuron";
import type { Agent, Memory, RoyaltyEvent, Skill, Synapse } from "@/lib/types";

type Props = {
  skills: Skill[];
  memories: Memory[];
  agents: Agent[];
  synapses?: Synapse[];
  royalties?: RoyaltyEvent[];
  selectedId?: string | null;
  compact?: boolean;
};

type IndexedLink = { a: number; b: number; weight: number; cast?: boolean };

function BrainGraph({ skills, memories, agents, synapses = [], selectedId }: Props) {
  const group = useRef<THREE.Group>(null);
  const mirror = useRef<THREE.Group>(null);

  const { nodes, links } = useMemo(
    () => buildNeuronGraph(agents, skills, memories, synapses),
    [agents, skills, memories, synapses]
  );

  const indexedLinks: IndexedLink[] = useMemo(() => {
    const idToIdx = new Map(nodes.map((n, i) => [n.id, i]));
    return links
      .map((l) => ({
        a: idToIdx.get(l.from) ?? -1,
        b: idToIdx.get(l.to) ?? -1,
        weight: l.weight,
        cast: l.cast,
      }))
      .filter((l) => l.a >= 0 && l.b >= 0);
  }, [nodes, links]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const nodeMesh = useRef<THREE.InstancedMesh>(null);

  const edgeGeom = useMemo(() => {
    const positions = new Float32Array(indexedLinks.length * 2 * 3);
    indexedLinks.forEach(({ a, b }, k) => {
      positions.set(
        [nodes[a].x, nodes[a].y, nodes[a].z, nodes[b].x, nodes[b].y, nodes[b].z],
        k * 6
      );
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [indexedLinks, nodes]);

  const castLinks = indexedLinks.filter((l) => l.cast);
  const pulseLinks = castLinks.length ? castLinks : indexedLinks;
  const pulseCount = Math.min(28, Math.max(pulseLinks.length, 8));
  const pulses = useMemo(
    () =>
      Array.from({ length: pulseCount }, (_, i) => ({
        link: pulseLinks.length ? i % pulseLinks.length : 0,
        t: (i / pulseCount) % 1,
        speed: 0.18 + ((i * 41) % 100) / 100 * 0.4,
      })),
    [pulseLinks.length, pulseCount]
  );
  const pulseMesh = useRef<THREE.InstancedMesh>(null);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = time * 0.07 + state.pointer.x * 0.32;
      group.current.rotation.x = Math.sin(time * 0.22) * 0.07 - state.pointer.y * 0.18;
      group.current.position.y = Math.sin(time * 0.4) * 0.1;
    }
    if (mirror.current && group.current) {
      mirror.current.rotation.y = group.current.rotation.y;
      mirror.current.rotation.x = -group.current.rotation.x * 0.55;
      mirror.current.position.y = -1.7 + Math.sin(time * 0.4) * 0.05;
    }
    if (nodeMesh.current) {
      nodes.forEach((n, i) => {
        const selected = selectedId && n.id === selectedId;
        const pulse =
          1 +
          Math.sin(time * 2 + i * 0.6) *
            (n.kind === "core" ? 0.28 : n.kind === "skill" ? 0.18 : 0.1);
        const atrophy = n.kind === "memory" && n.memoryKind === "episodic" ? 0.92 : 1;
        dummy.position.set(n.x, n.y, n.z);
        dummy.scale.setScalar(n.size * pulse * atrophy * (selected ? 1.4 : 1));
        dummy.updateMatrix();
        nodeMesh.current!.setMatrixAt(i, dummy.matrix);
      });
      nodeMesh.current.instanceMatrix.needsUpdate = true;
    }
    if (pulseMesh.current && pulseLinks.length) {
      pulses.forEach((p, i) => {
        const link = pulseLinks[p.link];
        const speedMul = 0.7 + Math.min(link.weight, 5) * 0.15;
        p.t += delta * p.speed * speedMul;
        if (p.t > 1) {
          p.t = 0;
          p.link = (p.link + 3) % pulseLinks.length;
        }
        const { a, b } = link;
        dummy.position.set(
          THREE.MathUtils.lerp(nodes[a].x, nodes[b].x, p.t),
          THREE.MathUtils.lerp(nodes[a].y, nodes[b].y, p.t),
          THREE.MathUtils.lerp(nodes[a].z, nodes[b].z, p.t)
        );
        dummy.scale.setScalar(0.045 + Math.sin(time * 9 + i) * 0.018);
        dummy.updateMatrix();
        pulseMesh.current!.setMatrixAt(i, dummy.matrix);
      });
      pulseMesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  const avgWeight =
    indexedLinks.length
      ? indexedLinks.reduce((s, l) => s + l.weight, 0) / indexedLinks.length
      : 1;

  return (
    <>
      <group ref={group}>
        <lineSegments geometry={edgeGeom}>
          <lineBasicMaterial
            color="#8b5cf6"
            transparent
            opacity={0.22 + Math.min(avgWeight, 5) * 0.04}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
        <instancedMesh ref={nodeMesh} args={[undefined, undefined, nodes.length]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#a78bfa"
            emissive="#7c3aed"
            emissiveIntensity={2.5}
            roughness={0.18}
            metalness={0.6}
          />
        </instancedMesh>
        <instancedMesh ref={pulseMesh} args={[undefined, undefined, pulseCount]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color="#22d3ee" blending={THREE.AdditiveBlending} />
        </instancedMesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.58, 0.014, 8, 64]} />
          <meshBasicMaterial color="#ffd479" transparent opacity={0.5} />
        </mesh>
      </group>
      <group ref={mirror} scale={[1, -0.32, 1]}>
        <lineSegments geometry={edgeGeom}>
          <lineBasicMaterial
            color="#22d3ee"
            transparent
            opacity={0.07}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      </group>
    </>
  );
}

export default function GrimoireBrain({
  skills,
  memories,
  agents,
  synapses = [],
  compact = false,
  ...rest
}: Props) {
  const empty = skills.length === 0 && memories.length === 0;

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-arcane/20 bg-void/80 ${
        compact ? "h-[240px]" : "h-[320px] sm:h-[400px]"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-void via-transparent to-void/40" />
      <div className="pointer-events-none absolute inset-x-0 top-3 z-10 text-center px-4">
        <span className="text-[10px] uppercase tracking-[0.2em] text-ash">
          {compact ? "Neural map" : "Engram · agents · skills · memory"}
        </span>
      </div>
      {empty ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center text-sm text-ash text-center px-6">
          Mint a skill or commit memory to awaken the neural mirror
        </div>
      ) : (
        <Canvas
          camera={{ position: [0, 0.4, compact ? 8.5 : 7.2], fov: 52 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          className="absolute inset-0"
        >
          <ambientLight intensity={0.35} />
          <pointLight position={[6, 8, 6]} intensity={1.1} color="#a78bfa" />
          <pointLight position={[-6, -4, -5]} intensity={0.85} color="#22d3ee" />
          <pointLight position={[0, 0.5, 2]} intensity={0.65} color="#ffd479" />
          <BrainGraph
            skills={skills}
            memories={memories}
            agents={agents}
            synapses={synapses}
            {...rest}
          />
          <EffectComposer>
            <Bloom
              intensity={1.25}
              luminanceThreshold={0.14}
              luminanceSmoothing={0.42}
              mipmapBlur
            />
          </EffectComposer>
        </Canvas>
      )}
    </div>
  );
}
