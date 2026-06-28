/** List every chat/inference provider currently live on 0G Compute. */
import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import { config } from "dotenv";
config({ path: ".env.local" });

const p = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
const w = new ethers.Wallet(process.env.PRIVATE_KEY, p);
const broker = await createZGComputeNetworkBroker(w);
const services = await broker.inference.listService();
console.log("Total services on 0G Compute:", services.length);
for (const s of services) {
  const a = Array.isArray(s)
    ? s
    : [s.provider, s.serviceType, s.url, "", "", "", s.model, "", "", "", s.verifiability];
  console.log(
    `  type=${a[1]} | model=${a[6]} | tee=${a[10] === true || a[10] === "TeeML"} | provider=${a[0]}`
  );
}
process.exit(0);
