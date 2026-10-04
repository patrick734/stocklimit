import type { Address } from "viem";
import { FEEDS, STOP_MAX_AGE } from "@/generated/vaults/feeds";

/** Local test builds can point stop orders at their own feeds: NEXT_PUBLIC_FEEDS='{"0xtoken":"0xfeed"}'. */
const extra: Record<string, Address> = (() => {
  try {
    return JSON.parse(process.env.NEXT_PUBLIC_FEEDS || "{}");
  } catch {
    return {};
  }
})();

/** Chainlink USD feed for a Stock Token, if it has one. */
export function feedFor(token?: string): Address | undefined {
  if (!token) return undefined;
  const k = token.toLowerCase();
  return (Object.entries(extra).find(([a]) => a.toLowerCase() === k)?.[1] as Address | undefined) ?? FEEDS[k]?.feed;
}

export { STOP_MAX_AGE };

export const feedAbi = [
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
] as const;
