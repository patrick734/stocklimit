// ABIs come from the Hardhat build output in vaults/artifacts (run `npx hardhat compile` in
// vaults/ first). This keeps the keeper in lockstep with the Solidity source, and covers
// VaultPositionV4 and V4SwapAdapter, which app/src/generated/abis.ts does not export.
// Override the location with KEEPER_ARTIFACTS_DIR (the directory containing `src/`).
const fs = require("fs");
const path = require("path");
const { CONTRACTS } = require("./config");

const DIR = process.env.KEEPER_ARTIFACTS_DIR || path.join(CONTRACTS, "artifacts");

const FILES = {
  Vault: "src/VaultStocklimit.sol/VaultStocklimit.json",
  VaultOracle: "src/OracleStocklimit.sol/OracleStocklimit.json",
  FeeRouter: "src/FeeRouterStocklimit.sol/FeeRouterStocklimit.json",
  BuyBurn: "src/BuyBurnStocklimit.sol/BuyBurnStocklimit.json",
  BorrowDesk: "src/BorrowDeskStocklimit.sol/BorrowDeskStocklimit.json",
  VaultPositionV4: "src/v4/PositionStocklimit.sol/PositionStocklimit.json",
  V4SwapAdapter: "src/v4/SwapAdapterStocklimit.sol/SwapAdapterStocklimit.json",
};

// Standard ERC-20 surface; no need for an artifact.
const ERC20 = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

function load(name) {
  const file = path.join(DIR, FILES[name]);
  if (!fs.existsSync(file)) {
    throw new Error(`Missing ABI artifact ${file}. Run \`npx hardhat compile\` in vaults/ first.`);
  }
  return JSON.parse(fs.readFileSync(file, "utf8")).abi;
}

const abis = Object.fromEntries(Object.keys(FILES).map((n) => [n, load(n)]));
abis.ERC20 = ERC20;

module.exports = abis;
