import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import {
  grantMemoryOnChain,
  revokeMemoryOnChain,
  agentAddress,
} from "@/lib/contracts/onchain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  // Mirror the access change on chain (MemoryRegistry.grant / revoke) so
  // every grant/revoke produces a verifiable tx hash. Best-effort: if the
  // memory wasn't stored on chain, or the call fails, we still keep the
  // off-chain state and return ok.
  let onchain = null;
  if (memory.onChainId) {
    const grantee = agentAddress(agentId);
    onchain = granted
      ? await grantMemoryOnChain(memory.onChainId, grantee)
      : await revokeMemoryOnChain(memory.onChainId, grantee);
  }

  return NextResponse.json({ ok: true, memory, onchain });
}
