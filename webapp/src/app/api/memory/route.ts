import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { uploadJSON } from "@/lib/zerog/storage";
import type { Memory, MemoryKind } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ memories: db.memories(), agents: db.agents() });
}

/** Write a memory for an agent - persisted to 0G Storage. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const agentId: string = body.agentId;
  const label: string = (body.label || "").trim();
  const content: string = (body.content || "").trim();
  const kind: MemoryKind = body.kind || "episodic";

  if (!agentId || !content) {
    return NextResponse.json(
      { error: "agentId and content are required." },
      { status: 400 }
    );
  }

  const createdAt = Date.now();
  const record = {
    kind: "grimoire-memory",
    memoryKind: kind,
    agentId,
    label,
    content,
    createdAt,
  };

  let rootHash = "";
  let txHash: string | undefined;
  let verified = false;
  try {
    const up = await uploadJSON(record);
    rootHash = up.rootHash;
    txHash = up.txHash;
    verified = true;
  } catch {
    rootHash =
      "0x" +
      Buffer.from(label + content + createdAt)
        .toString("hex")
        .padEnd(64, "0")
        .slice(0, 64);
  }

  const memory: Memory = {
    id: rootHash,
    agentId,
    label: label || "Untitled memory",
    content,
    createdAt,
    txHash,
    verified,
    grantedTo: [agentId],
    kind,
  };
  db.addMemory(memory);

  return NextResponse.json({ memory, verified });
}
