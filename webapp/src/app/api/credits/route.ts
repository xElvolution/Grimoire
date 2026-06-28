import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { db } from "@/lib/store";
import { SIGNUP_BONUS, MIN_FUND } from "@/lib/credits";
import { ZEROG } from "@/lib/zerog/config";
import { CREDIT_TREASURY } from "@/lib/chain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseAddress(raw: string | null | undefined): string | undefined {
  if (!raw || !/^0x[a-fA-F0-9]{40}$/.test(raw)) return undefined;
  return raw;
}

export async function GET(req: NextRequest) {
  const address = parseAddress(req.nextUrl.searchParams.get("address"));
  if (!address) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }
  db.ensureCredits(address, SIGNUP_BONUS);
  return NextResponse.json({
    balance: db.getCredits(address),
    treasury: CREDIT_TREASURY,
    signupBonus: SIGNUP_BONUS,
    ledger: db.creditLedgerForAddress(address),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const address = parseAddress(body.address);
  const amount = Number(body.amount);
  const txHash = typeof body.txHash === "string" ? body.txHash : undefined;

  if (!address) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }
  if (!(amount >= MIN_FUND)) {
    return NextResponse.json({ error: `Minimum fund is ${MIN_FUND} 0G` }, { status: 400 });
  }

  if (txHash) {
    try {
      const provider = new ethers.JsonRpcProvider(ZEROG.rpcUrl);
      const tx = await provider.getTransaction(txHash);
      if (!tx) {
        return NextResponse.json({ error: "Transaction not found" }, { status: 400 });
      }
      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt || receipt.status !== 1) {
        return NextResponse.json({ error: "Transaction failed" }, { status: 400 });
      }
      if (tx.to?.toLowerCase() !== CREDIT_TREASURY.toLowerCase()) {
        return NextResponse.json({ error: "Send 0G to the treasury address" }, { status: 400 });
      }
      if (tx.from?.toLowerCase() !== address.toLowerCase()) {
        return NextResponse.json({ error: "Transaction sender mismatch" }, { status: 400 });
      }
      const sent = Number(ethers.formatEther(tx.value));
      if (sent < amount * 0.99) {
        return NextResponse.json({ error: "Transaction value too low" }, { status: 400 });
      }
      db.ensureCredits(address, SIGNUP_BONUS);
      const balance = db.addCredits(address, sent, {
        txHash,
        note: `Deposited ${sent.toFixed(4)} 0G`,
      });
      return NextResponse.json({
        balance,
        credited: sent,
        txHash,
        ledger: db.creditLedgerForAddress(address),
      });
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
  }

  if (process.env.GRIMOIRE_DEV_FUND === "1") {
    db.ensureCredits(address, SIGNUP_BONUS);
    const balance = db.addCredits(address, amount, { note: "Dev fund" });
    return NextResponse.json({
      balance,
      credited: amount,
      dev: true,
      ledger: db.creditLedgerForAddress(address),
    });
  }

  return NextResponse.json(
    { error: "Send 0G to the treasury, then fund with the transaction hash." },
    { status: 400 }
  );
}
