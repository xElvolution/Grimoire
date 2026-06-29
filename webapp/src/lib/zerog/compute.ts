import { ethers } from "ethers";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - the broker ships loose types
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import { ZEROG, getPrivateKey } from "./config";

const LEDGER_FUND = Number(process.env.ZG_LEDGER_FUND || 1.2);
const PROVIDER_RESERVE = process.env.ZG_PROVIDER_RESERVE || "1.0";

export type InferenceResult = {
  answer: string;
  model: string;
  provider: string;
  verified: boolean;
  chatID?: string;
  simulated: false;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Broker = any;

let brokerPromise: Promise<Broker> | null = null;
let chosenProvider: { address: string; teeVerified: boolean } | null = null;
let deposited = false;
const fundedProviders = new Set<string>();
const ackedProviders = new Set<string>();

function getBroker(): Promise<Broker> {
  if (!brokerPromise) {
    const provider = new ethers.JsonRpcProvider(ZEROG.rpcUrl);
    const wallet = new ethers.Wallet(getPrivateKey(), provider);
    brokerPromise = createZGComputeNetworkBroker(wallet as unknown as never);
  }
  return brokerPromise;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function readService(s: any) {
  if (Array.isArray(s)) {
    return {
      address: s[0] as string,
      type: s[1] as string,
      url: s[2] as string,
      model: s[6] as string,
      teeVerified: s[10] === true,
    };
  }
  return {
    address: (s.provider ?? s.providerAddress ?? s.address) as string,
    type: (s.serviceType ?? s.type) as string,
    url: (s.url ?? s.endpoint) as string,
    model: (s.model ?? "") as string,
    teeVerified:
      s.teeVerified === true ||
      s.verifiability === "TeeML" ||
      s.verifiability === true,
  };
}

async function ensureDeposit(broker: Broker) {
  if (deposited) return;
  try {
    const ledger = await broker.ledger.getLedger().catch(() => null);
    if (!ledger) {
      await broker.ledger.addLedger(LEDGER_FUND);
    } else {
      const available = BigInt(ledger[2] ?? 0);
      if (available < ethers.parseEther("1.0")) {
        await broker.ledger.depositFund(LEDGER_FUND);
      }
    }
    deposited = true;
  } catch (e) {
    throw new Error(
      `Could not fund the 0G Compute ledger - is the wallet funded? (${(e as Error).message})`
    );
  }
}

async function pickProvider(broker: Broker) {
  if (chosenProvider) return chosenProvider;
  const services = (await broker.inference.listService()).map(readService);
  const chat = services.filter(
    (s: ReturnType<typeof readService>) =>
      s.type === "chatbot" || s.type === "chat"
  );
  if (chat.length === 0) throw new Error("No 0G Compute chat providers available right now");
  const tee = chat.find((s: ReturnType<typeof readService>) => s.teeVerified);
  const sel = tee ?? chat[0];
  chosenProvider = { address: sel.address, teeVerified: sel.teeVerified };
  return chosenProvider;
}

async function ensureProviderReady(broker: Broker, provider: string) {
  if (!fundedProviders.has(provider)) {
    try {
      await broker.ledger.transferFund(
        provider,
        "inference",
        ethers.parseEther(PROVIDER_RESERVE)
      );
    } catch {
      /* already funded / sub-account exists */
    }
    fundedProviders.add(provider);
  }
  if (!ackedProviders.has(provider)) {
    try {
      await broker.inference.acknowledgeProviderSigner(provider);
    } catch {
      /* already acknowledged */
    }
    ackedProviders.add(provider);
  }
}

export async function runInference(prompt: string): Promise<InferenceResult> {
  const broker = await getBroker();
  await ensureDeposit(broker);

  const { address: provider, teeVerified } = await pickProvider(broker);
  await ensureProviderReady(broker, provider);

  const { endpoint, model } = await broker.inference.getServiceMetadata(provider);
  const headers = await broker.inference.getRequestHeaders(provider);

  const body = {
    messages: [
      {
        role: "system",
        content:
          "You are Grimoire, an AI agent that executes tasks directly - research, code, websites, summaries. " +
          "Never say you cannot build websites, apps, or code. Never suggest Wix, Squarespace, or external tools instead of doing the work. " +
          "If a build request needs more detail, ask 2-3 friendly clarifying questions with concrete suggestions. " +
          "Be helpful, direct, and capable.",
      },
      { role: "user", content: prompt },
    ],
    model,
  };
  const res = await fetch(`${endpoint}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`0G Compute request failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  const answer: string = data?.choices?.[0]?.message?.content ?? "";
  const chatID: string | undefined =
    res.headers.get("ZG-Res-Key") ||
    res.headers.get("zg-res-key") ||
    data?.id;

  let verified = teeVerified;
  try {
    const ok = await broker.inference.processResponse(
      provider,
      chatID,
      JSON.stringify(data?.usage ?? {})
    );
    verified = teeVerified && ok !== false;
  } catch {
    verified = false;
  }

  return { answer, model, provider, verified, chatID, simulated: false };
}
