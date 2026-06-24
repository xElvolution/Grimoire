"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Nav from "@/components/app/Nav";
import { fetchMarket, marketAction, type MarketState } from "@/lib/client";
import { RARITY_META } from "@/lib/skills";

export default function MarketPage() {
  const [state, setState] = useState<MarketState | null>(null);
  const [price, setPrice] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setState(await fetchMarket());
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  async function act(
    action: "list" | "unlist" | "buy",
    id: string,
    extra: { price?: number; buyer?: string } = {}
  ) {
    setBusy(id);
    try {
      await marketAction(action, id, extra);
      await refresh();
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  }

  const listings = state?.listings ?? [];
  const owned = (state?.skills ?? []).filter((s) => s.creator === "you" && !s.forSale);

  return (
    <div className="min-h-screen bg-runic-grid">
      <Nav />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <h1 className="font-display text-3xl text-parchment">Skill Market</h1>
        <p className="mt-1 text-sm text-ash">
          Buy and sell ownership of a skill - the buyer inherits its royalty stream.
          Settled on-chain by the <span className="text-arcane-bright">SkillMarketplace</span> contract.
        </p>

        {/* listings */}
        <h2 className="mt-8 font-display text-xl text-parchment">For sale</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3 rounded-2xl glass p-10 text-center text-sm text-ash">
              Nothing listed yet. List one of your skills below.
            </div>
          )}
          {listings.map((s) => (
            <motion.div
              key={s.id}
              layout
              className="rounded-2xl border border-ember/30 bg-gradient-to-b from-ember/5 to-transparent p-5"
            >
              <div className={`text-[11px] font-mono uppercase ${RARITY_META[s.rarity].color}`}>
                {RARITY_META[s.rarity].label} · {s.category}
              </div>
              <h3 className="mt-1 font-display text-lg text-parchment">{s.name}</h3>
              <div className="mt-2 text-xs text-ash">
                {s.uses} uses · earns {s.royaltyPerUse} 0G/use · by {s.creator}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-mono text-ember-bright">{s.price} 0G</span>
                <button
                  onClick={() => act("buy", s.id, { buyer: "you" })}
                  disabled={busy === s.id}
                  className="rounded-lg bg-gradient-to-r from-ember-bright to-ember px-4 py-1.5 text-xs font-medium text-void disabled:opacity-50"
                >
                  {busy === s.id ? "…" : "Buy"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* your skills */}
        <h2 className="mt-10 font-display text-xl text-parchment">Your skills</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {owned.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3 rounded-2xl glass p-10 text-center text-sm text-ash">
              You don&apos;t own any unlisted skills. Mint one on the dashboard.
            </div>
          )}
          {owned.map((s) => (
            <div key={s.id} className="rounded-2xl glass p-5">
              <div className={`text-[11px] font-mono uppercase ${RARITY_META[s.rarity].color}`}>
                {RARITY_META[s.rarity].label} · {s.category}
              </div>
              <h3 className="mt-1 font-display text-lg text-parchment">{s.name}</h3>
              <div className="mt-2 text-xs text-ash">
                {s.uses} uses · {s.earnings.toFixed(3)} 0G earned
              </div>
              <div className="mt-4 flex items-center gap-2">
                <input
                  value={price[s.id] ?? ""}
                  onChange={(e) => setPrice((p) => ({ ...p, [s.id]: e.target.value }))}
                  placeholder="price 0G"
                  inputMode="decimal"
                  className="w-24 rounded-lg border border-white/10 bg-void/60 px-2 py-1.5 text-xs text-parchment outline-none placeholder:text-ash/40 focus:border-arcane/60"
                />
                <button
                  onClick={() => act("list", s.id, { price: Number(price[s.id]) })}
                  disabled={busy === s.id || !(Number(price[s.id]) > 0)}
                  className="rounded-lg bg-gradient-to-r from-arcane to-arcane-deep px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                >
                  {busy === s.id ? "…" : "List for sale"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
