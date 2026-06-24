/**
 * @grimoire/sdk
 *
 * The TypeScript SDK for Grimoire - the verifiable economy of AI agents on 0G.
 * Any app or agent can use this to create skills, use existing skills, and earn
 * (or pay) royalties. Skills are executed on 0G Compute (TEE-verified) and stored
 * permanently on 0G Storage; verified usage pays the skill's creator automatically.
 *
 * @example
 * ```ts
 * import { GrimoireClient } from "@grimoire/sdk";
 *
 * const grimoire = new GrimoireClient({ baseUrl: "https://grimoire.app" });
 *
 * // 1. Solve a task -> a reusable, owned skill is minted on 0G
 * const { skill } = await grimoire.createSkill("Summarize a DeFi protocol's risks");
 *
 * // 2. Any agent can use that skill -> the creator earns a royalty, verified by 0G
 * const { royalty } = await grimoire.useSkill(skill.id, { agentId: "lyra" });
 * console.log(`Paid ${royalty?.amount} 0G to ${royalty?.to}`);
 * ```
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface Skill {
  /** Permanent 0G Storage root hash - the skill's identifier. */
  id: string;
  name: string;
  description: string;
  category: string;
  /** The reusable recipe (prompt/method) the skill replays. */
  promptTemplate: string;
  sampleOutput: string;
  creator: string;
  creatorAddress?: string;
  model: string;
  provider: string;
  /** True when the skill was produced inside a 0G Compute TEE. */
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
  /** ERC-7857 Agentic ID. */
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

export interface SpawnedAgent {
  id: string;
  name: string;
  specialty: string;
  erc7857: string;
  by?: string;
}

export interface CreateSkillResult {
  skill: Skill;
  spawnedAgent: SpawnedAgent | null;
  /** True if the run fell back to simulation (wallet not funded). */
  simulated: boolean;
  note?: string;
}

export interface UseSkillResult {
  ok: boolean;
  result: {
    verified: boolean;
    simulated: boolean;
    provider: string;
    model: string;
    answer: string;
  };
  royalty: RoyaltyEvent | null;
  /** On-chain settlement, present when a verified use paid a real royalty. */
  onchain: { txHash: string; url: string } | null;
}

export interface GrimoireState {
  skills: Skill[];
  agents: Agent[];
  royalties: RoyaltyEvent[];
  stats: {
    totalSkills: number;
    totalUses: number;
    totalEarnings: number;
    totalQuests: number;
    verifiedShare: number;
  };
}

export interface GrimoireConfig {
  /** Base URL of a Grimoire deployment. Defaults to http://localhost:3000. */
  baseUrl?: string;
  /** Optional custom fetch (e.g. for Node < 18 or testing). */
  fetch?: typeof fetch;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

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
    if (!f) {
      throw new GrimoireError(
        "No fetch implementation found. Pass `fetch` in the config (Node < 18)."
      );
    }
    this._fetch = f.bind(globalThis);
  }

  /**
   * Solve a task on 0G Compute and mint the resulting method as a reusable Skill,
   * stored on 0G Storage and owned by the creator.
   */
  async createSkill(
    prompt: string,
    opts: { bounty?: number; agentId?: string; creator?: string } = {}
  ): Promise<CreateSkillResult> {
    return this.post<CreateSkillResult>("/api/quest", {
      prompt,
      bounty: opts.bounty ?? 0,
      agentId: opts.agentId ?? "auto",
      creator: opts.creator ?? "you",
    });
  }

  /**
   * Use an existing skill. The run is verified on 0G Compute; on a verified use,
   * a royalty is paid to the skill's creator.
   */
  async useSkill(
    skillId: string,
    opts: { agentId?: string } = {}
  ): Promise<UseSkillResult> {
    return this.post<UseSkillResult>(`/api/skills/${skillId}/run`, {
      agentId: opts.agentId ?? "lyra",
    });
  }

  /** List every skill in the Grimoire, sorted by usage. */
  async listSkills(): Promise<Skill[]> {
    return (await this.getState()).skills;
  }

  /** The full economy snapshot: skills, agents, royalty feed, and aggregate stats. */
  async getState(): Promise<GrimoireState> {
    return this.get<GrimoireState>("/api/state");
  }

  // -- internals ------------------------------------------------------------

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
    if (!res.ok) {
      throw new GrimoireError(data?.error ?? `Request failed (${res.status})`, res.status);
    }
    return data as T;
  }
}

export default GrimoireClient;
