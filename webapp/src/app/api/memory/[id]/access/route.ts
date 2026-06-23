import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Grant or revoke an agent's read access to a memory. Revoke = the agent forgets. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const agentId: string = body.agentId;
  const granted: boolean = body.granted !== false;

  if (!agentId) {
    return NextResponse.json({ error: "agentId required." }, { status: 400 });
  }

  const memory = db.setMemoryAccess(id, agentId, granted);
  if (!memory) {
    return NextResponse.json({ error: "Memory not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, memory });
}
