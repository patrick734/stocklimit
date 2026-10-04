import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import { BRAND } from "@/lib/brand";
import { Providers } from "./providers";
import "./globals.css";

// Absolute base for link previews (X cards etc.): the site's domain. NEXT_PUBLIC_SITE_URL overrides it.
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://stocklimit.live";
const TITLE = `${BRAND.name}: limit, stop-loss and take-profit orders for Robinhood Stock Tokens`;
const DESCRIPTION =
  "Limit, stop-loss, take-profit and bracket orders on any Robinhood Stock Token. The moment your price is reached, your order fills across every Uniswap pool. Cancel anytime; unfilled orders are refunded.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  icons: { icon: "/icon.svg" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/", siteName: BRAND.name, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og.png"] },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#edf3f0" },
    { media: "(prefers-color-scheme: dark)", color: "#101113" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="backdrop" aria-hidden="true">
          <i className="b1" />
          <i className="b2" />
          <i className="b3" />
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
