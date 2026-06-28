"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Nav from "@/components/app/Nav";
import SkillCard from "@/components/app/SkillCard";
import { fetchState, type GrimoireState } from "@/lib/client";
import { useGrimoireWallet } from "@/lib/wallet";

const CATEGORIES = ["All", "Research", "Writing", "Code", "Finance", "Strategy", "General"];
const RARITIES = ["All", "legendary", "epic", "rare", "common"];

export default function LibraryPage() {
  const { address, isConnected } = useGrimoireWallet();
  const [state, setState] = useState<GrimoireState | null>(null);
  const [cat, setCat] = useState("All");
  const [rarity, setRarity] = useState("All");
  const [q, setQ] = useState("");

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

  const skills = useMemo(() => {
    let s = state?.network?.skills ?? state?.skills ?? [];
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
            <p className="mt-1 text-sm text-ash max-w-xl">
              Every skill on the network. Skills run automatically when someone posts a
              matching task - creators earn royalties on use.
            </p>
          </div>
          <Link
            href="/task"
            className="rounded-xl bg-gradient-to-r from-ember-bright to-ember px-4 py-2 text-sm font-medium text-void"
          >
            Post a task →
          </Link>
        </div>

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

        <motion.div layout className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3 rounded-2xl glass p-12 text-center text-sm text-ash">
              No skills match.{" "}
              <Link href="/task" className="text-mana hover:underline">Post a task</Link> to mint one.
            </div>
          )}
          {skills.map((s) => (
            <SkillCard
              key={s.id}
              skill={s}
              viewerAddress={isConnected ? address : null}
            />
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
