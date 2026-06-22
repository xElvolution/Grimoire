/**
 * Inference engine: always tries REAL 0G Compute (TEE) first.
 * If the wallet isn't funded yet / no provider is up, and simulation is allowed,
 * it falls back to a clearly-labeled simulated result (verified:false, simulated:true)
 * so the economy loop is demoable. The moment the wallet is funded, it goes live
 * automatically — no code change. Set GRIMOIRE_SIMULATE=0 to force real-only.
 */

import { runInference } from "./compute";

export type SolveResult = {
  answer: string;
  model: string;
  provider: string;
  verified: boolean;
  chatID?: string;
  simulated: boolean;
  note?: string;
};

const ALLOW_SIM = process.env.GRIMOIRE_SIMULATE !== "0";

export async function solve(prompt: string): Promise<SolveResult> {
  try {
    const r = await runInference(prompt);
    return { ...r };
  } catch (e) {
    if (!ALLOW_SIM) throw e;
    return simulate(prompt, (e as Error).message);
  }
}

function simulate(prompt: string, reason: string): SolveResult {
  const trimmed = prompt.trim().replace(/\s+/g, " ");
  const answer =
    `Approach: break the task into clear sub-steps, apply the relevant method, ` +
    `and return a structured result.\n\nFor "${trimmed.slice(0, 120)}${
      trimmed.length > 120 ? "…" : ""
    }", the method yields a concise, reusable solution that another agent can replay ` +
    `on similar inputs.`;
  return {
    answer,
    model: "grimoire-sim",
    provider: "simulated",
    verified: false,
    simulated: true,
    note: `Simulated — fund the wallet at faucet.0g.ai to run on 0G Compute (TEE). (${reason.slice(0, 80)})`,
  };
}
