import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { solve } from "@/lib/zerog/engine";
import { payRoyalty } from "@/lib/zerog/payments";

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

  const skill = db.getSkill(id);
  if (!skill) {
    return NextResponse.json({ error: "Skill not found." }, { status: 404 });
  }

  // Re-run the skill's recipe on 0G Compute - this is the verifiable "use"
  const result = await solve(skill.promptTemplate);

  // On a verified (real TEE) use, settle the royalty on-chain to the creator's address
  let onchain: { txHash: string; url: string } | null = null;
  if (result.verified && !result.simulated && skill.creatorAddress) {
    onchain = await payRoyalty(skill.creatorAddress, skill.royaltyPerUse);
  }

  // Record the verified use: bumps uses, pays the creator a royalty, awards agent XP
  const royalty = db.recordUse(id, agentId, onchain?.txHash, result.verified);

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
  });
}
