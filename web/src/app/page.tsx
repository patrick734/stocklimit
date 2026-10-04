"use client";

import { useEffect, useState } from "react";
import { probeV4Pools, NATIVE, readOrders, limitBookAbi, OrderStatus, type V4PoolKey, type LimitOrder } from "@splitroute/engine";
import { usePublicClient, useReadContract } from "wagmi";
import type { PublicClient } from "viem";
import { BRAND } from "@/lib/brand";
import { CHAIN_ID, ENGINE, LIMIT_BOOK } from "@/lib/config";
import { BASE_TOKENS, loadTokens, type Token } from "@/lib/tokens";
import { useMarkets } from "@/lib/useMarkets";
import { usd } from "@/lib/format";
import { Header } from "@/components/Header";
import { Ticker } from "@/components/Ticker";
import { LimitCard, type Preset } from "@/components/LimitCard";
import { MyOrders, describe } from "@/components/MyOrders";
import { CopyCA } from "@/components/CopyCA";
import { MarketsTable } from "@/components/MarketsTable";
import { Contracts, FAQ, Footer, HowItWorks, TokenSection } from "@/components/Sections";

export default function Home() {
  const [tokens, setTokens] = useState<Token[]>(BASE_TOKENS);
  const [listReady, setListReady] = useState(false);
  const [v4Pools, setV4Pools] = useState<V4PoolKey[]>([]);
  const [preset, setPreset] = useState<Preset | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [book, setBook] = useState<LimitOrder[]>([]);
  const markets = useMarkets(tokens, v4Pools);
  const client = usePublicClient({ chainId: CHAIN_ID }) as PublicClient | undefined;

  const fee = useReadContract({ address: LIMIT_BOOK, abi: limitBookAbi, functionName: "fillerFeeBps", chainId: CHAIN_ID, query: { enabled: !!LIMIT_BOOK } });
  const feeBps = fee.data !== undefined ? Number(fee.data) : 10;

  useEffect(() => {
    loadTokens().then(async (d) => {
      setTokens(d.tokens);
      setV4Pools(d.v4Pools);
      setListReady(true);
      if (d.v4Pools.length === 0 && client) {
        try {
          const stocks = d.tokens.filter((t) => t.kind === "stock").map((t) => t.address);
          const found = await probeV4Pools(client, ENGINE, stocks, [ENGINE.hubs[0], NATIVE, ENGINE.weth]);
          if (found.length) setV4Pools(found);
        } catch {
          /* v3 prices still work */
        }
      }
    });
  }, [client]);

  // The whole book, for the live "waiting" figures.
  useEffect(() => {
    if (!client || !LIMIT_BOOK) return;
    let dead = false;
    const run = () => readOrders(client, LIMIT_BOOK!).then((o) => !dead && setBook(o)).catch(() => {});
    run();
    const t = setInterval(() => document.visibilityState === "visible" && run(), 30_000);
    return () => {
      dead = true;
      clearInterval(t);
    };
  }, [client, refreshKey]);

  const pick = (t: Token) => {
    setPreset((p) => ({ stock: t, nonce: (p?.nonce ?? 0) + 1 }));
    document.getElementById("trade")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const now = BigInt(Math.floor(Date.now() / 1000));
  const open = book.filter((o) => o.status === OrderStatus.Open && o.expiry >= now);
  const filled = book.filter((o) => o.status === OrderStatus.Filled).length;
  const waitingUsd = open.reduce((s, o) => {
    const d = describe(o, tokens);
    const t = d.tin;
    const px = t ? (t.symbol === "USDG" ? 1 : markets.usd(t.address)) : undefined;
    return px && t ? s + px * (Number(o.remaining) / 10 ** t.decimals) : s;
  }, 0);
  const stocks = tokens.filter((t) => t.kind === "stock").length;
  // Live order figures when there are any; otherwise facts about the product. Nothing ever reads zero.
  const live = [
    { label: "Open orders", value: open.length, show: open.length > 0 },
    { label: "Waiting to fill", value: usd(waitingUsd).replace(/\.\d\d$/, ""), show: waitingUsd >= 1 },
    { label: "Orders filled", value: filled, show: filled > 0 },
  ].filter((f) => f.show);
  const facts = [
    { label: "Stock Tokens", value: listReady && stocks > 0 ? stocks : "—" },
    { label: "Keeper fee, only on fills", value: `${(feeBps / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}%` },
    { label: "Watching every pool", value: "24/7" },
  ];
  const figures = [...live, ...facts].slice(0, 3);

  return (
    <>
      <Ticker tokens={tokens} markets={markets} onPick={pick} />
      <Header />
      <main>
        <section className="hero wrap">
          <div className="hero-copy">
            <div className="pills">
              <span className="pill">
                <i className="live-dot" /> Live on Robinhood Chain
              </span>
              <span className="pill">Limit · Stop-loss · Take profit</span>
            </div>
            <h1>
              Name your price. <em>It fills itself.</em>
            </h1>
            <p className="lede">
              Set a limit, stop-loss, take-profit or bracket order on any Robinhood Stock Token. {BRAND.name} watches every
              Uniswap pool and Chainlink’s price, and the moment your price is reached your order fills, split across the
              pools that pay most. Cancel any time.
            </p>
            <div className="figures">
              {figures.map((f) => (
                <div key={f.label}>
                  <b>{f.value}</b>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
            <CopyCA />
          </div>
          <LimitCard tokens={tokens} markets={markets} preset={preset} feeBps={feeBps} onPlaced={() => setRefreshKey((k) => k + 1)} />
        </section>
        <MyOrders tokens={tokens} markets={markets} refreshKey={refreshKey} />
        <MarketsTable tokens={tokens} markets={markets} onTrade={pick} />
        <HowItWorks feeBps={feeBps} />
        <Contracts feeBps={feeBps} />
        <TokenSection />
        <FAQ feeBps={feeBps} />
      </main>
      <Footer />
    </>
  );
}
