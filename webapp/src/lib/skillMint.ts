/** Skill distillation rules - not every answer becomes a skill. Server-side. */

import type { Rarity, Skill } from "./types";
import { rarityFor, wordSimilarity } from "./skills";

export type MintDecision = {
  mint: boolean;
  reason: string;
  rarity: Rarity;
};

const rarityRank: Record<Rarity, number> = {
  common: 0,
  rare: 1,
  epic: 2,
  legendary: 3,
};

/**
 * Decide whether a solved task yields a mintable skill.
 * Answers always return; skills are rare, unique, reusable assets.
 */
export function shouldMintSkill(
  prompt: string,
  verified: boolean,
  existing: Pick<Skill, "promptTemplate" | "category">[]
): MintDecision {
  const rarity = rarityFor(prompt, verified);
  const p = prompt.trim();

  const dupe = existing.some((s) => wordSimilarity(s.promptTemplate, p) > 0.72);
  if (dupe) {
    return {
      mint: false,
      rarity,
      reason:
        "A similar skill already exists in the Grimoire. Your task was answered, but no duplicate skill was minted.",
    };
  }

  if (p.length < 50) {
    return {
      mint: false,
      rarity,
      reason:
        "Task too brief to distill a reusable skill. You received the answer - post a deeper task to mint one.",
    };
  }

  if (rarity === "common" && p.length < 90) {
    return {
      mint: false,
      rarity,
      reason:
        "One-off tasks don't become skills. This answer stands alone - craft a more specific, reusable challenge to mint.",
    };
  }

  if (rarityRank[rarity] < rarityRank.rare && !verified) {
    return {
      mint: false,
      rarity,
      reason:
        "The solution wasn't distinctive enough to mint. Answer delivered; only rare, reusable methods become skills.",
    };
  }

  return {
    mint: true,
    rarity,
    reason: `Distinctive ${rarity} skill distilled - stored on 0G, castable by any agent.`,
  };
}

export { deriveName, royaltyForRarity, categorize, rarityFor } from "./skills";
