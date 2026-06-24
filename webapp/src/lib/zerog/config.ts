/**
 * 0G network configuration (Galileo testnet).
 * Sourced from the 0G storage starter kit + agent-skills NETWORK_CONFIG.
 * Server-side only - never import into client components (the SDKs touch fs/crypto).
 */

export const ZEROG = {
  rpcUrl: process.env.RPC_URL || "https://evmrpc-testnet.0g.ai",
  chainId: Number(process.env.CHAIN_ID || 16602),
  storageIndexer:
    process.env.STORAGE_INDEXER ||
    "https://indexer-storage-testnet-turbo.0g.ai",
  explorer: "https://chainscan-galileo.0g.ai",
  faucet: "https://faucet.0g.ai",
} as const;

export function getPrivateKey(): string {
  const pk = process.env.PRIVATE_KEY;
  if (!pk) {
    throw new Error(
      "PRIVATE_KEY is not set. Add it to webapp/.env.local and fund the address at https://faucet.0g.ai"
    );
  }
  return pk.startsWith("0x") ? pk : `0x${pk}`;
}

export function explorerTx(txHash: string): string {
  return `${ZEROG.explorer}/tx/${txHash}`;
}
