import { deployments } from "@/generated/vaults/deployments";

/** $LIMIT as plugged into the live vault deployment by set-token.sh (Robinhood Chain), if any. */
const deployedLimit = (deployments as Record<number, { limitToken?: string | null }>)[4663]?.limitToken ?? "";

/** Everything brand-specific lives here, so renaming the product is a one-file change. */
export const BRAND = {
  name: "Stocklimit",
  /** Short line under the name (footer, meta). */
  tagline: "Limit, stop-loss and take-profit orders for tokenized stocks on Robinhood Chain, filled across every pool.",
  domain: process.env.NEXT_PUBLIC_DOMAIN || "stocklimit.live",
  x: process.env.NEXT_PUBLIC_X_URL || "",
  telegram: "",
  /** The project token. Launched on Pons from the dev wallet; set-token.sh records it (and wins over the env var).
   *  Until an address is set, the site says it has not launched. */
  token: {
    symbol: process.env.NEXT_PUBLIC_TOKEN_SYMBOL || "LIMIT",
    address: (/^0x[0-9a-fA-F]{40}$/.test(deployedLimit)
      ? deployedLimit
      : /^0x[0-9a-fA-F]{40}$/.test((process.env.NEXT_PUBLIC_TOKEN_ADDRESS ?? "").trim())
        ? (process.env.NEXT_PUBLIC_TOKEN_ADDRESS ?? "").trim()
        : "") as `0x${string}` | "",
  },
};
