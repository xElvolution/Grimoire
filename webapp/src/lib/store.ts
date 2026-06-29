import fs from "fs";
import path from "path";
import type { Skill, Quest, Agent, Creator, RoyaltyEvent, Memory, Synapse, CreditEntry } from "./types";

type DB = {
  skills: Skill[];
  quests: Quest[];
  agents: Agent[];
  creators: Creator[];
  royalties: RoyaltyEvent[];
  memories: Memory[];
  synapses: Synapse[];
  credits: Record<string, number>;
  creditLedger: CreditEntry[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "grimoire.json");

function seed(): DB {
  const agents: Agent[] = [
    { id: "arden", name: "Arden", erc7857: "7857:0x1a…c4", specialty: "Research", level: 7, xp: 1420, reputation: 96, questsSolved: 38, avatar: "🜂" },
    { id: "lyra", name: "Lyra", erc7857: "7857:0x9f…2b", specialty: "Writing", level: 5, xp: 880, reputation: 91, questsSolved: 24, avatar: "🜁" },
    { id: "corvus", name: "Corvus", erc7857: "7857:0x3d…7e", specialty: "Code", level: 4, xp: 540, reputation: 84, questsSolved: 15, avatar: "🜃" },
  ];
  const creators: Creator[] = [
    { handle: "you", address: undefined, xp: 0, level: 1, earnings: 0, skillsCreated: 0 },
  ];
  return { skills: [], quests: [], agents, creators, royalties: [], memories: [], synapses: [], credits: {}, creditLedger: [] };
}

function normalize(db: DB): DB {
  if (!db.memories) db.memories = [];
  if (!db.synapses) db.synapses = [];
  if (!db.credits) db.credits = {};
  if (!db.creditLedger) db.creditLedger = [];
  for (const m of db.memories) {
    if (!m.kind) m.kind = "episodic";
    if (!m.grantedTo) m.grantedTo = [m.agentId];
  }
  for (const a of db.agents) {
    if (!a.linkedAgents) a.linkedAgents = [];
  }
  return db;
}

let cache: DB | null = null;

function load(): DB {
  if (cache) return cache;
  try {
    if (fs.existsSync(DATA_FILE)) {
      cache = normalize(JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as DB);
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

function normAddr(addr: string) {
  return addr.toLowerCase();
}

function matchesAddress(skill: Skill, address: string) {
  return skill.creatorAddress?.toLowerCase() === normAddr(address);
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

  memories(): Memory[] {
    const d = load();
    if (!d.memories) d.memories = [];
    return d.memories.slice().sort((a, b) => b.createdAt - a.createdAt);
  },

  addMemory(m: Memory) {
    const d = load();
    if (!d.memories) d.memories = [];
    if (!m.kind) m.kind = "episodic";
    d.memories.unshift(m);
    this.strengthenSynapse(m.id, m.agentId, "owns");
    persist();
  },

  addFailureMemory(agentId: string, prompt: string, reason: string): Memory {
    const m: Memory = {
      id: "fail_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
      agentId,
      label: "Failure engram",
      content: `Failed approach for: "${prompt.slice(0, 120)}". Reason: ${reason}`,
      createdAt: Date.now(),
      verified: false,
      grantedTo: [agentId],
      kind: "failure",
    };
    this.addMemory(m);
    return m;
  },

  synapses(): Synapse[] {
    return load().synapses ?? [];
  },

  getSynapseWeight(from: string, to: string, kind: Synapse["kind"]): number {
    const s = load().synapses.find((x) => x.from === from && x.to === to && x.kind === kind);
    return s?.weight ?? 1;
  },

  strengthenSynapse(from: string, to: string, kind: Synapse["kind"], delta = 0.35) {
    const d = load();
    if (!d.synapses) d.synapses = [];
    let s = d.synapses.find((x) => x.from === from && x.to === to && x.kind === kind);
    if (!s) {
      s = { from, to, kind, weight: 1, lastFired: Date.now() };
      d.synapses.push(s);
    } else {
      s.weight = Math.min(10, s.weight + delta);
      s.lastFired = Date.now();
    }
    persist();
  },

  recordNeuronFire(agentId: string, memoryIds: string[], skillIds: string[]) {
    for (const mid of memoryIds) {
      this.strengthenSynapse(mid, agentId, "granted");
      this.strengthenSynapse(mid, agentId, "owns");
    }
    for (const sid of skillIds) {
      this.strengthenSynapse(sid, agentId, "cast");
      this.strengthenSynapse("core", sid, "cast", 0.15);
    }
    if (memoryIds.length || skillIds.length) {
      this.strengthenSynapse("core", agentId, "spawned", 0.1);
    }
  },

  linkAgents(agentId: string, partnerId: string): Agent | null {
    const d = load();
    const a = d.agents.find((x) => x.id === agentId);
    const p = d.agents.find((x) => x.id === partnerId);
    if (!a || !p) return null;
    if (!a.linkedAgents) a.linkedAgents = [];
    if (!a.linkedAgents.includes(partnerId)) a.linkedAgents.push(partnerId);
    if (!p.linkedAgents) p.linkedAgents = [];
    if (!p.linkedAgents.includes(agentId)) p.linkedAgents.push(agentId);
    this.strengthenSynapse(agentId, partnerId, "linked");
    this.strengthenSynapse(partnerId, agentId, "linked");
    for (const m of d.memories ?? []) {
      if (m.agentId === agentId && !m.grantedTo.includes(partnerId)) {
        m.grantedTo.push(partnerId);
        this.strengthenSynapse(m.id, partnerId, "granted");
      }
      if (m.agentId === partnerId && !m.grantedTo.includes(agentId)) {
        m.grantedTo.push(agentId);
        this.strengthenSynapse(m.id, agentId, "granted");
      }
    }
    persist();
    return a;
  },

  markMemorySuperseded(id: string): Memory | null {
    const d = load();
    const m = (d.memories ?? []).find((x) => x.id === id);
    if (!m) return null;
    m.superseded = true;
    persist();
    return m;
  },

  addConsolidatedMemory(
    episodicId: string,
    agentId: string,
    label: string,
    content: string,
    id: string,
    txHash?: string,
    verified = false
  ): Memory {
    const m: Memory = {
      id,
      agentId,
      label,
      content,
      createdAt: Date.now(),
      txHash,
      verified,
      grantedTo: [agentId],
      kind: "semantic",
      consolidatedFrom: episodicId,
    };
    this.addMemory(m);
    this.markMemorySuperseded(episodicId);
    return m;
  },

  setMemoryAccess(id: string, agentId: string, granted: boolean): Memory | null {
    const d = load();
    const m = (d.memories || []).find((x) => x.id === id);
    if (!m) return null;
    const has = m.grantedTo.includes(agentId);
    if (granted && !has) m.grantedTo.push(agentId);
    if (!granted && has) m.grantedTo = m.grantedTo.filter((a) => a !== agentId);
    persist();
    return m;
  },

  getSkill(id: string): Skill | undefined {
    return load().skills.find((s) => s.id === id);
  },

  getAgent(id: string): Agent | undefined {
    return load().agents.find((a) => a.id === id);
  },

  agentForCategory(category: string): Agent | undefined {
    return load().agents.find((a) => a.specialty === category);
  },

  topAgent(): Agent {
    return load()
      .agents.slice()
      .sort((a, b) => b.reputation - a.reputation)[0];
  },

  spawnAgent(specialty: string, byAgentId?: string): Agent {
    const d = load();
    const NAMES = ["Vesper", "Onyx", "Sable", "Cipher", "Quill", "Ember", "Wren", "Halcyon", "Thorne", "Isolde", "Rune", "Mordecai"];
    const AVATARS = ["🜄", "🜅", "🜆", "🜇", "🜉", "🜊", "🜋", "🜌", "🜍", "🜎"];
    const used = new Set(d.agents.map((a) => a.name));
    const name = NAMES.find((n) => !used.has(n)) ?? `Agent-${d.agents.length + 1}`;
    const by = byAgentId ? d.agents.find((a) => a.id === byAgentId) : undefined;
    const hex = (n: number, w: number) =>
      Math.floor(Math.random() * n)
        .toString(16)
        .padStart(w, "0");
    const agent: Agent = {
      id: name.toLowerCase(),
      name,
      erc7857: `7857:0x${hex(0xffff, 4)}…${hex(0xff, 2)}`,
      specialty,
      level: 1,
      xp: 0,
      reputation: 70,
      questsSolved: 0,
      avatar: AVATARS[d.agents.length % AVATARS.length],
      spawnedBy: by?.name,
      createdAt: Date.now(),
    };
    d.agents.push(agent);
    this.strengthenSynapse("core", agent.id, "spawned");
    persist();
    return agent;
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

  recordUse(
    skillId: string,
    agentId: string,
    txHash: string | undefined,
    verified: boolean,
    opts?: { callerAddress?: string }
  ): RoyaltyEvent | null {
    const d = load();
    const skill = d.skills.find((s) => s.id === skillId);
    if (!skill) return null;

    const selfUse =
      !!opts?.callerAddress &&
      !!skill.creatorAddress &&
      normAddr(opts.callerAddress) === normAddr(skill.creatorAddress);

    skill.uses += 1;

    const agent = d.agents.find((a) => a.id === agentId);
    if (agent) {
      agent.xp += 40;
      agent.questsSolved += 1;
      agent.level = levelFor(agent.xp);
      agent.reputation = Math.min(100, agent.reputation + 1);
    }

    if (selfUse) {
      this.strengthenSynapse(skillId, agentId, "cast");
      this.strengthenSynapse("core", skillId, "cast", 0.15);
      persist();
      return null;
    }

    skill.earnings += skill.royaltyPerUse;

    const creator = d.creators.find((c) => c.handle === skill.creator);
    if (creator) {
      creator.earnings += skill.royaltyPerUse;
      creator.xp += 25;
      creator.level = levelFor(creator.xp);
    }

    const ev: RoyaltyEvent = {
      id: `${skillId.slice(0, 8)}-${Date.now()}`,
      skillId,
      skillName: skill.name,
      amount: skill.royaltyPerUse,
      to: skill.creator,
      toAddress: skill.creatorAddress,
      agentId,
      txHash,
      verified,
      at: Date.now(),
    };
    d.royalties.unshift(ev);
    this.strengthenSynapse(skillId, agentId, "cast");
    this.strengthenSynapse("core", skillId, "cast", 0.15);
    persist();
    return ev;
  },

  listSkill(id: string, price: number): Skill | null {
    const s = load().skills.find((x) => x.id === id);
    if (!s) return null;
    s.forSale = true;
    s.price = price;
    persist();
    return s;
  },

  unlistSkill(id: string): Skill | null {
    const s = load().skills.find((x) => x.id === id);
    if (!s) return null;
    s.forSale = false;
    s.price = undefined;
    persist();
    return s;
  },

  buySkill(id: string, buyer: string): Skill | null {
    const d = load();
    const s = d.skills.find((x) => x.id === id);
    if (!s || !s.forSale) return null;
    s.creator = buyer;
    s.forSale = false;
    s.price = undefined;
    const c = d.creators.find((x) => x.handle === buyer);
    if (!c) d.creators.push({ handle: buyer, xp: 0, level: 1, earnings: 0, skillsCreated: 0 });
    persist();
    return s;
  },

  /** Persist a Marketplace tx hash (claim / list / buy) against a skill. */
  setSkillMarketTx(id: string, action: "claim" | "list" | "buy", txHash: string) {
    const s = load().skills.find((x) => x.id === id);
    if (!s) return;
    if (action === "claim") s.marketClaimTx = txHash;
    if (action === "list") s.marketListTx = txHash;
    if (action === "buy") s.marketBuyTx = txHash;
    persist();
  },

  /** Persist AgentRegistry on-chain identifiers against an agent. */
  setAgentOnChain(agentId: string, tokenId: number, txHash: string) {
    const a = load().agents.find((x) => x.id === agentId);
    if (!a) return;
    a.onChainTokenId = tokenId;
    a.onChainMintTx = txHash;
    persist();
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

  skillsForAddress(address: string): Skill[] {
    return load()
      .skills.filter((s) => matchesAddress(s, address))
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  royaltiesForAddress(address: string): RoyaltyEvent[] {
    const addr = normAddr(address);
    const d = load();
    return d.royalties
      .filter((r) => {
        if (r.toAddress?.toLowerCase() === addr) return true;
        const skill = d.skills.find((s) => s.id === r.skillId);
        return skill ? matchesAddress(skill, address) : false;
      })
      .sort((a, b) => b.at - a.at);
  },

  creatorForAddress(address: string): Creator {
    const skills = this.skillsForAddress(address);
    const royalties = this.royaltiesForAddress(address);
    const earnings = royalties.reduce((s, r) => s + r.amount, 0);
    const xp = skills.length * 120 + royalties.length * 25;
    return {
      handle: `${address.slice(0, 6)}…${address.slice(-4)}`,
      address,
      connected: true,
      xp,
      level: levelFor(xp),
      earnings,
      skillsCreated: skills.length,
    };
  },

  emptyCreator(): Creator {
    return {
      handle: "",
      connected: false,
      xp: 0,
      level: 1,
      earnings: 0,
      skillsCreated: 0,
    };
  },

  getCredits(address: string): number {
    return load().credits[normAddr(address)] ?? 0;
  },

  ensureCredits(address: string, bonus = 0): number {
    const d = load();
    const key = normAddr(address);
    if (d.credits[key] === undefined) {
      d.credits[key] = bonus;
      persist();
    }
    return d.credits[key];
  },

  /** True iff this address has never had a credits row before this call. */
  isFirstTimeAddress(address: string): boolean {
    const d = load();
    return d.credits[normAddr(address)] === undefined;
  },

  addCredits(address: string, amount: number, meta?: { txHash?: string; note?: string }): number {
    const d = load();
    const key = normAddr(address);
    d.credits[key] = (d.credits[key] ?? 0) + amount;
    d.creditLedger.unshift({
      id: `cr-${Date.now()}`,
      address: key,
      type: "fund",
      amount,
      balanceAfter: d.credits[key],
      note: meta?.note ?? "Funded balance",
      txHash: meta?.txHash,
      at: Date.now(),
    });
    persist();
    return d.credits[key];
  },

  deductCredits(
    address: string,
    amount: number,
    meta?: { note?: string; mode?: string; questId?: string }
  ): boolean {
    const d = load();
    const key = normAddr(address);
    const bal = d.credits[key] ?? 0;
    if (bal < amount) return false;
    d.credits[key] = bal - amount;
    d.creditLedger.unshift({
      id: `db-${Date.now()}`,
      address: key,
      type: "debit",
      amount,
      balanceAfter: d.credits[key],
      note: meta?.note ?? "Task",
      mode: meta?.mode,
      questId: meta?.questId,
      at: Date.now(),
    });
    persist();
    return true;
  },

  refundCredits(
    address: string,
    amount: number,
    meta?: { note?: string; questId?: string }
  ): number {
    const d = load();
    const key = normAddr(address);
    d.credits[key] = (d.credits[key] ?? 0) + amount;
    d.creditLedger.unshift({
      id: `rf-${Date.now()}`,
      address: key,
      type: "refund",
      amount,
      balanceAfter: d.credits[key],
      note: meta?.note ?? "Refund",
      questId: meta?.questId,
      at: Date.now(),
    });
    persist();
    return d.credits[key];
  },

  creditLedgerForAddress(address: string, limit = 30): CreditEntry[] {
    const key = normAddr(address);
    return load()
      .creditLedger.filter((e) => e.address === key)
      .slice(0, limit);
  },

  emptyStats() {
    return {
      totalSkills: 0,
      totalUses: 0,
      totalEarnings: 0,
      totalQuests: 0,
      verifiedShare: 0,
    };
  },
};
