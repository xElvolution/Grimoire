#!/usr/bin/env bash
# Source-verify all deployed Grimoire contracts on the 0G Galileo explorer.
set -uo pipefail

VER_URL="https://chainscan-galileo.0g.ai/open/api"
CHAIN=16602
OPT=200
COMPILER="0.8.24"

verify() {
  local addr="$1" target="$2" args="${3:-}"
  echo "── Verifying $target @ $addr"
  forge verify-contract \
    --chain-id "$CHAIN" \
    --num-of-optimizations "$OPT" \
    --verifier custom \
    --verifier-api-key "PLACEHOLDER" \
    --compiler-version "$COMPILER" \
    --verifier-url "$VER_URL" \
    --watch \
    $args \
    "$addr" "$target" 2>&1 | tail -8
  echo ""
}

verify 0xC98a9AA31AFb146878bc7E49Be70127Acd9779cf src/SkillRegistry.sol:SkillRegistry
verify 0xC6ff2332670391648A4605B5bC7A9b66aF162E41 src/AgentRegistry.sol:AgentRegistry
verify 0x19E42df6B7e16BefD245Ed32697044D6f09723f4 src/RoyaltyVault.sol:RoyaltyVault
verify 0xe44820a409c3522665f4AE515CDDF30C09a43a64 src/MemoryRegistry.sol:MemoryRegistry
verify 0x4e69d7566F434bD1D1a6d0eB9965D0062531467b src/SkillMarketplace.sol:SkillMarketplace
# GrimToken has a constructor: constructor(uint256 initialSupply) = 1_000_000e18
GRIM_ARGS="--constructor-args $(cast abi-encode 'constructor(uint256)' 1000000000000000000000000)"
verify 0xFC25097421AbD4d422f895671cEfC033F5AAAA8E src/GrimToken.sol:GrimToken "$GRIM_ARGS"
