import type { Skill, Quest, Agent, Creator, RoyaltyEvent, Memory, Synapse } from "./types";

export type GrimoireState = {
  walletConnected: boolean;
  skills: Skill[];
  quests: Quest[];
  agents: Agent[];
  royalties: RoyaltyEvent[];
  creator: Creator;
  stats: {
    totalSkills: number;
    totalUses: number;
    totalEarnings: number;
    totalQuests: number;
    verifiedShare: number;
  };
  network: {
    skills: Skill[];
    stats: GrimoireState["stats"];
    royalties: RoyaltyEvent[];
  };
};

export async function fetchState(walletAddress?: string): Promise<GrimoireState> {
  const qs = walletAddress ? `?address=${walletAddress}` : "";
  const r = await fetch(`/api/state${qs}`, { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load state");
  return r.json();
}

export type SpawnedAgent = {
  id: string;
  name: string;
  specialty: string;
  erc7857: string;
  by?: string;
};

export type QuestResponse = {
  quest: Quest;
  skill: Skill | null;
  skillMinted: boolean;
  skillNote?: string;
  spawnedAgent: SpawnedAgent | null;
  simulated: boolean;
  note?: string;
  firedMemories?: Memory[];
  firedSkills?: Skill[];
  castSkill?: Skill | null;
  reflex?: string;
  onchain?: { txHash: string; url: string } | null;
  error?: string;
};

export async function postQuest(
  prompt: string,
  bounty: number,
  agentId: string,
  creatorAddress?: string
): Promise<QuestResponse> {
  const r = await fetch("/api/quest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, bounty, agentId, creatorAddress }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || "Quest failed");
  return data;
}

export type RunResponse = {
  ok: boolean;
  result: {
    verified: boolean;
    simulated: boolean;
    provider: string;
    model: string;
    answer: string;
    note?: string;
  };
  royalty: RoyaltyEvent | null;
  agent: Agent | null;
  skill: Skill | null;
  firedMemories?: Memory[];
  firedMemoryIds?: string[];
};

export async function runSkill(id: string, agentId: string): Promise<RunResponse> {
  const r = await fetch(`/api/skills/${id}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || "Run failed");
  return data;
}

// ---- memory ----------------------------------------------------------------

export type MemoryState = { memories: Memory[]; agents: Agent[] };

export async function fetchMemory(): Promise<MemoryState> {
  const r = await fetch("/api/memory", { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load memory");
  return r.json();
}

export async function writeMemory(
  agentId: string,
  label: string,
  content: string,
  kind?: Memory["kind"]
): Promise<{ memory: Memory; verified: boolean }> {
  const r = await fetch("/api/memory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId, label, content, kind }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || "Write failed");
  return data;
}

export async function setMemoryAccess(
  id: string,
  agentId: string,
  granted: boolean
): Promise<{ ok: boolean; memory: Memory }> {
  const r = await fetch(`/api/memory/${id}/access`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId, granted }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || "Access change failed");
  return data;
}

export type BrainState = {
  graph: { nodes: unknown[]; links: unknown[] };
  synapses: Synapse[];
  health: Array<{
    agentId: string;
    memoryCount: number;
    skillCount: number;
    synapseCount: number;
    failureCount: number;
    status: string;
  }>;
  stats: { neurons: number; synapses: number; memories: number; skills: number; agents: number };
};

export async function fetchBrain(): Promise<BrainState> {
  const r = await fetch("/api/brain", { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load brain");
  return r.json();
}

export async function consolidateMemory(memoryId?: string, agentId?: string) {
  const r = await fetch("/api/memory/consolidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memoryId, agentId }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || "Consolidation failed");
  return data;
}

export async function linkAgents(agentId: string, partnerId: string) {
  const r = await fetch("/api/memory/link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId, partnerId }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || "Link failed");
  return data;
}

// ---- market ----------------------------------------------------------------

export type MarketState = { listings: Skill[]; skills: Skill[] };

export async function fetchMarket(): Promise<MarketState> {
  const r = await fetch("/api/market", { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load market");
  return r.json();
}

export async function marketAction(
  action: "list" | "unlist" | "buy",
  skillId: string,
  extra: { price?: number; buyer?: string } = {}
): Promise<{ ok: boolean; skill: Skill }> {
  const r = await fetch("/api/market", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, skillId, ...extra }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || "Market action failed");
  return data;
}
