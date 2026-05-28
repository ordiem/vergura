import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ibmMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-ibm",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vergura.investment"),
  title: {
    default: "Vergura Investment — Research-led capital intelligence",
    template: "%s — Vergura Investment",
  },
  description:
    "Vergura Investment releases institutional-grade market research, macro commentary, asset theses, and strategic intelligence through a private CMS-driven research platform.",
  keywords: [
    "investment research",
    "macro intelligence",
    "asset thesis",
    "institutional research",
    "market notes",
    "Vergura",
  ],
  authors: [{ name: "Vergura Investment" }],
  openGraph: {
    title: "Vergura Investment — Research-led capital intelligence",
    description:
      "Institutional-grade market research, macro commentary, and strategic intelligence.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${inter.variable} ${ibmMono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
