import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { EnvBanner } from "@/components/EnvBanner";

export const metadata: Metadata = {
  title: {
    default: "Vergura — Creative Engineering",
    template: "%s — Vergura",
  },
  description:
    "Controlled AI creative production: brand-locked presets, budgeted generation, and reviewed asset delivery.",
};

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/generate", label: "Generate" },
  { href: "/jobs", label: "Queue" },
  { href: "/library", label: "Library" },
  { href: "/presets", label: "Presets" },
  { href: "/campaigns", label: "Campaigns" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 border-b border-line bg-base/85 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-5">
              <Link href="/" className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-accent" />
                <span className="font-mono text-sm tracking-[0.18em] uppercase">Vergura</span>
              </Link>
              <nav className="flex items-center gap-1 overflow-x-auto">
                {NAV.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="rounded-md px-2.5 py-1.5 text-[0.82rem] whitespace-nowrap text-muted transition-colors hover:bg-panel hover:text-fg"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          <EnvBanner />

          <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8">{children}</main>

          <footer className="border-t border-line px-5 py-5">
            <div className="mx-auto max-w-7xl">
              <p className="label">Creative engineering platform · static creatives</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
