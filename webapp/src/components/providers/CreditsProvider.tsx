"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useGrimoireWallet } from "@/lib/wallet";
import { fetchCredits, type CreditState } from "@/lib/client";
import type { CreditEntry } from "@/lib/types";
import { taskCost, type TaskModeId } from "@/lib/credits";

type CreditsContextValue = {
  balance: number;
  ledger: CreditEntry[];
  treasury: string;
  loading: boolean;
  lastDebit: { amount: number; mode?: string } | null;
  taskMode: TaskModeId;
  setTaskMode: (mode: TaskModeId) => void;
  refresh: () => Promise<void>;
  setBalanceFromServer: (balance: number, ledger?: CreditEntry[]) => void;
  notifyDebit: (amount: number, mode?: string) => void;
  canAfford: (mode: TaskModeId) => boolean;
  costFor: (mode: TaskModeId) => number;
};

const CreditsContext = createContext<CreditsContextValue | null>(null);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useGrimoireWallet();
  const [state, setState] = useState<CreditState | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastDebit, setLastDebit] = useState<{ amount: number; mode?: string } | null>(null);
  const [taskMode, setTaskMode] = useState<TaskModeId>("ask");

  const refresh = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      setState(await fetchCredits(address));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) refresh();
    else setState(null);
  }, [isConnected, address, refresh]);

  const setBalanceFromServer = useCallback(
    (balance: number, ledger?: CreditEntry[]) => {
      setState((s) => ({
        balance,
        treasury: s?.treasury ?? "",
        signupBonus: s?.signupBonus ?? 0,
        ledger: ledger ?? s?.ledger ?? [],
      }));
    },
    []
  );

  const notifyDebit = useCallback((amount: number, mode?: string) => {
    setLastDebit({ amount, mode });
    setTimeout(() => setLastDebit(null), 3500);
  }, []);

  const balance = state?.balance ?? 0;

  return (
    <CreditsContext.Provider
      value={{
        balance,
        ledger: state?.ledger ?? [],
        treasury: state?.treasury ?? "",
        loading,
        lastDebit,
        taskMode,
        setTaskMode,
        refresh,
        setBalanceFromServer,
        notifyDebit,
        canAfford: (mode) => balance >= taskCost(mode),
        costFor: taskCost,
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const ctx = useContext(CreditsContext);
  if (!ctx) {
    throw new Error("useCredits must be used within CreditsProvider");
  }
  return ctx;
}

export function useCreditsOptional() {
  return useContext(CreditsContext);
}
