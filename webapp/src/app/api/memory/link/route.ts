import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { publishMindManifest } from "@/lib/mind";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const agentId: string = body.agentId;
  const partnerId: string = body.partnerId;

  if (!agentId || !partnerId || agentId === partnerId) {
    return NextResponse.json(
      { error: "agentId and partnerId (different agents) are required." },
      { status: 400 }
    );
  }

  const linked = db.linkAgents(agentId, partnerId);
  if (!linked) {
    return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  }

  const partner = db.getAgent(partnerId);
  if (partner) {
    await publishMindManifest(linked, db.memories(), db.skills(), db.synapses());
    await publishMindManifest(partner, db.memories(), db.skills(), db.synapses());
  }

  return NextResponse.json({
    ok: true,
    agent: linked,
    partner,
    note: "Agents linked - shared memory access enabled.",
  });
}
