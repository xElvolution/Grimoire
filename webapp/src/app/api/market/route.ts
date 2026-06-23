import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const skills = db.skills();
  return NextResponse.json({
    listings: skills.filter((s) => s.forSale),
    skills,
  });
}

/** action: "list" | "unlist" | "buy" */
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
    return NextResponse.json({ ok: true, skill: s });
  }

  if (action === "unlist") {
    const s = db.unlistSkill(skillId);
    if (!s) return NextResponse.json({ error: "skill not found" }, { status: 404 });
    return NextResponse.json({ ok: true, skill: s });
  }

  if (action === "buy") {
    const buyer: string = body.buyer || "you";
    const s = db.buySkill(skillId, buyer);
    if (!s) return NextResponse.json({ error: "not for sale" }, { status: 400 });
    return NextResponse.json({ ok: true, skill: s });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
