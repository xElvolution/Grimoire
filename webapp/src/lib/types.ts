/** Core domain model for the Grimoire economy. */

export type Rarity = "common" | "rare" | "epic" | "legendary";

export type MemoryKind = "episodic" | "semantic" | "failure" | "preference";

export type SynapseKind = "owns" | "granted" | "cast" | "spawned" | "linked";

export type Skill = {
  id: string; // 0G Storage root hash (permanent identifier)
  name: string;
  description: string;
  category: string;
  promptTemplate: string; // the reusable "recipe"
  sampleOutput: string;
  creator: string; // handle
  creatorAddress?: string; // wallet that receives royalties
  model: string;
  provider: string;
  verified: boolean; // produced inside a TEE
  rarity: Rarity;
  uses: number;
  earnings: number; // total 0G paid to the creator
  royaltyPerUse: number;
  createdAt: number;
  txHash?: string; // 0G Storage tx
  forSale?: boolean;
  price?: number; // listing price in 0G
};

export type Quest = {
  id: string;
  prompt: string;
  bounty: number;
  status: "open" | "solving" | "solved" | "failed";
  creator: string;
  agentId?: string;
  answer?: string;
  skillId?: string; // skill created OR skill used
  usedExisting?: boolean;
  verified?: boolean;
  rootHash?: string;
  txHash?: string;
  createdAt: number;
  firedMemoryIds?: string[];
  firedSkillIds?: string[];
  reflex?: string;
  failureReason?: string;
};

export type Agent = {
  id: string;
  name: string;
  erc7857: string; // Agentic ID
  specialty: string; // the category this agent is expert in
  level: number;
  xp: number;
  reputation: number;
  questsSolved: number;
  avatar: string; // emoji/glyph
  spawnedBy?: string; // name of the agent that minted this one
  createdAt?: number;
  linkedAgents?: string[]; // corpus callosum - shared memory partners
};

export type Creator = {
  handle: string;
  address?: string;
  connected?: boolean;
  xp: number;
  level: number;
  earnings: number;
  skillsCreated: number;
};

export type Memory = {
  id: string; // 0G Storage root hash
  agentId: string; // owning agent
  label: string;
  content: string;
  createdAt: number;
  txHash?: string;
  verified: boolean; // stored on real 0G (vs local)
  grantedTo: string[]; // agent ids with read access
  kind?: MemoryKind;
  consolidatedFrom?: string; // episodic source id
  superseded?: boolean; // episodic faded after consolidation
};

export type Synapse = {
  from: string;
  to: string;
  kind: SynapseKind;
  weight: number;
  lastFired?: number;
};

export type RoyaltyEvent = {
  id: string;
  skillId: string;
  skillName: string;
  amount: number;
  to: string; // creator display
  toAddress?: string; // wallet that receives royalties
  agentId: string;
  txHash?: string;
  verified: boolean;
  at: number;
};

export type MindManifest = {
  kind: "grimoire-mind";
  agentId: string;
  neurons: {
    memories: string[];
    skills: string[];
  };
  synapses: Synapse[];
  updatedAt: number;
};
