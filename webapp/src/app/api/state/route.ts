import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { SIGNUP_BONUS } from "@/lib/credits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseAddress(raw: string | null): string | undefined {
  if (!raw || !/^0x[a-fA-F0-9]{40}$/.test(raw)) return undefined;
  return raw;
}

export async function GET(req: NextRequest) {
  const address = parseAddress(req.nextUrl.searchParams.get("address"));
  const networkStats = db.stats();
  const networkSkills = db.skills();
  const networkRoyalties = db.royalties();

  if (!address) {
    return NextResponse.json({
      walletConnected: false,
      skills: [],
      quests: [],
      agents: db.agents(),
      royalties: [],
      creator: db.emptyCreator(),
      stats: db.emptyStats(),
      network: {
        skills: networkSkills,
        stats: networkStats,
        royalties: networkRoyalties.slice(0, 20),
      },
    });
  }

  return NextResponse.json({
    walletConnected: true,
    skills: db.skillsForAddress(address),
    quests: db.quests().filter((q) => q.creator === address || q.creator.includes(address.slice(2, 6))),
    agents: db.agents(),
    royalties: db.royaltiesForAddress(address),
    creator: db.creatorForAddress(address),
    credits: db.ensureCredits(address, SIGNUP_BONUS),
    stats: {
      totalSkills: db.skillsForAddress(address).length,
      totalUses: db.skillsForAddress(address).reduce((s, k) => s + k.uses, 0),
      totalEarnings: db.royaltiesForAddress(address).reduce((s, r) => s + r.amount, 0),
      totalQuests: db.quests().length,
      verifiedShare:
        db.skillsForAddress(address).length === 0
          ? 0
          : db.skillsForAddress(address).filter((s) => s.verified).length /
            db.skillsForAddress(address).length,
    },
    network: {
      skills: networkSkills,
      stats: networkStats,
      royalties: networkRoyalties.slice(0, 20),
    },
  });
}
