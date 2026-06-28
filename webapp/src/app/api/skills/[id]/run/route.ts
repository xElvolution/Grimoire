import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { solve } from "@/lib/zerog/engine";
import { settleSkillUse } from "@/lib/contracts/onchain";
import { injectContext, retrieveMemories } from "@/lib/orchestrator";
import { publishMindManifest } from "@/lib/mind";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** A (different) agent casts an existing skill → verified in TEE → royalty to the creator. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const agentId: string = body.agentId || "lyra";
  const callerAddress: string | undefined =
    typeof body.callerAddress === "string" && /^0x[a-fA-F0-9]{40}$/.test(body.callerAddress)
      ? body.callerAddress
      : undefined;

  const skill = db.getSkill(id);
  if (!skill) {
    return NextResponse.json({ error: "Skill not found." }, { status: 404 });
  }

  const memories = retrieveMemories(
    agentId,
    skill.promptTemplate,
    db.memories(),
    db.agents(),
    db.synapses(),
    4
  );

  const enriched = injectContext(skill.promptTemplate, memories, [skill]);
  const firedMemoryIds = memories.map((m) => m.id);

  let result: Awaited<ReturnType<typeof solve>>;
  try {
    result = await solve(enriched);
  } catch (e) {
    db.addFailureMemory(agentId, skill.promptTemplate, (e as Error).message);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }

  db.recordNeuronFire(agentId, firedMemoryIds, [skill.id]);

  const selfUse =
    !!callerAddress &&
    !!skill.creatorAddress &&
    callerAddress.toLowerCase() === skill.creatorAddress.toLowerCase();

  let onchain: { txHash: string; url: string } | null = null;
  if (result.verified && !result.simulated && skill.creatorAddress && !selfUse) {
    const settled = await settleSkillUse(skill.id, skill.royaltyPerUse, skill.creatorAddress);
    if (settled) onchain = settled;
  }

  const royalty = db.recordUse(id, agentId, onchain?.txHash, result.verified, {
    callerAddress,
  });

  const agent = db.getAgent(agentId);
  if (agent) {
    await publishMindManifest(agent, db.memories(), db.skills(), db.synapses());
  }

  return NextResponse.json({
    ok: true,
    result: {
      verified: result.verified,
      simulated: result.simulated,
      provider: result.provider,
      model: result.model,
      answer: result.answer,
      note: result.note,
    },
    royalty,
    onchain,
    agent: db.getAgent(agentId),
    skill: db.getSkill(id),
    firedMemories: memories,
    firedMemoryIds,
  });
}
