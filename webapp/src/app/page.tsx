"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useGrimoireWallet } from "@/lib/wallet";
import { fetchState, runSkill, type GrimoireState } from "@/lib/client";
import Nav from "@/components/app/Nav";
import SkillCard from "@/components/app/SkillCard";
import RoyaltyFeed from "@/components/app/RoyaltyFeed";
import Counter from "@/components/app/Counter";

export default function AppPage() {
  const { address, isConnected } = useGrimoireWallet();
  const [state, setState] = useState<GrimoireState | null>(null);
  const [castingId, setCastingId] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setState(await fetchState(isConnected ? address : undefined));
    } catch {
      /* ignore */
    }
  }, [address, isConnected]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onCast = useCallback(
    async (id: string) => {
      if (!state) return;
      const pool = state.agents;
      const agent = pool[Math.floor(Math.random() * pool.length)];
      setCastingId(id);
      try {
        const res = await runSkill(id, agent.id);
        if (res.royalty) {
          const paidToYou =
            isConnected &&
            address &&
            res.royalty.toAddress?.toLowerCase() === address.toLowerCase();
          setFlash(
            `${agent.name} cast "${res.royalty.skillName}" → +${res.royalty.amount} 0G${
              res.result.verified ? " · TEE" : ""
            }${paidToYou ? " · your wallet" : ""}`
          );
          setTimeout(() => setFlash(null), 3500);
        }
        await refresh();
      } catch {
        /* ignore */
      } finally {
        setCastingId(null);
      }
    },
    [state, refresh, address, isConnected]
  );

  const creator = state?.creator;
  const stats = state?.stats;
  const network = state?.network;
  const browseSkills = isConnected ? (state?.skills ?? []) : (network?.skills ?? []);

  return (
    <div className="min-h-screen bg-runic-grid">
      <Nav
        right={
          isConnected ? (
            <div className="rounded-lg glass px-3 py-1.5 text-right">
              <div className="font-mono text-sm text-ember-bright">
                <Counter value={creator?.earnings ?? 0} decimals={3} suffix=" 0G" />
              </div>
              <div className="text-[10px] text-ash">earnings</div>
            </div>
          ) : null
        }
      />

      {flash && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 left-1/2 z-50 -translate-x-1/2 max-w-[92vw] rounded-xl glass px-5 py-3 text-center text-sm text-parchment"
        >
          {flash}
        </motion.div>
      )}

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-parchment">Dashboard</h1>
            <p className="mt-1 text-sm text-ash">
              Your skills, royalties, and network activity.
            </p>
          </div>
          <Link
            href="/task"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-ember-bright to-ember px-5 py-2.5 text-sm font-medium text-void hover:scale-[1.02] transition shrink-0"
          >
            New task →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <EconStat label="Your skills" value={stats?.totalSkills ?? 0} />
          <EconStat label="Casts" value={stats?.totalUses ?? 0} />
          <EconStat
            label="Royalties"
            value={stats?.totalEarnings ?? 0}
            decimals={3}
            suffix=" 0G"
            accent
          />
          <EconStat label="Verified" value={(stats?.verifiedShare ?? 0) * 100} suffix="%" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg text-parchment">
                {isConnected ? "Your skills" : "Network skills"}
              </h2>
              <span className="text-xs text-ash">{browseSkills.length} total</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {browseSkills.length === 0 && (
                <div className="sm:col-span-2 rounded-2xl glass p-10 text-center text-sm text-ash">
                  {isConnected
                    ? "No skills yet."
                    : "Sign in to mint skills."}{" "}
                  <Link href="/task" className="text-mana hover:underline">
                    Post a task
                  </Link>
                </div>
              )}
              {browseSkills.map((s) => (
                <SkillCard
                  key={s.id}
                  skill={s}
                  onCast={onCast}
                  casting={castingId === s.id}
                  viewerAddress={isConnected ? address : null}
                />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {state && (
              <RoyaltyFeed
                events={state.royalties}
                walletConnected={isConnected}
                networkEvents={network?.royalties}
              />
            )}

            <div className="rounded-2xl glass p-5">
              <h3 className="font-display text-lg text-parchment">Agents</h3>
              <div className="mt-3 space-y-2">
                {state?.agents
                  .slice()
                  .sort((a, b) => b.xp - a.xp)
                  .slice(0, 6)
                  .map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-lg bg-void/40 border border-white/5 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span>{a.avatar}</span>
                        <span className="text-sm text-parchment">{a.name}</span>
                      </div>
                      <span className="text-xs text-ash">Lv {a.level}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function EconStat({
  label,
  value,
  decimals = 0,
  suffix = "",
  accent = false,
}: {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl glass p-4">
      <div
        className={`font-display text-xl sm:text-2xl ${
          accent ? "text-ember-bright" : "text-parchment"
        }`}
      >
        <Counter value={value} decimals={decimals} suffix={suffix} />
      </div>
      <div className="mt-1 text-[11px] text-ash">{label}</div>
    </div>
  );
}
