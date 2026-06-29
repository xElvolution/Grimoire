import type { Rarity } from "./types";

const CATEGORIES: { key: string; words: string[]; glyph: string }[] = [
  { key: "Research", words: ["research", "find", "compare", "analyze", "summar"], glyph: "🜍" },
  { key: "Writing", words: ["write", "draft", "compose", "rewrite", "copy"], glyph: "🜔" },
  { key: "Code", words: ["code", "function", "bug", "refactor", "script", "api"], glyph: "🜨" },
  { key: "Finance", words: ["price", "trade", "portfolio", "yield", "defi", "token"], glyph: "🜚" },
  { key: "Strategy", words: ["plan", "strategy", "roadmap", "decide", "evaluate"], glyph: "🜛" },
];

export function categorize(prompt: string): { key: string; glyph: string } {
  const p = prompt.toLowerCase();
  for (const c of CATEGORIES) {
    if (c.words.some((w) => p.includes(w))) return { key: c.key, glyph: c.glyph };
  }
  return { key: "General", glyph: "✶" };
}

export function deriveName(prompt: string, category: string): string {
  const p = prompt.trim().replace(/\s+/g, " ");
  const verbs = ["Distill", "Forge", "Conjure", "Weave", "Decode", "Chart", "Render"];
  const seed = p.length % verbs.length;
  const subject = p
    .split(" ")
    .filter((w) => w.length > 3)
    .slice(0, 3)
    .join(" ");
  const base = subject || category;
  const name = `${verbs[seed]} ${base}`;
  return name.length > 42 ? name.slice(0, 42) + "…" : titleCase(name);
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function rarityFor(prompt: string, verified: boolean): Rarity {
  const score = Math.min(100, prompt.length / 2 + (verified ? 30 : 0));
  if (score > 80) return "legendary";
  if (score > 60) return "epic";
  if (score > 35) return "rare";
  return "common";
}

export const RARITY_META: Record<Rarity, { color: string; label: string }> = {
  common: { color: "text-ash", label: "Common" },
  rare: { color: "text-mana", label: "Rare" },
  epic: { color: "text-arcane-bright", label: "Epic" },
  legendary: { color: "text-ember-bright", label: "Legendary" },
};

export function royaltyForRarity(r: Rarity): number {
  return { common: 0.002, rare: 0.005, epic: 0.012, legendary: 0.03 }[r];
}

export function normalizeText(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function wordSimilarity(a: string, b: string): number {
  const wa = new Set(normalizeText(a).split(" ").filter((w) => w.length > 3));
  const wb = new Set(normalizeText(b).split(" ").filter((w) => w.length > 3));
  if (wa.size === 0 || wb.size === 0) return 0;
  let overlap = 0;
  wa.forEach((w) => {
    if (wb.has(w)) overlap++;
  });
  return overlap / Math.max(wa.size, wb.size);
}
