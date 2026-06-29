import { ethers } from "ethers";
import { zerogGalileo } from "@/lib/chain";
import { DEPLOYMENTS } from "@/lib/contracts/deployments";
import { ERC20_ABI } from "@/lib/contracts/abis";
import { db } from "@/lib/store";
import { formatCredits } from "@/lib/credits";

export type WalletSnapshot = {
  address: string;
  native0G: string;
  grimBalance: string;
  creditBalance: number;
  skillsOwned: number;
  totalEarned: number;
  totalUses: number;
  recentLedger: { type: string; amount: number; note?: string }[];
};

export async function fetchWalletSnapshot(address: string): Promise<WalletSnapshot> {
  const provider = new ethers.JsonRpcProvider(zerogGalileo.rpcUrls.default.http[0]);
  const nativeWei = await provider.getBalance(address);
  let grimBalance = "0";
  try {
    const grim = new ethers.Contract(DEPLOYMENTS.contracts.GrimToken, ERC20_ABI, provider);
    const raw = await grim.balanceOf(address);
    grimBalance = ethers.formatUnits(raw, 18);
  } catch {
    /* token read optional */
  }

  const creator = db.creatorForAddress(address);
  const skills = db.skillsForAddress(address);
  const ledger = db.creditLedgerForAddress(address).slice(0, 5);

  return {
    address,
    native0G: ethers.formatEther(nativeWei),
    grimBalance,
    creditBalance: db.getCredits(address),
    skillsOwned: skills.length,
    totalEarned: creator.earnings,
    totalUses: skills.reduce((s, k) => s + k.uses, 0),
    recentLedger: ledger.map((e) => ({
      type: e.type,
      amount: e.amount,
      note: e.note ?? e.mode,
    })),
  };
}

export function formatWalletSnapshot(w: WalletSnapshot): string {
  const lines = [
    `Wallet ${w.address.slice(0, 6)}…${w.address.slice(-4)}`,
    `Native 0G (gas): ${Number(w.native0G).toFixed(4)} 0G`,
    `$GRIM: ${Number(w.grimBalance).toFixed(4)}`,
    `App task balance: ${formatCredits(w.creditBalance)} 0G`,
    `Skills you own: ${w.skillsOwned}`,
    `Royalties earned: ${w.totalEarned.toFixed(4)} 0G`,
    `Total skill uses: ${w.totalUses}`,
  ];
  if (w.recentLedger.length) {
    lines.push(
      "Recent activity:",
      ...w.recentLedger.map(
        (e) => `  ${e.type === "debit" ? "−" : "+"}${formatCredits(e.amount)} - ${e.note ?? e.type}`
      )
    );
  }
  return lines.join("\n");
}
