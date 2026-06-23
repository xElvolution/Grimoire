/**
 * Deploy + on-chain test all Grimoire contracts on 0G Galileo testnet.
 * Run from webapp/ (has ethers). Reads compiled artifacts from ../contracts/out.
 *   node scripts/deploy-contracts.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { JsonRpcProvider, Wallet, ContractFactory, Contract, parseEther, formatEther, hexlify, randomBytes } from "ethers";
import { config } from "dotenv";
config({ path: ".env.local" });

const RPC = "https://evmrpc-testnet.0g.ai";
const EXPLORER = "https://chainscan-galileo.0g.ai";
const OUT = "../contracts/out";

const provider = new JsonRpcProvider(RPC);
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);

function artifact(file, name) {
  const j = JSON.parse(readFileSync(`${OUT}/${file}/${name}.json`, "utf8"));
  return { abi: j.abi, bytecode: j.bytecode.object };
}
async function deploy(file, name, args = []) {
  const { abi, bytecode } = artifact(file, name);
  const f = new ContractFactory(abi, bytecode, wallet);
  const c = await f.deploy(...args);
  await c.waitForDeployment();
  const addr = await c.getAddress();
  console.log(`  ✓ ${name.padEnd(16)} ${addr}`);
  return new Contract(addr, abi, wallet);
}
const bytes32 = () => hexlify(randomBytes(32));
const log = (m) => console.log(m);

const bal0 = await provider.getBalance(wallet.address);
log(`deployer: ${wallet.address}  (${formatEther(bal0)} 0G)\n`);
log("Deploying contracts to 0G Galileo testnet…");

const deployed = {};
const grim = await deploy("GrimToken.sol", "GrimToken", [parseEther("1000000")]);
deployed.GrimToken = await grim.getAddress();
const skills = await deploy("SkillRegistry.sol", "SkillRegistry");
deployed.SkillRegistry = await skills.getAddress();
const agents = await deploy("AgentRegistry.sol", "AgentRegistry");
deployed.AgentRegistry = await agents.getAddress();
const vault = await deploy("RoyaltyVault.sol", "RoyaltyVault");
deployed.RoyaltyVault = await vault.getAddress();
const mem = await deploy("MemoryRegistry.sol", "MemoryRegistry");
deployed.MemoryRegistry = await mem.getAddress();
const market = await deploy("SkillMarketplace.sol", "SkillMarketplace");
deployed.SkillMarketplace = await market.getAddress();

log("\nRunning on-chain tests…");

// GrimToken
log(`  GrimToken.totalSupply = ${formatEther(await grim.totalSupply())} GRIM`);
const tx1 = await grim.transfer("0x000000000000000000000000000000000000dEaD", parseEther("123"));
await tx1.wait();
log(`  GrimToken.transfer(123) ✓  balance(dead)=${formatEther(await grim.balanceOf("0x000000000000000000000000000000000000dEaD"))}`);

// SkillRegistry: register + use (royalty) + read
const root = bytes32();
await (await skills.registerSkill(root, parseEther("0.0005"))).wait();
await (await skills.useSkill(root, { value: parseEther("0.0005") })).wait();
const s = await skills.getSkill(root);
log(`  SkillRegistry.useSkill ✓  uses=${s[2]}  earnings=${formatEther(s[3])} 0G`);

// AgentRegistry: mint genesis + spawn child
await (await agents.mintAgent(bytes32(), "Research", 0)).wait();
await (await agents.mintAgent(bytes32(), "Finance", 1)).wait();
const a = await agents.getAgent(2);
log(`  AgentRegistry.mintAgent ✓  agent#2 specialty=${a[2]} spawnedBy=#${a[4]}  nextId=${await agents.nextId()}`);

// RoyaltyVault: deposit + owed
await (await vault.deposit(wallet.address, { value: parseEther("0.0005") })).wait();
log(`  RoyaltyVault.deposit ✓  owed=${formatEther(await vault.owed(wallet.address))} 0G`);

// MemoryRegistry: store + grant + revoke
const mroot = bytes32();
await (await mem.store(mroot, "user prefs")).wait();
const grantee = "0x000000000000000000000000000000000000bEEF";
await (await mem.grant(1, grantee)).wait();
const canAfterGrant = await mem.canRead(1, grantee);
await (await mem.revoke(1, grantee)).wait();
const canAfterRevoke = await mem.canRead(1, grantee);
log(`  MemoryRegistry grant→${canAfterGrant} revoke→${canAfterRevoke} ✓ (revoke = forget)`);

// SkillMarketplace: claim + list + read
const skU = bytes32();
await (await market.claim(skU)).wait();
await (await market.list(skU, parseEther("0.01"))).wait();
const listing = await market.listings(skU);
log(`  SkillMarketplace.list ✓  price=${formatEther(listing[1])} 0G active=${listing[2]}`);

// persist deployments
const record = { network: "0g-galileo-testnet", chainId: 16602, deployer: wallet.address, deployedAt: new Date().toISOString(), explorer: EXPLORER, contracts: deployed };
writeFileSync("../contracts/deployments.json", JSON.stringify(record, null, 2));

const bal1 = await provider.getBalance(wallet.address);
log(`\nGas spent: ${formatEther(bal0 - bal1)} 0G   (remaining ${formatEther(bal1)} 0G)`);
log("\nDeployed addresses:");
for (const [k, v] of Object.entries(deployed)) log(`  ${k.padEnd(16)} ${EXPLORER}/address/${v}`);
log("\nSaved → contracts/deployments.json");
process.exit(0);
