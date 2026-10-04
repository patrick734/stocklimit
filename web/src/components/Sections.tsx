"use client";

import { BRAND } from "@/lib/brand";
import { LIMIT_BOOK, QUOTER, ROUTER, addressUrl } from "@/lib/config";
import { deployments } from "@/generated/vaults/deployments";
import { CopyCA } from "./CopyCA";

const feeTxt = (bps: number) => `${(bps / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;

export function HowItWorks({ feeBps }: { feeBps: number }) {
  const steps = [
    { n: "01", t: "Set your price", d: "Pick a stock, an amount and your exit: a limit or take-profit price, a stop-loss on Chainlink’s price, or both as a bracket. Your deposit goes into BookStocklimit, held for that order only." },
    { n: "02", t: "We watch every pool", d: "A keeper quotes your order against every Uniswap v3 and v4 pool on Robinhood Chain every few seconds, and checks Chainlink’s price for stops." },
    { n: "03", t: "It fills, or you get it back", d: `The moment your price is reached, it fills in one transaction through RouterStocklimit, split across the pools that pay most, in parts if you allowed it. The keeper takes ${feeTxt(feeBps)} and only on fills. Whatever is left goes back to you at expiry.` },
  ];
  return (
    <section id="how" className="section wrap">
      <div className="section-head">
        <span className="label">How it works</span>
        <h2>
          Set it, <em>walk away.</em>
        </h2>
        <p>Pools on Robinhood Chain trade around the clock. A limit or stop order means you don’t have to.</p>
      </div>
      <ol className="steps">
        {steps.map((s) => (
          <li key={s.n}>
            <span className="step-n">{s.n}</span>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Contracts({ feeBps }: { feeBps: number }) {
  const d = (deployments as Record<number, Record<string, unknown>>)[4663] as
    | { timelock?: string; oracle?: string; swapAdapter?: string; buyBurn?: string; feeRouter?: string; registry?: string; basketProgram?: string; vaults?: Record<string, { vault: string }>; creditLines?: Record<string, string> }
    | undefined;
  const rows: [string, string | undefined][] = [
    ["BookStocklimit (orders)", LIMIT_BOOK],
    ["RouterStocklimit", ROUTER],
    ["QuoterStocklimit", QUOTER],
    ["TimelockStocklimit (48h)", d?.timelock],
    ["OracleStocklimit", d?.oracle],
    ["BuyBurnStocklimit", d?.buyBurn],
    ["FeeRouterStocklimit", d?.feeRouter],
    ["SwapAdapterStocklimit", d?.swapAdapter],
    ["RegistryStocklimit", d?.registry],
    ...Object.entries(d?.vaults ?? {}).map(([t, v]) => [`VaultStocklimit · ${t}`, v.vault] as [string, string]),
    ...Object.entries(d?.creditLines ?? {}).map(([t, v]) => [`BorrowDeskStocklimit · ${t}`, v] as [string, string]),
    ["BasketStocklimit", d?.basketProgram],
  ];
  const props: [string, string][] = [
    ["Your price", "Enforced on-chain. The contract refuses any fill that pays you less than your minimum, after the fee, part by part."],
    ["Stops", "Triggered by Chainlink’s price, not a single pool, and only on an answer fresh enough for your order. Your slippage floor still applies after the trigger."],
    ["Fee", `${feeTxt(feeBps)} of what you receive, paid to whoever fills the order, only when it fills. Fixed forever at deployment.`],
    ["Custody", "Your deposit sits in the contract under your order. It can only leave to you (cancel, refund) or into your fill."],
    ["Cancel", "Any time, by you. After expiry anyone can trigger the refund, and it still only goes to you."],
    ["Control", "Order book, router and quoter: no owner, no admin keys, no pause, no upgrade path. Vault settings: every change waits 48 hours in TimelockStocklimit."],
  ];
  return (
    <section id="contracts" className="section wrap">
      <div className="section-head">
        <span className="label">Contracts</span>
        <h2>
          Your price, <em>in code.</em>
        </h2>
        <p>Every Stocklimit contract carries the Stocklimit name and is verified. Read them, don’t trust them.</p>
      </div>
      <div className="twocol">
        <div className="panel">
          <dl className="kv">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd className="mono">
                  {v ? (
                    <a href={addressUrl(v)} target="_blank" rel="noopener">
                      {v.slice(0, 8)}…{v.slice(-6)}
                    </a>
                  ) : (
                    <span className="muted">Not deployed yet</span>
                  )}
                </dd>
              </div>
            ))}
            <div>
              <dt>Venues</dt>
              <dd>Uniswap v3 and v4 on Robinhood Chain</dd>
            </div>
            <div>
              <dt>Chain</dt>
              <dd>Robinhood Chain · 4663</dd>
            </div>
          </dl>
        </div>
        <div className="panel">
          <dl className="kv">
            {props.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <p className="disclose">
        The contracts have not been independently audited. They are tested against real Uniswap v3 and v4 code (fills,
        splits, partial fills, stops, native ETH, cancels, expiry, fee limits), and Vault caps start small. An order is not
        a guarantee of a fill: the price has to reach yours in the pools and stay there long enough for the keeper’s
        transaction to land, and pools on Robinhood Chain are thin next to a large exchange. Stops follow Chainlink, which
        pauses outside US market hours; a price can gap past a stop’s floor, and then the order waits. Nothing here is
        investment advice.
      </p>
    </section>
  );
}

export function TokenSection() {
  const { symbol, address } = BRAND.token;
  return (
    <section id="token" className="section wrap">
      <div className="section-head">
        <span className="label">Token</span>
        <h2>
          <em>${symbol}</em>
        </h2>
        <p>
          The {BRAND.name} token. 30% of Vault trading fees buy back and burn ${symbol}. It is separate from your orders: placing,
          cancelling and filling never touch it.
        </p>
      </div>
      <div className="twocol">
        <div className="token-card">
          <span className="label">Contract address</span>
          <h3>${symbol}</h3>
          <CopyCA variant="dark" />
          <div className="bars" aria-hidden="true">
            {[14, 20, 26, 32, 44].map((h, i) => (
              <i key={i} style={{ height: h }} />
            ))}
          </div>
        </div>
        <div className="panel">
          <dl className="kv">
            <div>
              <dt>Ticker</dt>
              <dd className="mono">${symbol}</dd>
            </div>
            <div>
              <dt>Chain</dt>
              <dd>Robinhood Chain</dd>
            </div>
            <div>
              <dt>Official address</dt>
              <dd className="mono">{address || "Not launched"}</dd>
            </div>
            <div>
              <dt>Heads up</dt>
              <dd>Copycat tokens appear within minutes of any launch. Only the address on this page is ours. If it isn’t here, it isn’t us.</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}


export function FAQ({ feeBps }: { feeBps: number }) {
  const qa: [string, string][] = [
    ["What is a limit order?", "An order to buy at or below a price, or sell at or above one (take profit). It waits until the market gets there, then fills. If it never does, you get your deposit back."],
    ["How do stop-loss orders work?", "You set a stop price and a slippage floor. When Chainlink’s price for the stock reaches your stop, the order becomes fillable and stays that way, and it sells for at least your floor. If the price gaps past the floor, the order waits rather than selling cheap."],
    ["What is a bracket?", "A sell order with two exits: take profit at one price, or stop the loss at another. Whichever comes first fills the order."],
    ["What are partial fills?", "If you allow them, a large order can fill in parts when the pools are thin, each part at your price or better. Whatever is left keeps waiting, and you can cancel it any time."],
    ["Is my price guaranteed?", "Your minimum is. The contract checks every fill and refuses any that would pay you less. You can get a better price than your limit, never a worse one."],
    ["Is a fill guaranteed?", "No. The pools have to reach your price and stay there long enough for the fill to land. A price that only touches your level for a moment may not fill."],
    ["Who fills my order?", "Anyone can. Our keeper runs around the clock and fills through RouterStocklimit, split across the pools that pay most."],
    ["What are Vaults?", "Deposit USDG into a Vault for one stock and earn its trading fees: 70% compounds for Vault holders and 30% buys back and burns $LIMIT. Vault shares can back a Credit Line on the Borrow page."],
    ["What does it cost?", `${feeTxt(feeBps)} of what you receive, only if the order fills. Placing and cancelling cost only gas.`],
    ["Can I cancel?", "Any time, from My orders. The deposit goes straight back to your wallet. After expiry, anyone can trigger the refund, and it still only goes to you."],
    ["Which stocks?", "Official Robinhood Stock Tokens with a live pool on Robinhood Chain, priced in USDG. New ones are added as their pools launch."],
  ];
  return (
    <section id="faq" className="section wrap">
      <div className="section-head">
        <span className="label">FAQ</span>
        <h2>Questions</h2>
        <p>Short answers. The contract is the long one.</p>
      </div>
      <div className="faq">
        {qa.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <p className="foot-big">{BRAND.name}</p>
        <div className="foot-row">
          <span>{BRAND.tagline}</span>
          <span className="foot-links">
            {BRAND.x && (
              <a href={BRAND.x} target="_blank" rel="noopener">
                X
              </a>
            )}
            {BRAND.telegram && (
              <a href={BRAND.telegram} target="_blank" rel="noopener">
                Telegram
              </a>
            )}
            <a href="/#markets">Markets</a>
            <a href="/vaults/">Vaults</a>
            <a href="/#contracts">Contracts</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
