/** 0G credit pricing - fund once, pay per task (v0-style). */

export type TaskModeId = "ask" | "build" | "code" | "summarize";

export const CREDIT_COST: Record<TaskModeId, number> = {
  ask: 0.001,
  build: 0.005,
  code: 0.003,
  summarize: 0.002,
};

export const SIGNUP_BONUS = 0;
export const MIN_FUND = 0.01;

export function taskCost(mode: TaskModeId): number {
  return CREDIT_COST[mode] ?? CREDIT_COST.ask;
}

export function formatCredits(n: number): string {
  return n.toFixed(4);
}
