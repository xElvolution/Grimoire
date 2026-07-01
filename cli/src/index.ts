#!/usr/bin/env node

import GrimoireClient from "@grimoire/sdk";

const baseUrl = process.env.GRIMOIRE_URL || "https://heygrimoire.xyz";
const client = new GrimoireClient({ baseUrl });

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const cmd = process.argv[2];

  if (!cmd || cmd === "help" || cmd === "--help") {
    console.log(`
Grimoire CLI

  grimoire task <prompt> [--agent auto] [--wallet 0x...]
  grimoire credits --wallet 0x...
  grimoire fund <amount> --wallet 0x...
  grimoire skills
  grimoire brain

Env: GRIMOIRE_URL (default https://heygrimoire.xyz)
Fund app credits before posting tasks.
`);
    return;
  }

  if (cmd === "task") {
    const prompt = process.argv[3];
    if (!prompt) {
      console.error("Usage: grimoire task <prompt> --wallet 0x...");
      process.exit(1);
    }
    const agentId = arg("--agent") || "auto";
    const wallet = arg("--wallet");
    if (!wallet) {
      console.error("--wallet 0x... required");
      process.exit(1);
    }
    const res = await client.createTask(prompt, {
      agentId,
      creatorAddress: wallet,
    });
    console.log(JSON.stringify(res, null, 2));
    return;
  }

  if (cmd === "credits") {
    const wallet = arg("--wallet");
    if (!wallet) {
      console.error("--wallet required");
      process.exit(1);
    }
    const c = await client.getCredits(wallet);
    console.log(`Balance: ${c.balance} 0G`);
    return;
  }

  if (cmd === "fund") {
    const amount = Number(process.argv[3]);
    const wallet = arg("--wallet");
    if (!wallet || !(amount > 0)) {
      console.error("Usage: grimoire fund <amount> --wallet 0x...");
      process.exit(1);
    }
    const c = await client.fundCredits(wallet, amount) as { balance: number };
    console.log(`Credited. Balance: ${c.balance} 0G`);
    return;
  }

  if (cmd === "skills") {
    const skills = await client.listSkills();
    if (!skills.length) {
      console.log("No skills yet. Post a task to mint one.");
      return;
    }
    for (const s of skills.slice(0, 20)) {
      console.log(
        `${s.name} · ${s.uses} uses · ${s.royaltyPerUse} 0G/use · ${s.id.slice(0, 12)}…`
      );
    }
    return;
  }

  if (cmd === "brain") {
    const b = await client.getBrain() as { stats?: Record<string, number> };
    console.log(JSON.stringify(b.stats ?? b, null, 2));
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  process.exit(1);
}

main().catch((e) => {
  console.error((e as Error).message);
  process.exit(1);
});
