import type { Agent, Memory, Skill, Synapse, MindManifest } from "./types";
import { uploadJSON } from "./zerog/storage";

export function buildMindManifest(
  agentId: string,
  memories: Memory[],
  skills: Skill[],
  synapses: Synapse[]
): MindManifest {
  const agentMemories = memories.filter(
    (m) => m.agentId === agentId || m.grantedTo.includes(agentId)
  );

  return {
    kind: "grimoire-mind",
    agentId,
    neurons: {
      memories: agentMemories.map((m) => m.id),
      skills: skills.map((s) => s.id),
    },
    synapses: synapses.filter((s) => s.from === agentId || s.to === agentId),
    updatedAt: Date.now(),
  };
}

export async function publishMindManifest(
  agent: Agent,
  memories: Memory[],
  skills: Skill[],
  synapses: Synapse[]
): Promise<{ rootHash: string; txHash?: string } | null> {
  const manifest = buildMindManifest(
    agent.id,
    memories,
    skills.filter((s) => s.category === agent.specialty),
    synapses
  );
  try {
    const up = await uploadJSON(manifest);
    return { rootHash: up.rootHash, txHash: up.txHash };
  } catch {
    return null;
  }
}
