/**
 * On-chain royalty settlement.
 * Sends a real 0G transfer from the protocol wallet to a skill creator's address.
 * Best-effort: returns null if the wallet isn't funded / the tx fails, so the
 * economy keeps working in simulation mode. Server-side / Node runtime only.
 */

import { ethers } from "ethers";
import { ZEROG, getPrivateKey, explorerTx } from "./config";

/** The protocol wallet address (also the default royalty payer/treasury). */
export function appAddress(): string {
  return new ethers.Wallet(getPrivateKey()).address;
}

export type RoyaltyTx = { txHash: string; url: string };

/** Pay `amount` (in 0G) to `to`. Returns the tx hash + explorer URL, or null on failure. */
export async function payRoyalty(
  to: string,
  amount: number
): Promise<RoyaltyTx | null> {
  if (!to || amount <= 0) return null;
  try {
    const provider = new ethers.JsonRpcProvider(ZEROG.rpcUrl);
    const wallet = new ethers.Wallet(getPrivateKey(), provider);
    const tx = await wallet.sendTransaction({
      to,
      value: ethers.parseEther(amount.toFixed(6)),
    });
    await tx.wait(1);
    return { txHash: tx.hash, url: explorerTx(tx.hash) };
  } catch {
    return null;
  }
}
