#!/usr/bin/env node

import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import GrimoireClient, { GrimoireError, type Skill, type TaskResult } from "grimoire-sdk";

const colors = {
  dim: "\x1b[2m",
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  violet: "\x1b[35m",
};

const baseUrl = process.env.GRIMOIRE_URL || "https://app.heygrimoire.xyz";
const client = new GrimoireClient({ baseUrl });
let sessionWallet = process.env.GRIMOIRE_WALLET || "";

function option(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function promptText(start = 3): string {
  const values = process.argv.slice(start).filter((value) => !value.startsWith("--"));
  return values.join(" ").trim();
}

function line(label: string, value: string | number | undefined) {
  if (value === undefined || value === "") return;
  console.log(`${colors.dim}${label.padEnd(14)}${colors.reset}${value}`);
}

function help() {
  console.log(`
${colors.violet}Grimoire${colors.reset}

Usage
  grimoire                         start interactive mode
  grimoire ask "prompt" --wallet 0x...
  grimoire task "prompt" --wallet 0x...
  grimoire skills
  grimoire credits --wallet 0x...
  grimoire fund <amount> --wallet 0x...
  grimoire brain
  grimoire memory "note" --agent agent-id

Interactive
  /help        show commands
  /wallet      set or show wallet
  /skills      list skills
  /credits     show credits
  /brain       show network brain stats
  /url         show active API URL
  /clear       clear screen
  /exit        quit

Env
  GRIMOIRE_URL     default ${baseUrl}
  GRIMOIRE_WALLET  optional default wallet
`);
}

function printTask(result: TaskResult) {
  console.log("");
  console.log(`${colors.green}Answer${colors.reset}`);
  console.log(result.quest.answer ?? "No answer returned.");
  console.log("");
  line("Verified", result.quest.verified ? "yes" : "pending");
  line("Mode", result.quest.mode);
  line("Credits left", result.credits);
  line("On-chain", result.onchain?.url ?? result.onchain?.txHash);

  if (result.skill) {
    console.log("");
    console.log(`${colors.violet}Skill minted${colors.reset}`);
    line("Name", result.skill.name);
    line("Rarity", result.skill.rarity);
    line("Royalty", `${result.skill.royaltyPerUse} 0G/use`);
    line("Storage root", result.skill.id);
  } else {
    console.log("");
    console.log(`${colors.yellow}No skill minted${colors.reset}`);
    console.log("The answer was returned, but it was not reusable enough to become a skill.");
  }
}

async function runTask(prompt: string, wallet: string, agentId = "auto") {
  if (!prompt) throw new GrimoireError("Prompt required.");
  if (!wallet) throw new GrimoireError("Wallet required. Pass --wallet 0x... or set /wallet.");
  const result = await client.createTask(prompt, { creatorAddress: wallet, agentId });
  printTask(result);
}

async function listSkills() {
  const skills = await client.listSkills();
  if (!skills.length) {
    console.log("No skills yet. Post a task to mint one.");
    return;
  }

  for (const skill of skills.slice(0, 20)) {
    printSkill(skill);
  }
}

function printSkill(skill: Skill) {
  console.log("");
  console.log(`${colors.violet}${skill.name}${colors.reset}`);
  line("Rarity", skill.rarity);
  line("Uses", skill.uses);
  line("Royalty", `${skill.royaltyPerUse} 0G/use`);
  line("Creator", skill.creatorAddress ?? skill.creator);
  line("Root", skill.id);
}

async function showCredits(wallet: string) {
  if (!wallet) throw new GrimoireError("Wallet required. Pass --wallet 0x... or set /wallet.");
  const credits = await client.getCredits(wallet);
  line("Wallet", wallet);
  line("Balance", `${credits.balance} 0G`);
  line("Treasury", credits.treasury);
}

async function showBrain() {
  const brain = await client.getBrain() as { stats?: Record<string, number> };
  console.log(JSON.stringify(brain.stats ?? brain, null, 2));
}

async function writeMemory(content: string, agentId: string) {
  if (!content) throw new GrimoireError("Memory content required.");
  if (!agentId) throw new GrimoireError("Agent required. Pass --agent agent-id.");
  const result = await client.writeMemory(agentId, "CLI memory", content, "note");
  console.log(JSON.stringify(result, null, 2));
}

async function interactive() {
  help();
  const rl = createInterface({ input, output });

  while (true) {
    const value = (await rl.question(`${colors.cyan}grimoire>${colors.reset} `)).trim();
    if (!value) continue;

    try {
      if (value === "/exit" || value === "exit" || value === "quit") break;
      if (value === "/help") help();
      else if (value === "/clear") console.clear();
      else if (value === "/url") console.log(baseUrl);
      else if (value.startsWith("/wallet")) {
        const next = value.replace("/wallet", "").trim();
        if (next) sessionWallet = next;
        console.log(sessionWallet || "No wallet set.");
      } else if (value === "/skills") {
        await listSkills();
      } else if (value === "/credits") {
        await showCredits(sessionWallet);
      } else if (value === "/brain") {
        await showBrain();
      } else {
        await runTask(value, sessionWallet);
      }
    } catch (error) {
      console.error(`${colors.red}${(error as Error).message}${colors.reset}`);
    }
  }

  rl.close();
}

async function main() {
  const command = process.argv[2];

  if (!command) return interactive();
  if (command === "help" || command === "--help" || command === "-h") return help();
  if (command === "ask" || command === "task") {
    return runTask(promptText(), option("--wallet") || sessionWallet, option("--agent") || "auto");
  }
  if (command === "skills") return listSkills();
  if (command === "credits") return showCredits(option("--wallet") || sessionWallet);
  if (command === "fund") {
    const amount = Number(process.argv[3]);
    const wallet = option("--wallet") || sessionWallet;
    if (!wallet || !(amount > 0)) throw new GrimoireError("Usage: grimoire fund <amount> --wallet 0x...");
    const credits = await client.fundCredits(wallet, amount) as { balance: number };
    line("Balance", `${credits.balance} 0G`);
    return;
  }
  if (command === "brain") return showBrain();
  if (command === "memory") return writeMemory(promptText(), option("--agent") || "");

  throw new GrimoireError(`Unknown command: ${command}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`${colors.red}${message}${colors.reset}`);
  process.exit(1);
});
