"use client";

/**
 * AgentNetwork — the living constellation in the hero.
 * A 3D graph of agent "heroes" (nodes) linked by glowing edges. Pulses of light
 * travel the edges = spells being cast / royalties flowing through the economy.
 */

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

type NodeDef = { pos: THREE.Vector3; size: number };

const NODE_COUNT = 34;
const MAX_LINK_DIST = 3.1;

function buildGraph() {
  const nodes: NodeDef[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / NODE_COUNT);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = 4.4 + Math.sin(i * 1.7) * 0.5;
    const pos = new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi) * 0.62,
      r * Math.sin(phi) * Math.sin(theta)
    );
    nodes.push({ pos, size: 0.05 + (i % 5 === 0 ? 0.085 : 0.022) });
  }

  const links: [number, number][] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[i].pos.distanceTo(nodes[j].pos) < MAX_LINK_DIST) {
        links.push([i, j]);
      }
    }
  }
  return { nodes, links };
}

function Graph() {
  const group = useRef<THREE.Group>(null);
  const { nodes, links } = useMemo(buildGraph, []);

  const nodeMesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const edgeGeom = useMemo(() => {
    const positions = new Float32Array(links.length * 2 * 3);
    links.forEach(([a, b], k) => {
      positions.set(
        [
          nodes[a].pos.x, nodes[a].pos.y, nodes[a].pos.z,
          nodes[b].pos.x, nodes[b].pos.y, nodes[b].pos.z,
        ],
        k * 6
      );
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [links, nodes]);

  const pulseCount = Math.min(18, links.length);
  const pulses = useMemo(
    () =>
      Array.from({ length: pulseCount }, (_, i) => ({
        link: Math.floor((i / pulseCount) * links.length),
        t: (i / pulseCount) % 1,
        speed: 0.12 + ((i * 37) % 100) / 100 * 0.32,
      })),
    [links.length, pulseCount]
  );
  const pulseMesh = useRef<THREE.InstancedMesh>(null);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    if (group.current) {
      // continuous spin + easing toward the pointer for an interactive, alive feel
      const targetY = time * 0.06 + state.pointer.x * 0.5;
      const targetX = Math.sin(time * 0.18) * 0.12 - state.pointer.y * 0.3;
      group.current.rotation.y += (targetY - group.current.rotation.y) * 0.06;
      group.current.rotation.x += (targetX - group.current.rotation.x) * 0.06;
      group.current.position.y = Math.sin(time * 0.5) * 0.15;
    }

    if (nodeMesh.current) {
      nodes.forEach((n, i) => {
        const s = n.size * (1 + Math.sin(time * 1.6 + i) * 0.18);
        dummy.position.copy(n.pos);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        nodeMesh.current!.setMatrixAt(i, dummy.matrix);
      });
      nodeMesh.current.instanceMatrix.needsUpdate = true;
    }

    if (pulseMesh.current) {
      pulses.forEach((p, i) => {
        p.t += delta * p.speed;
        if (p.t > 1) {
          p.t = 0;
          p.link = (p.link + 7) % links.length;
        }
        const [a, b] = links[p.link];
        dummy.position.lerpVectors(nodes[a].pos, nodes[b].pos, p.t);
        const tw = 0.6 + Math.sin(time * 6 + i) * 0.4;
        dummy.scale.setScalar(0.05 * tw + 0.03);
        dummy.updateMatrix();
        pulseMesh.current!.setMatrixAt(i, dummy.matrix);
      });
      pulseMesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={edgeGeom}>
        <lineBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      <instancedMesh ref={nodeMesh} args={[undefined, undefined, nodes.length]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#7c3aed"
          emissiveIntensity={2.2}
          roughness={0.25}
          metalness={0.6}
        />
      </instancedMesh>

      <instancedMesh ref={pulseMesh} args={[undefined, undefined, pulseCount]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#ffd479" blending={THREE.AdditiveBlending} />
      </instancedMesh>
    </group>
  );
}

export default function AgentNetwork() {
  return (
    <Canvas
      camera={{ position: [0, 0, 12], fov: 55 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#a78bfa" />
      <pointLight position={[-10, -6, -8]} intensity={0.8} color="#22d3ee" />
      <Graph />
      <EffectComposer>
        <Bloom
          intensity={1.15}
          luminanceThreshold={0.18}
          luminanceSmoothing={0.5}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
