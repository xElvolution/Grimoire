/**
 * Memory consolidation - episodic engrams distilled into semantic facts (sleep cycle).
 */

import type { Memory } from "./types";
import { solve } from "./zerog/engine";
import { uploadJSON } from "./zerog/storage";

export async function consolidateEpisodicMemory(
  episodic: Memory
): Promise<{ label: string; content: string; rootHash: string; txHash?: string }> {
  const prompt =
    `Distill this episodic agent memory into one concise semantic fact (no event context, just the knowledge):\n\n` +
    `Label: ${episodic.label}\n` +
    `Episode: ${episodic.content}\n\n` +
    `Reply with exactly two lines: first line is a short label, second line is the distilled fact.`;

  const result = await solve(prompt);
  const lines = result.answer.trim().split("\n").filter(Boolean);
  const label = lines[0]?.replace(/^label:\s*/i, "").slice(0, 80) || `Fact: ${episodic.label}`;
  const content = lines.slice(1).join(" ").replace(/^fact:\s*/i, "").slice(0, 500) || result.answer.slice(0, 500);

  const record = {
    kind: "grimoire-memory",
    memoryKind: "semantic",
    agentId: episodic.agentId,
    label,
    content,
    consolidatedFrom: episodic.id,
    createdAt: Date.now(),
  };

  let rootHash = "";
  let txHash: string | undefined;
  try {
    const up = await uploadJSON(record);
    rootHash = up.rootHash;
    txHash = up.txHash;
  } catch {
    rootHash =
      "0x" +
      Buffer.from(label + content + record.createdAt)
        .toString("hex")
        .padEnd(64, "0")
        .slice(0, 64);
  }

  return { label, content, rootHash, txHash };
}
