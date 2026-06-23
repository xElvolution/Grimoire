"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchState, runSkill, type GrimoireState } from "@/lib/client";
import Nav from "@/components/app/Nav";
import QuestComposer from "@/components/app/QuestComposer";
import SkillCard from "@/components/app/SkillCard";
import RoyaltyFeed from "@/components/app/RoyaltyFeed";
import Counter from "@/components/app/Counter";

export default function AppPage() {
  const [state, setState] = useState<GrimoireState | null>(null);
  const [castingId, setCastingId] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setState(await fetchState());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onCast = useCallback(
    async (id: string) => {
      if (!state) return;
      // a DIFFERENT agent casts the skill — rotate through the roster
      const pool = state.agents;
      const agent = pool[Math.floor(Math.random() * pool.length)];
      setCastingId(id);
      try {
        const res = await runSkill(id, agent.id);
        if (res.royalty) {
          setFlash(
            `${agent.name} cast "${res.royalty.skillName}" → +${res.royalty.amount} 0G to ${res.royalty.to}${
              res.result.verified ? " · ✓ TEE" : ""
            }`
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
    [state, refresh]
  );

  const creator = state?.creator;
  const stats = state?.stats;

  return (
    <div className="min-h-screen bg-runic-grid">
      {/* header */}
      <Nav
        right={
          <div className="flex items-center gap-2 sm:gap-3">
            <StatPill label="Level" value={creator ? String(creator.level) : "—"} />
            <StatPill label="XP" value={creator ? String(creator.xp) : "—"} />
            <div className="rounded-lg glass px-3 py-1.5 text-right">
              <div className="font-mono text-sm text-ember-bright">
                {creator ? (
                  <Counter value={creator.earnings} decimals={3} suffix=" 0G" />
                ) : (
                  "—"
                )}
              </div>
              <div className="text-[10px] text-ash">your earnings</div>
            </div>
          </div>
        }
      />

      {/* flash toast */}
      {flash && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 left-1/2 z-50 -translate-x-1/2 max-w-[92vw] rounded-xl glass glow-ember px-5 py-3 text-center text-sm text-parchment"
        >
          {flash}
        </motion.div>
      )}

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* economy stat strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <EconStat label="Skills minted" value={stats?.totalSkills ?? 0} />
          <EconStat label="Total casts" value={stats?.totalUses ?? 0} />
          <EconStat
            label="Royalties paid"
            value={stats?.totalEarnings ?? 0}
            decimals={3}
            suffix=" 0G"
            accent
          />
          <EconStat
            label="Verified share"
            value={(stats?.verifiedShare ?? 0) * 100}
            suffix="%"
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* left: composer + skills */}
          <div className="lg:col-span-2 space-y-6">
            {state && <QuestComposer agents={state.agents} onSolved={refresh} />}

            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-parchment">The Grimoire</h2>
                <span className="text-xs text-ash">
                  {state?.skills.length ?? 0} skills · cast any to pay its creator
                </span>
              </div>
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                {state?.skills.length === 0 && (
                  <div className="sm:col-span-2 rounded-2xl glass p-10 text-center text-sm text-ash">
                    No skills yet. Post a task above — the agent that solves it
                    mints your first skill.
                  </div>
                )}
                {state?.skills.map((s) => (
                  <SkillCard
                    key={s.id}
                    skill={s}
                    onCast={onCast}
                    casting={castingId === s.id}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* right: feed + agents */}
          <div className="space-y-6">
            {state && <RoyaltyFeed events={state.royalties} />}

            <div className="rounded-2xl glass p-5">
              <h3 className="font-display text-lg text-parchment">Agents</h3>
              <p className="text-[11px] text-ash mb-3">
                ERC-7857 identities · earn XP per cast
              </p>
              <div className="space-y-2">
                {state?.agents
                  .slice()
                  .sort((a, b) => b.xp - a.xp)
                  .map((a, i) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-lg bg-void/40 border border-white/5 px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-ash/50 text-xs w-4">{i + 1}</span>
                        <span className="text-lg">{a.avatar}</span>
                        <div>
                          <div className="flex items-center gap-1.5 text-sm text-parchment">
                            {a.name}
                            {a.spawnedBy && (
                              <span
                                title={`spawned by ${a.spawnedBy}`}
                                className="rounded-full bg-mana/10 text-mana text-[9px] px-1.5 py-0.5"
                              >
                                spawned
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-[10px] text-ash/60">
                            {a.specialty} · {a.erc7857}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-arcane-bright">Lv {a.level}</div>
                        <div className="text-[10px] text-ash">
                          {a.questsSolved} casts · ★{a.reputation}
                        </div>
                      </div>
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

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="hidden sm:block rounded-lg glass px-3 py-1.5 text-right">
      <div className="font-mono text-sm text-parchment">{value}</div>
      <div className="text-[10px] text-ash">{label}</div>
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
    <div className="rounded-2xl glass p-5">
      <div
        className={`font-display text-2xl sm:text-3xl ${accent ? "text-ember-bright" : "text-parchment"}`}
      >
        <Counter value={value} decimals={decimals} suffix={suffix} />
      </div>
      <div className="mt-1 text-xs text-ash">{label}</div>
    </div>
  );
}
