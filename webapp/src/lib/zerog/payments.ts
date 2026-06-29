import { ethers } from "ethers";
import { ZEROG, getPrivateKey, explorerTx } from "./config";

export function appAddress(): string {
  return new ethers.Wallet(getPrivateKey()).address;
}

export type RoyaltyTx = { txHash: string; url: string };

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
