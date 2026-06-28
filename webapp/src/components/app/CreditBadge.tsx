"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "@/components/ui/Modal";
import { useGrimoireWallet } from "@/lib/wallet";
import { useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { fundCredits } from "@/lib/client";
import { formatCredits, MIN_FUND, type TaskModeId } from "@/lib/credits";
import { DEPLOYMENTS } from "@/lib/contracts/deployments";
import { CREDIT_TREASURY } from "@/lib/chain";
import { useCredits } from "@/components/providers/CreditsProvider";

export default function CreditBadge({ mode }: { mode?: TaskModeId }) {
  const { address, isConnected } = useGrimoireWallet();
  const { wallets } = useWallets();
  const {
    balance,
    ledger,
    lastDebit,
    refresh,
    setBalanceFromServer,
    costFor,
    taskMode,
  } = useCredits();
  const activeMode = mode ?? taskMode;
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("0.1");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onFund() {
    if (!address || busy) return;
    const n = Number(amount);
    if (!(n >= MIN_FUND)) {
      setErr(`Minimum ${MIN_FUND} 0G`);
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const wallet = wallets[0];
      if (wallet?.getEthereumProvider) {
        const provider = await wallet.getEthereumProvider();
        const ethersProvider = new ethers.BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();
        const tx = await signer.sendTransaction({
          to: CREDIT_TREASURY,
          value: ethers.parseEther(n.toFixed(6)),
        });
        await tx.wait(1);
        const res = await fundCredits(address, n, tx.hash);
        setBalanceFromServer(res.balance, res.ledger);
      } else {
        const res = await fundCredits(address, n);
        setBalanceFromServer(res.balance, res.ledger);
      }
      setOpen(false);
      await refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!isConnected || !address) return null;

  const cost = costFor(activeMode);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-9 inline-flex items-center gap-2 rounded-lg glass px-3 hover:bg-white/[0.04] transition relative"
      >
        <motion.span
          key={balance}
          initial={{ opacity: 0.5, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-sm text-mana"
        >
          {formatCredits(balance)}
        </motion.span>
        <span className="text-[10px] text-ash uppercase tracking-wide">0G balance</span>
        <AnimatePresence>
          {lastDebit && (
            <motion.span
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -18 }}
              exit={{ opacity: 0 }}
              className="absolute -top-1 right-2 text-[10px] font-mono text-blood whitespace-nowrap"
            >
              −{formatCredits(lastDebit.amount)}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} className="w-full max-w-lg">
            <div className="p-6">
              <h2 className="font-display text-xl text-parchment">Your 0G balance</h2>
              <p className="mt-1 text-sm text-ash">
                Fund here, pay per task. This is your app balance - not wallet gas.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
                  <div className="text-[11px] text-ash">Available</div>
                  <div className="font-mono text-2xl text-mana">{formatCredits(balance)} 0G</div>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
                  <div className="text-[11px] text-ash">Next task ({activeMode})</div>
                  <div className="font-mono text-2xl text-parchment">{formatCredits(cost)} 0G</div>
                </div>
              </div>

              <label className="mt-4 block text-xs text-ash">
                Add balance - sends 0G from your wallet to treasury
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-void/60 px-3 py-2 text-sm text-parchment outline-none focus:border-arcane/50"
                />
              </label>
              {err && <p className="mt-2 text-xs text-blood">{err}</p>}

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={onFund}
                  disabled={busy}
                  className="flex-1 rounded-xl bg-gradient-to-r from-arcane to-arcane-deep py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {busy ? "Confirming…" : "Fund with 0G"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-ash"
                >
                  Close
                </button>
              </div>

              <h3 className="mt-6 text-sm font-medium text-parchment">Usage history</h3>
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                {ledger.length === 0 && (
                  <p className="text-xs text-ash py-4 text-center">No activity yet. Fund to start.</p>
                )}
                {ledger.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2 text-[11px]"
                  >
                    <div>
                      <span className={e.type === "debit" ? "text-blood" : "text-emerald"}>
                        {e.type === "debit" ? "−" : "+"}
                        {formatCredits(e.amount)} 0G
                      </span>
                      <span className="text-ash ml-2">{e.note ?? e.mode ?? e.type}</span>
                    </div>
                    <span className="text-ash font-mono">{formatCredits(e.balanceAfter)}</span>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-[10px] text-ash/70">
                {DEPLOYMENTS.network} · treasury {CREDIT_TREASURY.slice(0, 10)}…
              </p>
            </div>
      </Modal>
    </>
  );
}
