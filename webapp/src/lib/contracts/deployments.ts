/** Canonical 0G Galileo contract addresses. */
export const DEPLOYMENTS = {
  network: "0g-galileo-testnet",
  chainId: 16602,
  explorer: "https://chainscan-galileo.0g.ai",
  contracts: {
    GrimToken: "0xFC25097421AbD4d422f895671cEfC033F5AAAA8E",
    SkillRegistry: "0xC98a9AA31AFb146878bc7E49Be70127Acd9779cf",
    AgentRegistry: "0xC6ff2332670391648A4605B5bC7A9b66aF162E41",
    RoyaltyVault: "0x19E42df6B7e16BefD245Ed32697044D6f09723f4",
    MemoryRegistry: "0xe44820a409c3522665f4AE515CDDF30C09a43a64",
    SkillMarketplace: "0x4e69d7566F434bD1D1a6d0eB9965D0062531467b",
  },
} as const;

export function explorerTx(hash: string): string {
  return `${DEPLOYMENTS.explorer}/tx/${hash}`;
}
