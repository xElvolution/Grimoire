/**
 * @grimoire/sdk - TypeScript client for the Grimoire agent economy on 0G.
 */

export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  promptTemplate: string;
  sampleOutput: string;
  creator: string;
  creatorAddress?: string;
  model: string;
  provider: string;
  verified: boolean;
  rarity: Rarity;
  uses: number;
  earnings: number;
  royaltyPerUse: number;
  createdAt: number;
  txHash?: string;
}

export interface Agent {
  id: string;
  name: string;
  erc7857: string;
  specialty: string;
  level: number;
  xp: number;
  reputation: number;
  questsSolved: number;
  avatar: string;
  spawnedBy?: string;
}

export interface RoyaltyEvent {
  id: string;
  skillId: string;
  skillName: string;
  amount: number;
  to: string;
  agentId: string;
  txHash?: string;
  verified: boolean;
  at: number;
}

export interface Quest {
  id: string;
  prompt: string;
  answer?: string;
  status: string;
  verified?: boolean;
  mode?: string;
  artifact?: { type: string; content: string; language?: string };
  creditCost?: number;
}

export interface TaskResult {
  quest: Quest;
  skill: Skill | null;
  skillMinted: boolean;
  simulated: boolean;
  credits?: number;
  onchain?: { txHash: string; url: string } | null;
  artifact?: Quest["artifact"];
}

export interface GrimoireState {
  skills: Skill[];
  agents: Agent[];
  royalties: RoyaltyEvent[];
  credits?: number;
  stats: {
    totalSkills: number;
    totalUses: number;
    totalEarnings: number;
    totalQuests: number;
    verifiedShare: number;
  };
}

export interface CreditState {
  balance: number;
  treasury: string;
  signupBonus: number;
}

export interface GrimoireConfig {
  baseUrl?: string;
  fetch?: typeof fetch;
}

export class GrimoireError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "GrimoireError";
  }
}

export class GrimoireClient {
  private readonly baseUrl: string;
  private readonly _fetch: typeof fetch;

  constructor(config: GrimoireConfig = {}) {
    this.baseUrl = (config.baseUrl ?? "http://localhost:3000").replace(/\/$/, "");
    const f = config.fetch ?? globalThis.fetch;
    if (!f) throw new GrimoireError("No fetch - pass fetch in config.");
    this._fetch = f.bind(globalThis);
  }

  /** Post a task (primary API - skills used automatically by orchestrator). */
  async createTask(
    prompt: string,
    opts: {
      mode?: string;
      bounty?: number;
      agentId?: string;
      creatorAddress: string;
    }
  ): Promise<TaskResult> {
    return this.post("/api/quest", {
      prompt,
      mode: opts.mode ?? "ask",
      bounty: opts.bounty ?? 0,
      agentId: opts.agentId ?? "auto",
      creatorAddress: opts.creatorAddress,
    });
  }

  /** @deprecated Use createTask - skills run via orchestrator, not manually. */
  async createSkill(
    prompt: string,
    opts: { bounty?: number; agentId?: string; creator?: string } = {}
  ) {
    return this.createTask(prompt, {
      creatorAddress: opts.creator ?? "",
      agentId: opts.agentId,
      bounty: opts.bounty,
    });
  }

  async getCredits(address: string): Promise<CreditState> {
    return this.get(`/api/credits?address=${address}`);
  }

  async fundCredits(address: string, amount: number, txHash?: string) {
    return this.post("/api/credits", { address, amount, txHash });
  }

  async listSkills(): Promise<Skill[]> {
    return (await this.getState()).skills;
  }

  async getState(walletAddress?: string): Promise<GrimoireState> {
    const qs = walletAddress ? `?address=${walletAddress}` : "";
    return this.get(`/api/state${qs}`);
  }

  async getBrain() {
    return this.get("/api/brain");
  }

  async writeMemory(agentId: string, label: string, content: string, kind?: string) {
    return this.post("/api/memory", { agentId, label, content, kind });
  }

  async consolidateMemory(memoryId?: string, agentId?: string) {
    return this.post("/api/memory/consolidate", { memoryId, agentId });
  }

  async linkAgents(agentId: string, partnerId: string) {
    return this.post("/api/memory/link", { agentId, partnerId });
  }

  private async get<T>(path: string): Promise<T> {
    const res = await this._fetch(`${this.baseUrl}${path}`, {
      headers: { accept: "application/json" },
    });
    return this.handle<T>(res);
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const res = await this._fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return this.handle<T>(res);
  }

  private async handle<T>(res: Response): Promise<T> {
    const data = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) throw new GrimoireError(data?.error ?? `Request failed (${res.status})`, res.status);
    return data as T;
  }
}

export default GrimoireClient;
