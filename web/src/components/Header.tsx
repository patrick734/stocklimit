"use client";

import { useAccount, useDisconnect } from "wagmi";
import { BRAND } from "@/lib/brand";
import { CHAIN_ID } from "@/lib/config";
import { short } from "@/lib/format";
import { useOpenWallet } from "./Wallet";

export function Header() {
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const openWallet = useOpenWallet();
  return (
    <header className="top">
      <div className="wrap top-row">
        <a className="wordmark" href="/" aria-label={`${BRAND.name} home`}>
          <Mark />
          <span>{BRAND.name}</span>
        </a>
        <nav className="nav">
          <a href="/#trade">Trade</a>
          <a href="/#orders">My orders</a>
          <a href="/#markets">Markets</a>
          <a href="/vaults/">Vaults</a>
          <a href="/borrow/">Borrow</a>
          <a href="/portfolio/">Portfolio</a>
          <a href="/#how">How it works</a>
          <a href="/#faq">FAQ</a>
        </nav>
        <div className="top-right">
          <span className={`net${isConnected && chainId !== CHAIN_ID ? " bad" : ""}`}>
            <i /> Robinhood Chain
          </span>
          {isConnected ? (
            <button className="btn ghost" onClick={() => disconnect()} title="Disconnect">
              {short(address!)}
            </button>
          ) : (
            <button className="btn" onClick={openWallet}>
              Connect
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

/** Logo mark: a price line coming down to your level; the dot is the fill. */
export function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="mark">
      <path d="M2.5 3.5 L8 10.5 L11.5 8 L17 16.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path className="hot-line" d="M2 20.5 H22" fill="none" strokeWidth="2" strokeLinecap="round" />
      <circle className="hot" cx="17" cy="16.5" r="3.4" />
    </svg>
  );
}
