"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";

/** Privy-backed wallet session for Grimoire. */
export function useGrimoireWallet() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets.find((w) => w.walletClientType === "privy") ?? wallets[0];
  const address = wallet?.address as `0x${string}` | undefined;

  return {
    ready,
    isConnected: authenticated && !!address,
    address,
    login,
    logout,
  };
}
