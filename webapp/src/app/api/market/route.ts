import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { listSkillOnChain, buySkillOnChain } from "@/lib/contracts/onchain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const skills = db.skills();
  return NextResponse.json({
    listings: skills.filter((s) => s.forSale),
    skills,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const action: string = body.action;
  const skillId: string = body.skillId;

  if (!skillId) return NextResponse.json({ error: "skillId required" }, { status: 400 });

  if (action === "list") {
    const price = Number(body.price);
    if (!(price > 0)) return NextResponse.json({ error: "price > 0 required" }, { status: 400 });
    const s = db.listSkill(skillId, price);
    if (!s) return NextResponse.json({ error: "skill not found" }, { status: 404 });
    // Mirror on chain via SkillMarketplace.list (best-effort).
    const onchain = await listSkillOnChain(skillId, price);
    if (onchain) db.setSkillMarketTx(skillId, "list", onchain.txHash);
    return NextResponse.json({ ok: true, skill: db.getSkill(skillId) ?? s, onchain });
  }

  if (action === "unlist") {
    const s = db.unlistSkill(skillId);
    if (!s) return NextResponse.json({ error: "skill not found" }, { status: 404 });
    return NextResponse.json({ ok: true, skill: s });
  }

  if (action === "buy") {
    const buyer: string = body.buyer || "you";
    const before = db.getSkill(skillId);
    const price = before?.price ?? 0;
    const s = db.buySkill(skillId, buyer);
    if (!s) return NextResponse.json({ error: "not for sale" }, { status: 400 });
    // Mirror on chain via SkillMarketplace.buy (sends ETH to seller on chain).
    let onchain = null;
    if (price > 0) {
      onchain = await buySkillOnChain(skillId, price);
      if (onchain) db.setSkillMarketTx(skillId, "buy", onchain.txHash);
    }
    return NextResponse.json({ ok: true, skill: db.getSkill(skillId) ?? s, onchain });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
