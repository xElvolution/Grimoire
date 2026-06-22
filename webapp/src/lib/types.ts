/** Core domain model for the Grimoire economy. */

export type Rarity = "common" | "rare" | "epic" | "legendary";

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
};

export type Quest = {
  id: string;
  prompt: string;
  bounty: number;
  status: "open" | "solving" | "solved";
  creator: string;
  agentId?: string;
  answer?: string;
  skillId?: string; // skill created OR skill used
  usedExisting?: boolean;
  verified?: boolean;
  rootHash?: string;
  txHash?: string;
  createdAt: number;
};

export type Agent = {
  id: string;
  name: string;
  erc7857: string; // Agentic ID
  level: number;
  xp: number;
  reputation: number;
  questsSolved: number;
  avatar: string; // emoji/glyph
};

export type Creator = {
  handle: string;
  address?: string;
  xp: number;
  level: number;
  earnings: number;
  skillsCreated: number;
};

export type RoyaltyEvent = {
  id: string;
  skillId: string;
  skillName: string;
  amount: number;
  to: string; // creator handle
  agentId: string;
  txHash?: string;
  verified: boolean;
  at: number;
};
