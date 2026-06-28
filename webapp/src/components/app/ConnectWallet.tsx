"use client";

import { useGrimoireWallet } from "@/lib/wallet";
import { shortAddress } from "@/lib/chain";

export default function ConnectWallet() {
  const { ready, isConnected, address, login, logout } = useGrimoireWallet();

  if (!ready) {
    return (
      <div className="h-9 w-24 rounded-lg bg-white/5 animate-pulse" aria-hidden />
    );
  }

  if (isConnected && address) {
    return (
      <button
        type="button"
        onClick={logout}
        className="h-9 inline-flex items-center rounded-lg glass px-3 text-xs font-mono text-parchment hover:glow-arcane transition"
        title={address}
      >
        <span className="hidden sm:inline text-ash mr-1.5">wallet</span>
        {shortAddress(address)}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={login}
      className="h-9 inline-flex items-center rounded-lg bg-gradient-to-r from-arcane to-arcane-deep px-3 text-xs font-medium text-white hover:opacity-90 transition shrink-0"
    >
      Sign in
    </button>
  );
}
