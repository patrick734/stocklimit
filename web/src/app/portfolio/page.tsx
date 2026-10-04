import "@/vaults/vaults.css";
import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { LimitTokenDetails } from "@/vaults/components/LimitTokenDetails";
import { YourHoldings } from "@/vaults/components/YourHoldings";
import { LIMIT } from "@/vaults/lib/brand";

export const metadata: Metadata = {
  title: `Portfolio · ${BRAND.name}`,
  description: "Your Stocklimit Vault shares, Credit Line positions and $LIMIT, read straight from the contracts.",
};

export default function PortfolioPage() {
  return (
    <>
      <Header />
      <main className="wrap vx">
        <div className="vx-hero">
          <h1>
            Your <em>portfolio.</em>
          </h1>
          <p className="lede">Your Vault shares, Credit Line positions and {LIMIT}, read straight from the contracts.</p>
        </div>
        <section className="section vx-tight">
          <div className="vx-grid">
            <YourHoldings />
            <LimitTokenDetails />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
