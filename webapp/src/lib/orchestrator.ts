import type { Agent, Memory, Skill, Synapse } from "./types";
import { categorize, wordSimilarity } from "./skills";

export type ReflexKind = "category-match" | "spawn" | "skill-cast" | "manual" | "blocked";

export type RoutePlan = {
  agentId: string;
  spawnedAgent?: Agent;
  memories: Memory[];
  contextSkills: Skill[];
  castSkill?: Skill;
  reflex: ReflexKind;
  blockedSkillIds: string[];
};

type PlanInput = {
  prompt: string;
  requestedAgent: string;
  agents: Agent[];
  skills: Skill[];
  memories: Memory[];
  synapses: Synapse[];
  agentForCategory: (cat: string) => Agent | undefined;
  spawnAgent: (specialty: string, by?: string) => Agent;
  topAgent: () => Agent;
};

const CAST_THRESHOLD = 0.62;
const MEMORY_LIMIT = 5;

function synapseBoost(synapses: Synapse[], from: string, to: string, kind: Synapse["kind"]) {
  const s = synapses.find((x) => x.from === from && x.to === to && x.kind === kind);
  return s?.weight ?? 1;
}

function memoryPartners(agentId: string, agents: Agent[]): string[] {
  const agent = agents.find((a) => a.id === agentId);
  const linked = agent?.linkedAgents ?? [];
  return [agentId, ...linked];
}

export function retrieveMemories(
  agentId: string,
  prompt: string,
  memories: Memory[],
  agents: Agent[],
  synapses: Synapse[],
  limit = MEMORY_LIMIT
): Memory[] {
  const partners = memoryPartners(agentId, agents);
  const candidates = memories.filter(
    (m) =>
      !m.superseded &&
      (partners.includes(m.agentId) || m.grantedTo.some((g) => partners.includes(g)))
  );

  const scored = candidates.map((m) => {
    const sim = wordSimilarity(prompt, `${m.label} ${m.content}`);
    const kind = m.kind ?? "episodic";
    let score = sim;
    if (kind === "failure") score += 0.35;
    if (kind === "preference") score += 0.15;
    if (kind === "semantic") score += 0.1;
    score *= synapseBoost(synapses, m.id, agentId, "granted");
    score *= synapseBoost(synapses, m.id, agentId, "owns");
    return { m, score };
  });

  return scored
    .filter((x) => x.score > 0.08)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.m);
}

export function findCastableSkill(
  prompt: string,
  category: string,
  skills: Skill[],
  blockedIds: string[] = []
): Skill | undefined {
  const eligible = skills.filter((s) => !blockedIds.includes(s.id));
  let best: Skill | undefined;
  let bestScore = 0;
  for (const s of eligible) {
    const sim = wordSimilarity(prompt, s.promptTemplate);
    const catBonus = s.category === category ? 0.12 : 0;
    const score = sim + catBonus + Math.min(s.uses * 0.02, 0.15);
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return bestScore >= CAST_THRESHOLD ? best : undefined;
}

export function blockedSkillsFromFailures(
  prompt: string,
  agentId: string,
  memories: Memory[],
  skills: Skill[]
): string[] {
  const failures = memories.filter(
    (m) => m.kind === "failure" && (m.agentId === agentId || m.grantedTo.includes(agentId))
  );
  const blocked: string[] = [];
  for (const f of failures) {
    if (wordSimilarity(prompt, f.content) > 0.45) {
      for (const s of skills) {
        if (wordSimilarity(f.content, s.promptTemplate) > 0.5) {
          blocked.push(s.id);
        }
      }
    }
  }
  return blocked;
}

export function planQuest(input: PlanInput): RoutePlan {
  const { key: category } = categorize(input.prompt);
  let agentId = input.requestedAgent;
  let spawnedAgent: Agent | undefined;
  let reflex: ReflexKind = "manual";

  if (input.requestedAgent === "auto") {
    const existing = input.agentForCategory(category);
    if (existing) {
      agentId = existing.id;
      reflex = "category-match";
    } else {
      const by = input.topAgent();
      spawnedAgent = input.spawnAgent(category, by?.id);
      agentId = spawnedAgent.id;
      reflex = "spawn";
    }
  }

  const blockedSkillIds = blockedSkillsFromFailures(
    input.prompt,
    agentId,
    input.memories,
    input.skills
  );

  const castSkill = findCastableSkill(
    input.prompt,
    category,
    input.skills,
    blockedSkillIds
  );

  if (castSkill) {
    reflex = "skill-cast";
  }

  const memories = retrieveMemories(
    agentId,
    input.prompt,
    input.memories,
    input.agents,
    input.synapses
  );

  const contextSkills = input.skills
    .filter((s) => s.category === category && !blockedSkillIds.includes(s.id))
    .sort((a, b) => b.uses - a.uses)
    .slice(0, 2);

  return {
    agentId,
    spawnedAgent,
    memories,
    contextSkills,
    castSkill,
    reflex,
    blockedSkillIds,
  };
}

export function injectContext(
  prompt: string,
  memories: Memory[],
  skills: Skill[]
): string {
  const parts: string[] = [];

  if (memories.length) {
    parts.push(
      "=== Explicit memory (engrams) ===",
      memories
        .map((m) => `[${m.kind ?? "memory"}: ${m.label}]\n${m.content}`)
        .join("\n\n")
    );
  }

  if (skills.length) {
    parts.push(
      "=== Procedural context (skills) ===",
      skills.map((s) => `[Skill: ${s.name}]\n${s.promptTemplate}`).join("\n\n")
    );
  }

  parts.push("=== Task ===", prompt.trim());
  return parts.join("\n\n");
}

export function injectWalletContext(prompt: string, walletBlock: string): string {
  if (!walletBlock.trim()) return prompt.trim();
  return `=== Connected wallet (0G Galileo) ===\n${walletBlock}\n\n=== Task ===\n${prompt.trim()}`;
}

export function extractTaskPrompt(enriched: string): string {
  const marker = "=== Task ===";
  const idx = enriched.indexOf(marker);
  if (idx >= 0) return enriched.slice(idx + marker.length).trim();
  return enriched.trim();
}

export function formatUserFacingAnswer(answer: string): string {
  if (/=== Connected wallet/.test(answer)) {
    const task = extractTaskPrompt(answer);
    if (task && !task.startsWith("===")) return task;
  }
  if (!/=== (Explicit memory|Procedural context|Task|Connected wallet) ===/.test(answer)) {
    return answer;
  }
  const task = extractTaskPrompt(answer);
  if (task && !task.startsWith("===")) return task;
  return answer
    .replace(/=== Connected wallet \(0G Galileo\) ===[\s\S]*?(?=\n\n===|$)/, "")
    .replace(/=== Explicit memory \(engrams\) ===[\s\S]*?(?=\n\n===|$)/, "")
    .replace(/=== Procedural context \(skills\) ===[\s\S]*?(?=\n\n===|$)/, "")
    .replace(/^=== Task ===\n?/, "")
    .trim();
}
