import { db } from "@/lib/store";
import { formatCredits } from "@/lib/credits";
import { fetchWalletSnapshot, formatWalletSnapshot } from "@/lib/walletState";
import { extractTaskPrompt } from "@/lib/orchestrator";

export type DirectTaskKind = "balance" | "earnings" | "my-skills" | "trade-info";

export type DirectTaskResult = {
  kind: DirectTaskKind;
  answer: string;
};

function cleanPrompt(raw: string): string {
  return extractTaskPrompt(raw).replace(/^(Build|Write clean[^:]*|Summarize[^:]*):\s*/i, "").trim();
}

export function detectDirectTask(prompt: string): DirectTaskKind | null {
  const p = cleanPrompt(prompt).toLowerCase();

  if (
    /\b(balance|how much (0g|do i have)|what('s| is) my (balance|wallet)|show (my )?wallet|track my balance)\b/.test(
      p
    )
  ) {
    return "balance";
  }
  if (/\b(how much (have i )?earned|my earnings|royalties earned|total earned)\b/.test(p)) {
    return "earnings";
  }
  if (/\b(my skills|skills i (made|created|minted|own)|what skills do i)\b/.test(p)) {
    return "my-skills";
  }
  if (/\b(swap|trade|exchange|buy grim|sell grim|defi|liquidity)\b/.test(p)) {
    return "trade-info";
  }
  return null;
}

export async function runDirectTask(
  kind: DirectTaskKind,
  walletAddress: string
): Promise<DirectTaskResult> {
  const snap = await fetchWalletSnapshot(walletAddress);

  if (kind === "balance") {
    return {
      kind,
      answer:
        `Here's your Grimoire wallet snapshot:\n\n${formatWalletSnapshot(snap)}\n\n` +
        `App balance pays for tasks. Native 0G is for gas and on-chain txs. ` +
        `Fund app balance from the 0G pill in the nav.`,
    };
  }

  if (kind === "earnings") {
    const skills = db.skillsForAddress(walletAddress);
    const top = [...skills].sort((a, b) => b.earnings - a.earnings).slice(0, 5);
    const lines = top.length
      ? top.map((s) => `• ${s.name} - ${s.earnings.toFixed(4)} 0G (${s.uses} uses)`)
      : ["No skill earnings yet - solve tasks that become skills others reuse."];
    return {
      kind,
      answer:
        `You've earned ${snap.totalEarned.toFixed(4)} 0G in royalties across ${snap.skillsOwned} skill(s).\n\n` +
        `Top earners:\n${lines.join("\n")}\n\n` +
        `Every verified reuse of your skills pays you automatically.`,
    };
  }

  if (kind === "my-skills") {
    const skills = db.skillsForAddress(walletAddress);
    if (!skills.length) {
      return {
        kind,
        answer:
          "You haven't minted any skills yet. Post a task - when Grimoire finds a reusable method, it becomes a skill on 0G Storage that others can run (and pay you for).",
      };
    }
    const lines = skills
      .slice(0, 12)
      .map((s) => `• ${s.name} (${s.rarity}) - ${s.uses} uses, ${s.earnings.toFixed(4)} 0G earned`);
    return {
      kind,
      answer: `Your skills in the Library (${skills.length}):\n\n${lines.join("\n")}\n\nView all in Library or list for sale on Market.`,
    };
  }

  return {
    kind,
    answer:
      `Wallet ready for on-chain actions on 0G Galileo:\n\n${formatWalletSnapshot(snap)}\n\n` +
      `Grimoire routes trade tasks through your connected wallet. ` +
      `Token swaps across DEX protocols on 0G are rolling out - for now you can:\n` +
      `• Use Market to buy/sell skill ownership (royalty streams)\n` +
      `• Fund task balance from native 0G\n` +
      `• Ask a specific trade and I'll route it when DEX integration lands\n\n` +
      `Balances above are live from chain + app ledger.`,
  };
}
