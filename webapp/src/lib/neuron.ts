/**
 * Unified neuron graph - agents, memories, skills as nodes; synapses as weighted links.
 * Shared by EngramBrain, orchestrator, and brain API.
 */

import type { Agent, Memory, Skill, Synapse, MemoryKind } from "./types";

export type NeuronKind = "core" | "agent" | "memory" | "skill";

export type NeuronNode = {
  id: string;
  kind: NeuronKind;
  label: string;
  size: number;
  x: number;
  y: number;
  z: number;
  memoryKind?: MemoryKind;
  verified?: boolean;
};

export type NeuronLink = {
  from: string;
  to: string;
  kind: Synapse["kind"];
  weight: number;
  cast?: boolean;
};

const RARITY_SIZE: Record<string, number> = {
  common: 0.055,
  rare: 0.07,
  epic: 0.085,
  legendary: 0.11,
};

function synapseWeight(synapses: Synapse[], from: string, to: string, kind: Synapse["kind"]) {
  const s = synapses.find((x) => x.from === from && x.to === to && x.kind === kind);
  return s?.weight ?? 1;
}

export function buildNeuronGraph(
  agents: Agent[],
  skills: Skill[],
  memories: Memory[],
  synapses: Synapse[] = []
): { nodes: NeuronNode[]; links: NeuronLink[] } {
  const nodes: NeuronNode[] = [];
  const links: NeuronLink[] = [];

  nodes.push({ id: "core", kind: "core", label: "engram", size: 0.24, x: 0, y: 0, z: 0 });

  agents.forEach((agent, i) => {
    const t = agents.length === 1 ? 0.5 : i / (agents.length - 1);
    const angle = Math.PI * 0.55 + t * Math.PI * 0.85;
    const r = 2.9 + Math.sin(i * 2.1) * 0.3;
    nodes.push({
      id: agent.id,
      kind: "agent",
      label: agent.name,
      size: 0.08 + agent.level / 25,
      x: Math.cos(angle) * r,
      y: Math.sin(i * 0.9) * 0.45,
      z: Math.sin(angle) * r * 0.5,
    });
  });

  skills.forEach((skill, i) => {
    const t = skills.length === 1 ? 0.5 : i / Math.max(skills.length - 1, 1);
    const angle = -Math.PI * 0.35 - t * Math.PI * 0.75;
    const r = 2.2 + (i % 4) * 0.15;
    nodes.push({
      id: skill.id,
      kind: "skill",
      label: skill.name,
      size: RARITY_SIZE[skill.rarity] ?? 0.06,
      x: Math.cos(angle) * r,
      y: 0.35 + Math.sin(i * 1.1) * 0.35,
      z: Math.sin(angle) * r * 0.45,
      verified: skill.verified,
    });
  });

  memories.forEach((mem, i) => {
    if (mem.superseded) return;
    const t = memories.length === 1 ? 0.5 : i / Math.max(memories.length - 1, 1);
    const angle = -Math.PI * 0.65 - t * Math.PI * 0.55;
    const r = 2.6 + (i % 3) * 0.2;
    const kind = mem.kind ?? "episodic";
    const size =
      kind === "failure" ? 0.07 : mem.verified ? 0.06 : 0.045;
    nodes.push({
      id: mem.id,
      kind: "memory",
      label: mem.label,
      size,
      x: Math.cos(angle) * r,
      y: -0.25 + Math.sin(i * 1.3) * 0.3,
      z: Math.sin(angle) * r * 0.4,
      memoryKind: kind,
      verified: mem.verified,
    });
  });

  for (const agent of agents) {
    links.push({
      from: "core",
      to: agent.id,
      kind: "spawned",
      weight: synapseWeight(synapses, "core", agent.id, "spawned"),
    });
  }

  for (const skill of skills) {
    links.push({
      from: "core",
      to: skill.id,
      kind: "cast",
      weight: synapseWeight(synapses, "core", skill.id, "cast"),
      cast: true,
    });
    const specialist = agents.find((a) => a.specialty === skill.category);
    if (specialist) {
      links.push({
        from: skill.id,
        to: specialist.id,
        kind: "cast",
        weight: synapseWeight(synapses, skill.id, specialist.id, "cast"),
        cast: true,
      });
    }
  }

  for (const mem of memories) {
    if (mem.superseded) continue;
    links.push({
      from: mem.id,
      to: mem.agentId,
      kind: "owns",
      weight: synapseWeight(synapses, mem.id, mem.agentId, "owns"),
    });
    for (const gid of mem.grantedTo) {
      if (gid === mem.agentId) continue;
      links.push({
        from: mem.id,
        to: gid,
        kind: "granted",
        weight: synapseWeight(synapses, mem.id, gid, "granted"),
      });
    }
  }

  for (const agent of agents) {
    for (const partner of agent.linkedAgents ?? []) {
      links.push({
        from: agent.id,
        to: partner,
        kind: "linked",
        weight: synapseWeight(synapses, agent.id, partner, "linked"),
      });
    }
  }

  return { nodes, links };
}

/** Brain health scan per agent. */
export function agentBrainHealth(
  agentId: string,
  agents: Agent[],
  memories: Memory[],
  skills: Skill[],
  synapses: Synapse[]
) {
  const granted = memories.filter(
    (m) => !m.superseded && (m.agentId === agentId || m.grantedTo.includes(agentId))
  );
  const category = agents.find((a) => a.id === agentId)?.specialty;
  const skillLinks = skills.filter((s) => s.category === category).length;
  const synapseCount = synapses.filter((s) => s.from === agentId || s.to === agentId).length;
  const failureCount = granted.filter((m) => m.kind === "failure").length;
  const overload = granted.length > 12;
  const atrophy = granted.length === 0 && skillLinks === 0;
  const hyper = synapseCount > 20;

  let status: "healthy" | "overload" | "atrophy" | "hyperconnected" = "healthy";
  if (overload) status = "overload";
  else if (atrophy) status = "atrophy";
  else if (hyper) status = "hyperconnected";

  return {
    agentId,
    memoryCount: granted.length,
    skillCount: skillLinks,
    synapseCount,
    failureCount,
    status,
  };
}
