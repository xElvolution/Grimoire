import { runInference } from "./compute";

export type SolveResult = {
  answer: string;
  model: string;
  provider: string;
  verified: boolean;
  chatID?: string;
  simulated: false;
  note?: string;
};

export async function solve(prompt: string): Promise<SolveResult> {
  const r = await runInference(prompt);
  return { ...r, simulated: false };
}
