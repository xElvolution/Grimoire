/**
 * Lightweight file-backed store for the Grimoire economy index.
 * 0G Storage holds the canonical skill records; this tracks the live index,
 * agents, creators, royalty feed, and XP so the app has state across restarts.
 * Server-side only.
 */

import fs from "fs";
import path from "path";
import type { Skill, Quest, Agent, Creator, RoyaltyEvent } from "./types";

type DB = {
  skills: Skill[];
  quests: Quest[];
  agents: Agent[];
  creators: Creator[];
  royalties: RoyaltyEvent[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "grimoire.json");

function seed(): DB {
  const agents: Agent[] = [
    { id: "arden", name: "Arden", erc7857: "7857:0x1a…c4", level: 7, xp: 1420, reputation: 96, questsSolved: 38, avatar: "🜂" },
    { id: "lyra", name: "Lyra", erc7857: "7857:0x9f…2b", level: 5, xp: 880, reputation: 91, questsSolved: 24, avatar: "🜁" },
    { id: "corvus", name: "Corvus", erc7857: "7857:0x3d…7e", level: 4, xp: 540, reputation: 84, questsSolved: 15, avatar: "🜃" },
  ];
  const creators: Creator[] = [
    { handle: "you", address: undefined, xp: 0, level: 1, earnings: 0, skillsCreated: 0 },
  ];
  return { skills: [], quests: [], agents, creators, royalties: [] };
}

let cache: DB | null = null;

function load(): DB {
  if (cache) return cache;
  try {
    if (fs.existsSync(DATA_FILE)) {
      cache = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as DB;
      return cache;
    }
  } catch {
    /* fall through to seed */
  }
  cache = seed();
  persist();
  return cache;
}

function persist() {
  if (!cache) return;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(cache, null, 2));
  } catch {
    /* best-effort */
  }
}

function levelFor(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 100)) + 1);
}

export const db = {
  all(): DB {
    return load();
  },

  skills(): Skill[] {
    return load().skills.slice().sort((a, b) => b.uses - a.uses);
  },

  quests(): Quest[] {
    return load().quests.slice().sort((a, b) => b.createdAt - a.createdAt);
  },

  agents(): Agent[] {
    return load().agents;
  },

  royalties(): RoyaltyEvent[] {
    return load().royalties.slice().sort((a, b) => b.at - a.at);
  },

  getSkill(id: string): Skill | undefined {
    return load().skills.find((s) => s.id === id);
  },

  getAgent(id: string): Agent | undefined {
    return load().agents.find((a) => a.id === id);
  },

  addSkill(s: Skill) {
    const d = load();
    d.skills.unshift(s);
    const c = d.creators.find((x) => x.handle === s.creator) ?? { handle: s.creator, xp: 0, level: 1, earnings: 0, skillsCreated: 0 };
    if (!d.creators.includes(c)) d.creators.push(c);
    c.skillsCreated += 1;
    c.xp += 120;
    c.level = levelFor(c.xp);
    persist();
  },

  addQuest(q: Quest) {
    load().quests.unshift(q);
    persist();
  },

  /** Record a verified skill use: bump uses, pay the creator a royalty, award agent XP. */
  recordUse(skillId: string, agentId: string, txHash: string | undefined, verified: boolean): RoyaltyEvent | null {
    const d = load();
    const skill = d.skills.find((s) => s.id === skillId);
    if (!skill) return null;
    skill.uses += 1;
    skill.earnings += skill.royaltyPerUse;

    const creator = d.creators.find((c) => c.handle === skill.creator);
    if (creator) {
      creator.earnings += skill.royaltyPerUse;
      creator.xp += 25;
      creator.level = levelFor(creator.xp);
    }

    const agent = d.agents.find((a) => a.id === agentId);
    if (agent) {
      agent.xp += 40;
      agent.questsSolved += 1;
      agent.level = levelFor(agent.xp);
      agent.reputation = Math.min(100, agent.reputation + 1);
    }

    const ev: RoyaltyEvent = {
      id: `${skillId.slice(0, 8)}-${Date.now()}`,
      skillId,
      skillName: skill.name,
      amount: skill.royaltyPerUse,
      to: skill.creator,
      agentId,
      txHash,
      verified,
      at: Date.now(),
    };
    d.royalties.unshift(ev);
    persist();
    return ev;
  },

  creator(handle: string): Creator {
    const d = load();
    let c = d.creators.find((x) => x.handle === handle);
    if (!c) {
      c = { handle, xp: 0, level: 1, earnings: 0, skillsCreated: 0 };
      d.creators.push(c);
      persist();
    }
    return c;
  },

  stats() {
    const d = load();
    return {
      totalSkills: d.skills.length,
      totalUses: d.skills.reduce((s, k) => s + k.uses, 0),
      totalEarnings: d.skills.reduce((s, k) => s + k.earnings, 0),
      totalQuests: d.quests.length,
      verifiedShare:
        d.skills.length === 0
          ? 0
          : d.skills.filter((s) => s.verified).length / d.skills.length,
    };
  },
};
