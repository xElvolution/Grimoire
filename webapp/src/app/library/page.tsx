"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Nav from "@/components/app/Nav";
import SkillCard from "@/components/app/SkillCard";
import { fetchState, runSkill, type GrimoireState } from "@/lib/client";

const CATEGORIES = ["All", "Research", "Writing", "Code", "Finance", "Strategy", "General"];
const RARITIES = ["All", "legendary", "epic", "rare", "common"];

export default function LibraryPage() {
  const [state, setState] = useState<GrimoireState | null>(null);
  const [castingId, setCastingId] = useState<string | null>(null);
  const [cat, setCat] = useState("All");
  const [rarity, setRarity] = useState("All");
  const [q, setQ] = useState("");

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
      const agent = state.agents[Math.floor(Math.random() * state.agents.length)];
      setCastingId(id);
      try {
        await runSkill(id, agent.id);
        await refresh();
      } catch {
        /* ignore */
      } finally {
        setCastingId(null);
      }
    },
    [state, refresh]
  );

  const skills = useMemo(() => {
    let s = state?.skills ?? [];
    if (cat !== "All") s = s.filter((k) => k.category === cat);
    if (rarity !== "All") s = s.filter((k) => k.rarity === rarity);
    if (q.trim()) {
      const t = q.toLowerCase();
      s = s.filter(
        (k) =>
          k.name.toLowerCase().includes(t) ||
          k.description.toLowerCase().includes(t) ||
          k.promptTemplate.toLowerCase().includes(t)
      );
    }
    return s;
  }, [state, cat, rarity, q]);

  return (
    <div className="min-h-screen bg-runic-grid">
      <Nav />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-parchment">The Grimoire</h1>
            <p className="mt-1 text-sm text-ash">
              Every skill in the network. Cast one to pay its creator — verified on 0G.
            </p>
          </div>
          <div className="flex items-center gap-5 text-right">
            <div>
              <div className="font-display text-2xl text-parchment">
                {state?.skills.length ?? 0}
              </div>
              <div className="text-[11px] text-ash">skills</div>
            </div>
            <div>
              <div className="font-display text-2xl text-ember-bright">
                {(state?.stats.totalEarnings ?? 0).toFixed(3)}
              </div>
              <div className="text-[11px] text-ash">0G in royalties</div>
            </div>
          </div>
        </div>

        {/* filters */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search skills…"
            className="flex-1 min-w-[12rem] rounded-lg border border-white/10 bg-void/60 px-4 py-2 text-sm text-parchment outline-none placeholder:text-ash/40 focus:border-arcane/60"
          />
          <Select label="Category" value={cat} onChange={setCat} options={CATEGORIES} />
          <Select label="Rarity" value={rarity} onChange={setRarity} options={RARITIES} />
        </div>

        {/* grid */}
        <motion.div layout className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3 rounded-2xl glass p-12 text-center text-sm text-ash">
              No skills match. Post a task on the dashboard to mint one.
            </div>
          )}
          {skills.map((s) => (
            <SkillCard key={s.id} skill={s} onCast={onCast} casting={castingId === s.id} />
          ))}
        </motion.div>
      </main>
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
