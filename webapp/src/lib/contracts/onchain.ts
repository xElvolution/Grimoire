/**
 * On-chain settlement via deployed Grimoire contracts.
 * Royalties: RoyaltyVault.deposit → SkillRegistry.useSkill fallback.
 * Skills/memories: registration txs prepared for user wallet when needed.
 */

import { ethers } from "ethers";
import { ZEROG, getPrivateKey } from "@/lib/zerog/config";
import { payRoyalty } from "@/lib/zerog/payments";
import { DEPLOYMENTS, explorerTx } from "./deployments";
import {
  SKILL_REGISTRY_ABI,
  ROYALTY_VAULT_ABI,
  MEMORY_REGISTRY_ABI,
} from "./abis";

export type OnchainResult = { txHash: string; url: string; method: string } | null;

function protocolSigner(): ethers.Wallet {
  const provider = new ethers.JsonRpcProvider(ZEROG.rpcUrl);
  return new ethers.Wallet(getPrivateKey(), provider);
}

function toBytes32(id: string): string {
  if (/^0x[a-fA-F0-9]{64}$/.test(id)) return id;
  return ethers.id(id);
}

/** Credit creator via RoyaltyVault, then direct transfer fallback. */
export async function settleRoyalty(
  creator: string,
  amountOg: number
): Promise<OnchainResult> {
  if (!creator || amountOg <= 0) return null;
  const signer = protocolSigner();
  const value = ethers.parseEther(amountOg.toFixed(6));

  try {
    const vault = new ethers.Contract(
      DEPLOYMENTS.contracts.RoyaltyVault,
      ROYALTY_VAULT_ABI,
      signer
    );
    const tx = await vault.deposit(creator, { value });
    await tx.wait(1);
    return { txHash: tx.hash, url: explorerTx(tx.hash), method: "RoyaltyVault.deposit" };
  } catch {
    /* vault failed - direct transfer */
  }

  const direct = await payRoyalty(creator, amountOg);
  if (!direct) return null;
  return { txHash: direct.txHash, url: direct.url, method: "direct.transfer" };
}

/** Settle skill use on SkillRegistry when skill is registered on-chain. */
export async function settleSkillUse(
  rootHash: string,
  amountOg: number,
  creator: string
): Promise<OnchainResult> {
  if (amountOg <= 0) return null;
  const signer = protocolSigner();
  const root = toBytes32(rootHash);
  const value = ethers.parseEther(amountOg.toFixed(6));

  try {
    const registry = new ethers.Contract(
      DEPLOYMENTS.contracts.SkillRegistry,
      SKILL_REGISTRY_ABI,
      signer
    );
    if (!(await registry.exists(root))) return settleRoyalty(creator, amountOg);

    const tx = await registry.useSkill(root, { value });
    await tx.wait(1);
    return { txHash: tx.hash, url: explorerTx(tx.hash), method: "SkillRegistry.useSkill" };
  } catch {
    return settleRoyalty(creator, amountOg);
  }
}

/** Register skill on-chain from protocol wallet (creator must match signer for royalties). */
export async function registerSkillOnChain(
  rootHash: string,
  royaltyOg: number,
  creatorAddress: string
): Promise<OnchainResult | { pending: true; calldata: string; to: string }> {
  const signer = protocolSigner();
  const root = toBytes32(rootHash);
  const royalty = ethers.parseEther(royaltyOg.toFixed(6));

  if (signer.address.toLowerCase() === creatorAddress.toLowerCase()) {
    try {
      const registry = new ethers.Contract(
        DEPLOYMENTS.contracts.SkillRegistry,
        SKILL_REGISTRY_ABI,
        signer
      );
      const tx = await registry.registerSkill(root, royalty);
      await tx.wait(1);
      return { txHash: tx.hash, url: explorerTx(tx.hash), method: "SkillRegistry.registerSkill" };
    } catch {
      return null;
    }
  }

  const iface = new ethers.Interface(SKILL_REGISTRY_ABI);
  const data = iface.encodeFunctionData("registerSkill", [root, royalty]);
  return {
    pending: true,
    calldata: data,
    to: DEPLOYMENTS.contracts.SkillRegistry,
  };
}

/** Store memory root on MemoryRegistry (protocol-owned entry; ACL off-chain + grant). */
export async function storeMemoryOnChain(
  rootHash: string,
  label: string
): Promise<{ onChainId: number; txHash: string; url: string } | null> {
  try {
    const signer = protocolSigner();
    const mem = new ethers.Contract(
      DEPLOYMENTS.contracts.MemoryRegistry,
      MEMORY_REGISTRY_ABI,
      signer
    );
    const root = toBytes32(rootHash);
    const tx = await mem.store(root, label.slice(0, 120));
    const receipt = await tx.wait(1);
    let onChainId = 0;
    for (const log of receipt.logs) {
      try {
        const parsed = mem.interface.parseLog(log);
        if (parsed?.name === "MemoryStored") {
          onChainId = Number(parsed.args[0]);
        }
      } catch {
        /* skip */
      }
    }
    if (!onChainId) {
      onChainId = Number(await mem.nextId()) - 1;
    }
    return { onChainId, txHash: tx.hash, url: explorerTx(tx.hash) };
  } catch {
    return null;
  }
}

export async function grantMemoryOnChain(
  onChainId: number,
  grantee: string
): Promise<OnchainResult> {
  try {
    const signer = protocolSigner();
    const mem = new ethers.Contract(
      DEPLOYMENTS.contracts.MemoryRegistry,
      MEMORY_REGISTRY_ABI,
      signer
    );
    const tx = await mem.grant(onChainId, grantee);
    await tx.wait(1);
    return { txHash: tx.hash, url: explorerTx(tx.hash), method: "MemoryRegistry.grant" };
  } catch {
    return null;
  }
}

export async function revokeMemoryOnChain(
  onChainId: number,
  grantee: string
): Promise<OnchainResult> {
  try {
    const signer = protocolSigner();
    const mem = new ethers.Contract(
      DEPLOYMENTS.contracts.MemoryRegistry,
      MEMORY_REGISTRY_ABI,
      signer
    );
    const tx = await mem.revoke(onChainId, grantee);
    await tx.wait(1);
    return { txHash: tx.hash, url: explorerTx(tx.hash), method: "MemoryRegistry.revoke" };
  } catch {
    return null;
  }
}

/** Unsigned tx for user wallet to register their skill. */
export function buildRegisterSkillTx(rootHash: string, royaltyOg: number) {
  const iface = new ethers.Interface(SKILL_REGISTRY_ABI);
  const root = toBytes32(rootHash);
  const royalty = ethers.parseEther(royaltyOg.toFixed(6));
  return {
    to: DEPLOYMENTS.contracts.SkillRegistry as string,
    data: iface.encodeFunctionData("registerSkill", [root, royalty]),
    value: "0x0",
    chainId: DEPLOYMENTS.chainId,
  };
}
