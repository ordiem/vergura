"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Emblem } from "@/components/Logo";

type NavItem = {
  label: string;
  href: string;
  match: string;
  indent?: boolean;
};

const groups: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Overview",
    items: [
      { label: "Dashboard", href: "/platform", match: "/platform" },
      {
        label: "Research Library",
        href: "/platform/library",
        match: "/platform/library",
      },
      { label: "New Report", href: "/platform/new", match: "/platform/new" },
    ],
  },
  {
    heading: "Pipeline",
    items: [
      {
        label: "Drafts",
        href: "/platform/library?status=Draft",
        match: "/platform/library",
        indent: true,
      },
      {
        label: "Scheduled Releases",
        href: "/platform/library?status=Scheduled",
        match: "/platform/library",
        indent: true,
      },
      {
        label: "Published",
        href: "/platform/library?status=Released",
        match: "/platform/library",
        indent: true,
      },
    ],
  },
  {
    heading: "Configuration",
    items: [
      { label: "Authors", href: "/platform/authors", match: "/platform/authors" },
      {
        label: "Asset Classes",
        href: "/platform/asset-classes",
        match: "/platform/asset-classes",
      },
      {
        label: "Disclosures",
        href: "/platform/disclosures",
        match: "/platform/disclosures",
      },
      {
        label: "Analytics",
        href: "/platform/analytics",
        match: "/platform/analytics",
      },
    ],
  },
];

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex h-full flex-col">
      <Link
        href="/"
        className="flex items-center gap-2.5 border-b border-line px-6 py-5"
      >
        <Emblem className="h-6 w-6 text-ivory" />
        <span className="flex flex-col leading-none">
          <span className="font-serif text-[1.1rem] tracking-[0.03em] text-ivory">
            Vergura
          </span>
          <span className="label mt-1 text-[0.5rem] tracking-[0.3em] text-silver">
            Platform
          </span>
        </span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        {groups.map((group) => (
          <div key={group.heading} className="mb-7">
            <div className="px-3 pb-3 font-mono text-[0.56rem] uppercase tracking-[0.22em] text-[#5a5a5a]">
              {group.heading}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.match === "/platform"
                    ? pathname === "/platform"
                    : pathname === item.match || pathname.startsWith(item.match + "/");
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 rounded-sm px-3 py-2 font-sans text-[0.8rem] transition-colors ${
                        item.indent ? "pl-5" : ""
                      } ${
                        active
                          ? "bg-[rgba(191,164,106,0.08)] text-ivory"
                          : "text-silver hover:bg-charcoal/60 hover:text-stone"
                      }`}
                    >
                      {active && !item.indent && (
                        <span className="text-gold">▎</span>
                      )}
                      {item.indent && (
                        <span className="text-[0.6rem] text-[#4a4a4a]">·</span>
                      )}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(191,164,106,0.4)] font-mono text-[0.62rem] text-champagne">
            AV
          </span>
          <span className="leading-tight">
            <span className="block font-sans text-[0.72rem] text-ivory">
              A. Vergura
            </span>
            <span className="block font-mono text-[0.56rem] uppercase tracking-[0.14em] text-silver">
              Strategist
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function CmsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen border-r border-line bg-charcoal/40 lg:block">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-line bg-charcoal">
            <SidebarContent pathname={pathname} />
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-ink/80 px-5 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
              className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 lg:hidden"
            >
              <span className="h-px w-5 bg-ivory" />
              <span className="h-px w-5 bg-ivory" />
            </button>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-silver">
              Research Cockpit
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-gold">
                Live
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center border-b border-line md:flex">
              <span className="px-2 font-mono text-[0.7rem] text-silver">⌕</span>
              <input
                placeholder="Search reports…"
                className="w-44 bg-transparent py-1.5 font-sans text-[0.78rem] text-ivory outline-none placeholder:text-silver"
              />
            </div>
            <Link
              href="/platform/new"
              className="inline-flex items-center gap-1.5 bg-ivory px-4 py-2 font-sans text-[0.7rem] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-champagne"
            >
              + New Report
            </Link>
          </div>
        </header>

        <main className="flex-1 px-5 py-8 lg:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
