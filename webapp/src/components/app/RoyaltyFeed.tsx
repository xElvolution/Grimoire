"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { RoyaltyEvent } from "@/lib/types";

function ago(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export default function RoyaltyFeed({
  events,
  walletConnected = true,
  networkEvents = [],
}: {
  events: RoyaltyEvent[];
  walletConnected?: boolean;
  networkEvents?: RoyaltyEvent[];
}) {
  const showNetwork = !walletConnected && networkEvents.length > 0;
  const list = walletConnected ? events : networkEvents;

  return (
    <div className="rounded-2xl glass p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-parchment">
          {walletConnected ? "Your royalty feed" : "Network royalty feed"}
        </h3>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald" />
          </span>
          live
        </span>
      </div>

      {!walletConnected && (
        <p className="mt-2 text-[11px] text-ash">
          Showing when someone uses a skill on the network. Sign in to see royalties paid to you.
        </p>
      )}

      <div className="mt-4 space-y-2 max-h-[22rem] overflow-y-auto pr-1">
        {list.length === 0 && (
          <p className="text-xs text-ash py-8 text-center">
            {walletConnected
              ? "No royalties yet. Create a skill, then others can use it and pay you."
              : "Sign in to earn when others use your skills."}
          </p>
        )}
        <AnimatePresence initial={false}>
          {list.slice(0, 30).map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: -12, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between rounded-lg bg-void/40 border border-white/5 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="text-xs text-parchment truncate">
                  <span className="text-arcane-bright">{e.agentId}</span> used{" "}
                  <span className="text-ash">{e.skillName}</span>
                </div>
                <div className="text-[10px] text-ash/60">
                  → {e.to} · {ago(e.at)}{" "}
                  {e.verified ? (
                    <span className="text-emerald">· ✓ TEE</span>
                  ) : (
                    <span className="text-ash/50">· sim</span>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-mono text-sm text-ember-bright">
                  +{e.amount} 0G
                </div>
                {e.txHash && (
                  <a
                    href={`https://chainscan-galileo.0g.ai/tx/${e.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-mana hover:underline"
                  >
                    on-chain ↗
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {showNetwork && (
        <p className="mt-3 text-[10px] text-ash/70 text-center">
          These royalties went to other creators - not your wallet.
        </p>
      )}
    </div>
  );
}
