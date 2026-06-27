import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { consolidateEpisodicMemory } from "@/lib/consolidation";
import { publishMindManifest } from "@/lib/mind";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Nightly-style consolidation: episodic → semantic memory on 0G. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const memoryId: string = body.memoryId;
  const agentId: string = body.agentId;

  let episodic = memoryId
    ? db.memories().find((m) => m.id === memoryId)
    : undefined;

  if (!episodic && agentId) {
    episodic = db
      .memories()
      .find((m) => m.agentId === agentId && m.kind === "episodic" && !m.superseded);
  }

  if (!episodic) {
    return NextResponse.json({ error: "No episodic memory to consolidate." }, { status: 404 });
  }

  const distilled = await consolidateEpisodicMemory(episodic);
  const semantic = db.addConsolidatedMemory(
    episodic.id,
    episodic.agentId,
    distilled.label,
    distilled.content,
    distilled.rootHash,
    distilled.txHash,
    !!distilled.txHash
  );

  const agent = db.getAgent(episodic.agentId);
  if (agent) {
    await publishMindManifest(agent, db.memories(), db.skills(), db.synapses());
  }

  return NextResponse.json({
    ok: true,
    episodicId: episodic.id,
    semantic,
    note: "Episodic memory consolidated into semantic engram; episode superseded.",
  });
}
