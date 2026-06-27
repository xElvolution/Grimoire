import type { Skill } from "./types";
import { shortAddress } from "./chain";

/** Never show "you" unless the viewer's wallet owns the skill. */
export function skillCreatorLabel(
  skill: Skill,
  viewerAddress?: string | null
): string {
  if (
    viewerAddress &&
    skill.creatorAddress &&
    skill.creatorAddress.toLowerCase() === viewerAddress.toLowerCase()
  ) {
    return "you";
  }
  if (skill.creatorAddress) return shortAddress(skill.creatorAddress);
  if (skill.creator === "you") return "legacy creator";
  return skill.creator;
}

export function skillIsOwnedBy(skill: Skill, viewerAddress?: string | null): boolean {
  return !!(
    viewerAddress &&
    skill.creatorAddress &&
    skill.creatorAddress.toLowerCase() === viewerAddress.toLowerCase()
  );
}
