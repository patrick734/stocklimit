# Stocklimit

Limit, take-profit, stop-loss and bracket orders for Robinhood Stock Tokens on Robinhood Chain, plus Vaults that
earn trading fees and a Borrow Desk. Every contract carries the Stocklimit name.

- **BookStocklimit**: deposit, set your exits, and the order fills itself in one transaction through
  **RouterStocklimit**, split across the Uniswap v3 and v4 pools that pay most. Stops trigger on Chainlink's price
  (not a single pool) with a slippage floor; brackets combine a take-profit and a stop; partial fills are optional.
  Cancel any time; whatever is left is refunded at expiry. No owner, no admin, no pause, no upgrades.
- **Vaults** (VaultStocklimit and friends, based on Stonkwell, MIT): deposit USDG, earn one stock's trading fees.
  70% compounds for holders, 30% buys back and burns $LIMIT. Settings changes wait 48h in TimelockStocklimit.

```
contracts/  Foundry: BookStocklimit, RouterStocklimit, QuoterStocklimit + tests
vaults/     Hardhat: the vault protocol (*Stocklimit contracts) + deploy/verify/governance scripts
engine/     routing engine + the book keeper (scripts/keeper.ts)
keeper/     the vault keeper
web/        Next.js app (static export): orders, markets, Vaults, Borrow, Portfolio
tools/      wallet tools: encrypted keystores, keeper key straight into a GitHub secret
```

Launch: [`docs/LAUNCH.md`](docs/LAUNCH.md). Tests:

```
cd contracts && forge test --no-match-contract Fork      # order book + router
cd vaults && npm test                                    # vault protocol
cd keeper && npm test                                    # vault keeper
```

Not independently audited. Nothing here is investment advice.
