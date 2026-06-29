import { ethers } from "ethers";
import { ZEROG, getPrivateKey } from "@/lib/zerog/config";
import { payRoyalty } from "@/lib/zerog/payments";
import { DEPLOYMENTS, explorerTx } from "./deployments";
import {
  SKILL_REGISTRY_ABI,
  ROYALTY_VAULT_ABI,
  MEMORY_REGISTRY_ABI,
  SKILL_MARKETPLACE_ABI,
  AGENT_REGISTRY_ABI,
  ERC20_ABI,
} from "./abis";

export type OnchainResult = { txHash: string; url: string; method: string } | null;

/** Deterministic placeholder address per Grimoire agent id (not a real wallet).
 *  Lets MemoryRegistry.grant/revoke target a stable address per agent so the
 *  off-chain access change has an on-chain mirror with a real tx hash. */
export function agentAddress(agentId: string): string {
  return ethers.getAddress("0x" + ethers.id(`grimoire-agent:${agentId}`).slice(26));
}

function protocolSigner(): ethers.Wallet {
  const provider = new ethers.JsonRpcProvider(ZEROG.rpcUrl);
  return new ethers.Wallet(getPrivateKey(), provider);
}

function toBytes32(id: string): string {
  if (/^0x[a-fA-F0-9]{64}$/.test(id)) return id;
  return ethers.id(id);
}

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
    const direct = await payRoyalty(creator, amountOg);
    if (!direct) return null;
    return { txHash: direct.txHash, url: direct.url, method: "direct.transfer" };
  }
}

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

// ============================================================
//  AgentRegistry  (ERC-7857-style on-chain Agentic ID)
// ============================================================

export async function mintAgentOnChain(
  agentId: string,
  specialty: string,
  spawnedBy = 0
): Promise<{ onChainId: number; txHash: string; url: string } | null> {
  try {
    const signer = protocolSigner();
    const registry = new ethers.Contract(
      DEPLOYMENTS.contracts.AgentRegistry,
      AGENT_REGISTRY_ABI,
      signer
    );
    // metadata = deterministic hash of agent id (placeholder for 0G mind pointer)
    const metadata = ethers.id(`grimoire-agent-mind:${agentId}`);
    const tx = await registry.mintAgent(metadata, specialty.slice(0, 60), spawnedBy);
    const receipt = await tx.wait(1);
    let onChainId = 0;
    for (const log of receipt.logs) {
      try {
        const parsed = registry.interface.parseLog(log);
        if (parsed?.name === "AgentMinted") onChainId = Number(parsed.args[0]);
      } catch {
        /* skip */
      }
    }
    if (!onChainId) onChainId = Number(await registry.nextId()) - 1;
    return { onChainId, txHash: tx.hash, url: explorerTx(tx.hash) };
  } catch {
    return null;
  }
}

// ============================================================
//  SkillMarketplace  (claim, list, buy ownership of a skill)
// ============================================================

function marketContract() {
  return new ethers.Contract(
    DEPLOYMENTS.contracts.SkillMarketplace,
    SKILL_MARKETPLACE_ABI,
    protocolSigner()
  );
}

export async function claimSkillOnChain(rootHash: string): Promise<OnchainResult> {
  try {
    const tx = await marketContract().claim(toBytes32(rootHash));
    await tx.wait(1);
    return { txHash: tx.hash, url: explorerTx(tx.hash), method: "SkillMarketplace.claim" };
  } catch {
    return null;
  }
}

export async function listSkillOnChain(
  rootHash: string,
  priceOg: number
): Promise<OnchainResult> {
  try {
    const price = ethers.parseEther(priceOg.toFixed(6));
    const tx = await marketContract().list(toBytes32(rootHash), price);
    await tx.wait(1);
    return { txHash: tx.hash, url: explorerTx(tx.hash), method: "SkillMarketplace.list" };
  } catch {
    return null;
  }
}

export async function buySkillOnChain(
  rootHash: string,
  priceOg: number
): Promise<OnchainResult> {
  try {
    const value = ethers.parseEther(priceOg.toFixed(6));
    const tx = await marketContract().buy(toBytes32(rootHash), { value });
    await tx.wait(1);
    return { txHash: tx.hash, url: explorerTx(tx.hash), method: "SkillMarketplace.buy" };
  } catch {
    return null;
  }
}

// ============================================================
//  GrimToken  ($GRIM ERC-20)
// ============================================================

export async function mintGrimOnChain(to: string, amount: number): Promise<OnchainResult> {
  if (!to || amount <= 0) return null;
  try {
    const signer = protocolSigner();
    const grim = new ethers.Contract(DEPLOYMENTS.contracts.GrimToken, ERC20_ABI, signer);
    const value = ethers.parseEther(amount.toFixed(6));
    const tx = await grim.mint(to, value);
    await tx.wait(1);
    return { txHash: tx.hash, url: explorerTx(tx.hash), method: "GrimToken.mint" };
  } catch {
    return null;
  }
}

export async function grimBalanceOf(address: string): Promise<number> {
  try {
    const provider = new ethers.JsonRpcProvider(ZEROG.rpcUrl);
    const grim = new ethers.Contract(DEPLOYMENTS.contracts.GrimToken, ERC20_ABI, provider);
    const bal = (await grim.balanceOf(address)) as bigint;
    return Number(ethers.formatEther(bal));
  } catch {
    return 0;
  }
}
