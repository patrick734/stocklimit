/**
 * Sends the book keeper's collected filler fees (every listed token it holds) to SWEEP_TO.
 * Runs on GitHub Actions (.github/workflows/sweep-fees.yml, started by hand), where the keeper key lives.
 * ETH is left for gas.
 */
import { readFileSync } from "node:fs";
import { createPublicClient, createWalletClient, defineChain, http, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { erc20Abi } from "../src/abi.js";

const KEY = (process.env.KEEPER_PRIVATE_KEY || "") as `0x${string}`;
delete process.env.KEEPER_PRIVATE_KEY;
const TO = process.env.SWEEP_TO || "";
const RPC = process.env.RPC_URL || "https://rpc.mainnet.chain.robinhood.com";
if (!/^0x[0-9a-fA-F]{64}$/.test(KEY)) throw new Error("KEEPER_PRIVATE_KEY is not set");
if (!/^0x[0-9a-fA-F]{40}$/.test(TO)) throw new Error("SWEEP_TO must be a wallet address");

const chain = defineChain({ id: 4663, name: "Robinhood Chain", nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }, rpcUrls: { default: { http: [RPC] } } });
const client = createPublicClient({ chain, transport: http(RPC) });
const account = privateKeyToAccount(KEY);
const wallet = createWalletClient({ account, chain, transport: http(RPC) });
const list = JSON.parse(readFileSync(new URL("../../web/public/data/tokens.json", import.meta.url), "utf8")) as { tokens: { address: Address; symbol: string }[] };
const tokens = list.tokens.filter((t) => t.address !== "0x0000000000000000000000000000000000000000");
for (const t of tokens) {
  const bal = (await client.readContract({ address: t.address, abi: erc20Abi, functionName: "balanceOf", args: [account.address] })) as bigint;
  if (bal === 0n) continue;
  const hash = await wallet.writeContract({ address: t.address, abi: erc20Abi, functionName: "transfer", args: [TO as Address, bal] });
  await client.waitForTransactionReceipt({ hash });
  console.log(`sent ${bal} ${t.symbol} -> ${TO}  tx ${hash}`);
}
console.log(`done from ${account.address} (ETH is left for gas)`);
