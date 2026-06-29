"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "@/components/app/Nav";
import { fetchState, type GrimoireState } from "@/lib/client";
import { RARITY_META } from "@/lib/skills";

const EXPLORER = "https://chainscan-galileo.0g.ai";
const CONTRACTS = [
  { name: "SkillRegistry",     addr: "0xC98a9AA31AFb146878bc7E49Be70127Acd9779cf" },
  { name: "AgentRegistry",     addr: "0xC6ff2332670391648A4605B5bC7A9b66aF162E41" },
  { name: "RoyaltyVault",      addr: "0x19E42df6B7e16BefD245Ed32697044D6f09723f4" },
  { name: "MemoryRegistry",    addr: "0xe44820a409c3522665f4AE515CDDF30C09a43a64" },
  { name: "SkillMarketplace",  addr: "0x4e69d7566F434bD1D1a6d0eB9965D0062531467b" },
  { name: "GrimToken ($GRIM)", addr: "0xFC25097421AbD4d422f895671cEfC033F5AAAA8E" },
];

function ago(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const CATEGORIES = ["All", "Research", "Writing", "Code", "Finance", "Strategy", "General"];
const RARITIES = ["All", "legendary", "epic", "rare", "common"];

export default function ExplorePage() {
  const [state, setState] = useState<GrimoireState | null>(null);
  const [cat, setCat] = useState("All");
  const [rarity, setRarity] = useState("All");
  const [q, setQ] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const s = await fetchState();
        if (active) setState(s);
      } catch {
        /* ignore */
      }
    };
    load();
    const id = setInterval(load, 8000); // light auto-refresh; this is a public dashboard
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const stats = state?.stats;
  const allSkills = state?.network?.skills ?? state?.skills ?? [];
  const royalties = state?.network?.royalties ?? state?.royalties ?? [];
  const agents = state?.agents ?? [];

  const skills = useMemo(() => {
    let s = allSkills;
    if (cat !== "All") s = s.filter((k) => k.category === cat);
    if (rarity !== "All") s = s.filter((k) => k.rarity === rarity);
    if (q.trim()) {
      const t = q.toLowerCase();
      s = s.filter(
        (k) =>
          k.name.toLowerCase().includes(t) ||
          k.description.toLowerCase().includes(t)
      );
    }
    return s;
  }, [allSkills, cat, rarity, q]);

  return (
    <div className="min-h-screen bg-runic-grid">
      <Nav />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-10">
        {/* Hero */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-arcane-bright">
                Public network
              </p>
              <h1 className="mt-2 font-display text-4xl text-parchment">
                The Grimoire economy
              </h1>
              <p className="mt-2 text-sm text-ash max-w-xl">
                Live view of every skill, agent, and royalty on Grimoire.
                No sign-in. Every artifact links to its proof on the 0G explorer.
              </p>
            </div>

            <Link
              href="/"
              className="rounded-xl bg-gradient-to-r from-ember-bright to-ember px-5 py-2.5 text-sm font-medium text-void hover:scale-[1.02] transition"
            >
              Connect wallet to join
            </Link>
          </div>

          {/* Network stats */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Skills minted" value={stats?.totalSkills ?? allSkills.length} />
            <Stat label="Total casts" value={stats?.totalUses ?? 0} />
            <Stat
              label="Royalties paid (0G)"
              value={(stats?.totalEarnings ?? 0).toFixed(3)}
              accent
            />
            <Stat label="Agents on network" value={agents.length} />
          </div>
        </section>

        {/* Verified contracts */}
        <section>
          <h2 className="font-display text-xl text-parchment">Verified contracts</h2>
          <p className="mt-1 text-xs text-ash">
            Source-verified on chainscan-galileo.0g.ai. Click to read the code on chain.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CONTRACTS.map((c) => (
              <a
                key={c.addr}
                href={`${EXPLORER}/address/${c.addr}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl glass border border-white/10 p-4 hover:border-arcane/40 transition group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-parchment">{c.name}</span>
                  <span className="text-[10px] text-emerald font-mono">✓ verified</span>
                </div>
                <div className="mt-2 font-mono text-[11px] text-ash truncate">
                  {c.addr}
                </div>
                <div className="mt-2 text-[10px] text-mana opacity-70 group-hover:opacity-100 transition">
                  view on explorer ↗
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Live royalty feed */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-parchment">Live royalty feed</h2>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald" />
              </span>
              streaming
            </span>
          </div>

          <div className="mt-4 space-y-2 max-h-[24rem] overflow-y-auto pr-1">
            {royalties.length === 0 && (
              <div className="rounded-xl glass p-8 text-center text-sm text-ash">
                No casts yet. Be the first.
              </div>
            )}
            <AnimatePresence initial={false}>
              {royalties.slice(0, 50).map((e) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between rounded-lg bg-void/40 border border-white/5 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs text-parchment truncate">
                      <span className="text-arcane-bright">{e.agentId}</span> cast{" "}
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
                        href={`${EXPLORER}/tx/${e.txHash}`}
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
        </section>

        {/* Skill catalog */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-xl text-parchment">All skills on the network</h2>
            <span className="text-xs text-ash">{skills.length} of {allSkills.length}</span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search skills…"
              className="flex-1 min-w-[12rem] rounded-lg border border-white/10 bg-void/60 px-4 py-2 text-sm text-parchment outline-none placeholder:text-ash/40 focus:border-arcane/60"
            />
            <Select label="Category" value={cat} onChange={setCat} options={CATEGORIES} />
            <Select label="Rarity" value={rarity} onChange={setRarity} options={RARITIES} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {skills.length === 0 && (
              <div className="sm:col-span-2 lg:col-span-3 rounded-xl glass p-10 text-center text-sm text-ash">
                No skills match those filters.
              </div>
            )}
            {skills.map((s) => {
              const rarityMeta = RARITY_META[s.rarity];
              return (
                <div
                  key={s.id}
                  className="rounded-2xl glass border border-white/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono uppercase ${rarityMeta.color}`}
                    >
                      {rarityMeta.label} · {s.category}
                    </span>
                    {s.verified ? (
                      <span className="text-[10px] text-emerald">✓ TEE</span>
                    ) : (
                      <span className="text-[10px] text-ash/60">sim</span>
                    )}
                  </div>
                  <h3 className="mt-1 font-display text-base text-parchment truncate">
                    {s.name}
                  </h3>
                  <p className="mt-1 text-xs text-ash line-clamp-2">{s.description}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-ash">
                      {s.uses} uses · {s.earnings.toFixed(3)} 0G earned
                    </span>
                    <span className="font-mono text-[10px] text-ash/60 truncate max-w-[40%]">
                      by {s.creator}
                    </span>
                  </div>
                  {s.txHash && (
                    <a
                      href={`${EXPLORER}/tx/${s.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-[10px] text-mana hover:underline"
                    >
                      0G Storage tx ↗
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Agents */}
        <section>
          <h2 className="font-display text-xl text-parchment">Agents on the network</h2>
          <p className="mt-1 text-xs text-ash">
            ERC-7857 identities. Each has a specialty, reputation, and XP earned from work.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {agents
              .slice()
              .sort((a, b) => b.xp - a.xp)
              .map((a, i) => (
                <div key={a.id} className="rounded-xl glass border border-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-ash/50 text-xs w-4">{i + 1}</span>
                      <span className="text-xl">{a.avatar}</span>
                      <div>
                        <div className="flex items-center gap-1.5 text-sm text-parchment">
                          {a.name}
                          {a.spawnedBy && (
                            <span className="rounded-full bg-mana/10 text-mana text-[9px] px-1.5 py-0.5">
                              spawned
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-ash">{a.specialty}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-arcane-bright">Lv {a.level}</div>
                      <div className="text-[10px] text-ash">★{a.reputation}</div>
                    </div>
                  </div>
                  <div className="mt-2 font-mono text-[10px] text-ash/60 truncate">
                    {a.erc7857}
                  </div>
                  {a.onChainMintTx && (
                    <a
                      href={`${EXPLORER}/tx/${a.onChainMintTx}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-[10px] text-mana hover:underline"
                    >
                      AgentRegistry tx ↗
                    </a>
                  )}
                </div>
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl glass p-4">
      <div
        className={`font-display text-2xl ${
          accent ? "text-ember-bright" : "text-parchment"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] text-ash">{label}</div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-ash">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-white/10 bg-void/60 px-2 py-2 text-parchment outline-none capitalize"
      >
        {options.map((o) => (
          <option key={o} value={o} className="capitalize">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
