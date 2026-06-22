import type { Skill, Quest, Agent, Creator, RoyaltyEvent } from "./types";

export type GrimoireState = {
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
};

export async function fetchState(): Promise<GrimoireState> {
  const r = await fetch("/api/state", { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load state");
  return r.json();
}

export type QuestResponse = {
  quest: Quest;
  skill: Skill;
  simulated: boolean;
  note?: string;
};

export async function postQuest(
  prompt: string,
  bounty: number,
  agentId: string
): Promise<QuestResponse> {
  const r = await fetch("/api/quest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, bounty, agentId }),
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
