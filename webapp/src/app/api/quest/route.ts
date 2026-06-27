import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { solve } from "@/lib/zerog/engine";
import { uploadJSON } from "@/lib/zerog/storage";
import { payRoyalty } from "@/lib/zerog/payments";
import { planQuest, injectContext } from "@/lib/orchestrator";
import { publishMindManifest } from "@/lib/mind";
import {
  categorize,
  deriveName,
  royaltyForRarity,
  shouldMintSkill,
} from "@/lib/skillMint";
import type { Skill, Quest } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const prompt: string = body.prompt;
  const bounty = Number(body.bounty) || 0;
  const requestedAgent: string = body.agentId || "auto";
  const walletAddress: string | undefined =
    typeof body.creatorAddress === "string" && /^0x[a-fA-F0-9]{40}$/.test(body.creatorAddress)
      ? body.creatorAddress
      : undefined;

  if (!walletAddress) {
    return NextResponse.json(
      { error: "Sign in with your wallet to post tasks and mint skills." },
      { status: 401 }
    );
  }

  const creator = `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 4) {
    return NextResponse.json({ error: "A task description is required." }, { status: 400 });
  }

  const trimmed = prompt.trim();
  const { key: category } = categorize(trimmed);

  const route = planQuest({
    prompt: trimmed,
    requestedAgent,
    agents: db.agents(),
    skills: db.skills(),
    memories: db.memories(),
    synapses: db.synapses(),
    agentForCategory: db.agentForCategory,
    spawnAgent: db.spawnAgent,
    topAgent: db.topAgent,
  });

  let spawnedAgent: { id: string; name: string; specialty: string; erc7857: string; by?: string } | null = null;
  if (route.spawnedAgent) {
    spawnedAgent = {
      id: route.spawnedAgent.id,
      name: route.spawnedAgent.name,
      specialty: route.spawnedAgent.specialty,
      erc7857: route.spawnedAgent.erc7857,
      by: route.spawnedAgent.spawnedBy,
    };
  }

  const firedMemoryIds = route.memories.map((m) => m.id);
  const firedSkillIds = route.contextSkills.map((s) => s.id);
  const createdAt = Date.now();
  const creatorAddress = walletAddress;

  let result: Awaited<ReturnType<typeof solve>>;
  let usedExisting = false;
  let royaltyTx: string | undefined;
  let onchain: { txHash: string; url: string } | null = null;

  try {
    if (route.castSkill) {
      // Spinal reflex - cast existing implicit memory instead of re-solving
      const enriched = injectContext(trimmed, route.memories, route.contextSkills);
      result = await solve(enriched || route.castSkill.promptTemplate);
      usedExisting = true;

      if (result.verified && !result.simulated && route.castSkill.creatorAddress) {
        onchain = await payRoyalty(route.castSkill.creatorAddress, route.castSkill.royaltyPerUse);
        royaltyTx = onchain?.txHash;
      }
      db.recordUse(route.castSkill.id, route.agentId, royaltyTx, result.verified);
      firedSkillIds.push(route.castSkill.id);
    } else {
      const enriched = injectContext(trimmed, route.memories, route.contextSkills);
      result = await solve(enriched);
    }
  } catch (e) {
    const reason = (e as Error).message;
    db.addFailureMemory(route.agentId, trimmed, reason);
    const quest: Quest = {
      id: "q_" + createdAt,
      prompt: trimmed,
      bounty,
      status: "failed",
      creator,
      agentId: route.agentId,
      createdAt,
      firedMemoryIds,
      firedSkillIds,
      reflex: route.reflex,
      failureReason: reason,
    };
    db.addQuest(quest);
    db.recordNeuronFire(route.agentId, firedMemoryIds, firedSkillIds);

    return NextResponse.json({
      quest,
      skill: null,
      skillMinted: false,
      skillNote: "Quest failed - failure engram committed.",
      spawnedAgent,
      simulated: false,
      firedMemories: route.memories,
      reflex: route.reflex,
      error: reason,
    });
  }

  db.recordNeuronFire(route.agentId, firedMemoryIds, firedSkillIds);

  const mintDecision = shouldMintSkill(trimmed, result.verified, db.skills());

  let skill: Skill | null = usedExisting ? route.castSkill ?? null : null;
  let rootHash = "";
  let txHash: string | undefined;

  if (!usedExisting && mintDecision.mint) {
    const record = {
      kind: "grimoire-skill",
      name: deriveName(trimmed, category),
      description: `A reusable ${category.toLowerCase()} skill distilled from a verified method.`,
      category,
      promptTemplate: trimmed,
      sampleOutput: result.answer,
      creator,
      creatorAddress,
      model: result.model,
      provider: result.provider,
      verified: result.verified,
      rarity: mintDecision.rarity,
      createdAt,
    };

    try {
      const up = await uploadJSON(record);
      rootHash = up.rootHash;
      txHash = up.txHash;
    } catch {
      rootHash =
        "0x" +
        Buffer.from(record.name + createdAt)
          .toString("hex")
          .padEnd(64, "0")
          .slice(0, 64);
    }

    skill = {
      id: rootHash,
      name: record.name,
      description: record.description,
      category,
      promptTemplate: trimmed,
      sampleOutput: result.answer,
      creator,
      creatorAddress,
      model: result.model,
      provider: result.provider,
      verified: result.verified,
      rarity: mintDecision.rarity,
      uses: 0,
      earnings: 0,
      royaltyPerUse: royaltyForRarity(mintDecision.rarity),
      createdAt,
      txHash,
    };
    db.addSkill(skill);
  }

  const agent = db.getAgent(route.agentId);
  if (agent) {
    await publishMindManifest(agent, db.memories(), db.skills(), db.synapses());
  }

  const quest: Quest = {
    id: "q_" + createdAt,
    prompt: trimmed,
    bounty,
    status: "solved",
    creator,
    agentId: route.agentId,
    answer: result.answer,
    skillId: skill?.id ?? route.castSkill?.id,
    usedExisting,
    verified: result.verified,
    rootHash: skill?.id ?? route.castSkill?.id,
    txHash: txHash ?? royaltyTx,
    createdAt,
    firedMemoryIds,
    firedSkillIds,
    reflex: route.reflex,
  };
  db.addQuest(quest);

  return NextResponse.json({
    quest,
    skill,
    skillMinted: !!skill && !usedExisting,
    skillNote: usedExisting
      ? `Spinal reflex: cast existing skill "${route.castSkill?.name}" with ${firedMemoryIds.length} memory engram(s) fired.`
      : mintDecision.reason,
    spawnedAgent,
    simulated: result.simulated,
    note: result.note,
    firedMemories: route.memories,
    firedSkills: route.contextSkills,
    castSkill: usedExisting ? route.castSkill : null,
    reflex: route.reflex,
    onchain,
  });
}
