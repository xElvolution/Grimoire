"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import type { ReactNode } from "react";
import { zerogGalileo } from "@/lib/chain";
import { CreditsProvider } from "./CreditsProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center text-sm text-ash">
        <p>
          Set <code className="text-parchment">NEXT_PUBLIC_PRIVY_APP_ID</code> in{" "}
          <code className="text-parchment">webapp/.env.local</code> to enable wallet sign-in.
        </p>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["email", "wallet", "google"],
        appearance: {
          theme: "dark",
          accentColor: "#8b5cf6",
          logo: "/grimoire-logo-nav.png",
        },
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
        supportedChains: [zerogGalileo],
        defaultChain: zerogGalileo,
      }}
    >
      <CreditsProvider>{children}</CreditsProvider>
    </PrivyProvider>
  );
}
