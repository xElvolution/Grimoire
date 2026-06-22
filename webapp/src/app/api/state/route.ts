import { NextResponse } from "next/server";
import { db } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    skills: db.skills(),
    quests: db.quests(),
    agents: db.agents(),
    royalties: db.royalties(),
    creator: db.creator("you"),
    stats: db.stats(),
  });
}
