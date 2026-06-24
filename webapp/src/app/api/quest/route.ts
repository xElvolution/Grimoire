import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { solve } from "@/lib/zerog/engine";
import { uploadJSON } from "@/lib/zerog/storage";
import { appAddress } from "@/lib/zerog/payments";
import {
  categorize,
  deriveName,
  rarityFor,
  royaltyForRarity,
} from "@/lib/skills";
import type { Skill, Quest } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const prompt: string = body.prompt;
  const bounty = Number(body.bounty) || 0;
  const creator: string = body.creator || "you";
  const requestedAgent: string = body.agentId || "auto";

  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 4) {
    return NextResponse.json({ error: "A task description is required." }, { status: 400 });
  }

  // 1. Solve the task on 0G Compute (TEE-verified when funded)
  const result = await solve(prompt);

  const { key: category } = categorize(prompt);

  // Orchestrator routing: use the specialist for this domain - or SPAWN a new
  // agent (mint a fresh ERC-7857 identity) when no agent covers it yet.
  let agentId = requestedAgent;
  let spawnedAgent: { id: string; name: string; specialty: string; erc7857: string; by?: string } | null = null;
  if (requestedAgent === "auto") {
    const existing = db.agentForCategory(category);
    if (existing) {
      agentId = existing.id;
    } else {
      const by = db.topAgent();
      const fresh = db.spawnAgent(category, by?.id);
      agentId = fresh.id;
      spawnedAgent = {
        id: fresh.id,
        name: fresh.name,
        specialty: fresh.specialty,
        erc7857: fresh.erc7857,
        by: by?.name,
      };
    }
  }

  const rarity = rarityFor(prompt, result.verified);
  const createdAt = Date.now();

  // the address that will receive this skill's royalties (protocol wallet by default)
  let creatorAddress: string | undefined;
  try {
    creatorAddress = appAddress();
  } catch {
    /* no key configured - royalties tracked off-chain only */
  }

  const record = {
    kind: "grimoire-skill",
    name: deriveName(prompt, category),
    description: `A reusable ${category.toLowerCase()} skill distilled from a solved task.`,
    category,
    promptTemplate: prompt,
    sampleOutput: result.answer,
    creator,
    model: result.model,
    provider: result.provider,
    verified: result.verified,
    createdAt,
  };

  // 2. Persist the skill record permanently on 0G Storage
  let rootHash = "";
  let txHash: string | undefined;
  try {
    const up = await uploadJSON(record);
    rootHash = up.rootHash;
    txHash = up.txHash;
  } catch {
    // storage unfunded → synthesize a deterministic local id so the loop still demos
    rootHash =
      "0x" +
      Buffer.from(record.name + createdAt)
        .toString("hex")
        .padEnd(64, "0")
        .slice(0, 64);
  }

  const skill: Skill = {
    id: rootHash,
    name: record.name,
    description: record.description,
    category,
    promptTemplate: prompt,
    sampleOutput: result.answer,
    creator,
    creatorAddress,
    model: result.model,
    provider: result.provider,
    verified: result.verified,
    rarity,
    uses: 1,
    earnings: 0,
    royaltyPerUse: royaltyForRarity(rarity),
    createdAt,
    txHash,
  };
  db.addSkill(skill);

  const quest: Quest = {
    id: "q_" + createdAt,
    prompt,
    bounty,
    status: "solved",
    creator,
    agentId,
    answer: result.answer,
    skillId: skill.id,
    usedExisting: false,
    verified: result.verified,
    rootHash,
    txHash,
    createdAt,
  };
  db.addQuest(quest);

  return NextResponse.json({
    quest,
    skill,
    spawnedAgent,
    simulated: result.simulated,
    note: result.note,
  });
}
