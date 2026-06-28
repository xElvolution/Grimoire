import { defineChain } from "viem";

/** 0G Galileo testnet */
export const zerogGalileo = defineChain({
  id: 16602,
  name: "0G Galileo Testnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://evmrpc-testnet.0g.ai"] },
  },
  blockExplorers: {
    default: {
      name: "0G Explorer",
      url: "https://chainscan-galileo.0g.ai",
    },
  },
});

export function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Protocol treasury - receives credit deposits (matches server PRIVATE_KEY wallet). */
export const CREDIT_TREASURY =
  process.env.NEXT_PUBLIC_CREDIT_TREASURY ||
  "0xe6A9c7B4e791199C58B3e88526e04e166294580A";
