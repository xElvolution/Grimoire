/** Print the deployer wallet balance on 0G Galileo testnet. */
import { JsonRpcProvider, Wallet, formatEther } from "ethers";
import { config } from "dotenv";
config({ path: ".env.local" });

const provider = new JsonRpcProvider("https://evmrpc-testnet.0g.ai");
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
const b = parseFloat(formatEther(await provider.getBalance(wallet.address)));
console.log("address:", wallet.address);
console.log("balance:", b.toFixed(4), "0G");
console.log(
  b >= 1.4
    ? "ENOUGH for live compute (1.0 reserve + gas headroom)"
    : b >= 1.1
    ? "tight but may work (1.0 reserve, little gas headroom)"
    : "still under 1.1 — waiting on funding to land"
);
process.exit(0);
