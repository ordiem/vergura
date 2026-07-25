import type { Metadata } from "next";
import Link from "next/link";
import { isDbConfigured } from "@/lib/db/client";
import { listGenerations } from "@/lib/db/queries";
import { SetupNotice } from "@/components/SetupNotice";

export const metadata: Metadata = { title: "Library" };
export const dynamic = "force-dynamic";

/** Approved assets only — the controlled output of the whole pipeline. */
export default async function LibraryPage() {
  if (!isDbConfigured()) return <SetupNotice />;

  const approved = await listGenerations({ review: "approved", limit: 200 });
  const assets = approved.flatMap((g) =>
    g.assets.map((a) => ({ ...a, gen: g }))
  );

  return (
    <div className="space-y-6">
      <header>
        <div className="label">Library</div>
        <h1 className="mt-1 text-2xl">Approved assets</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">
          Only generations that passed review appear here. Nothing reaches this page without an
          explicit approval.
        </p>
      </header>

      {assets.length === 0 ? (
        <p className="panel p-5 text-sm text-muted">
          Nothing approved yet. Review pending work in the{" "}
          <Link href="/jobs?review=in_review" className="text-accent">
            queue
          </Link>
          .
        </p>
      ) : (
        <>
          <div className="label">
            {assets.length} asset{assets.length === 1 ? "" : "s"} across {approved.length}{" "}
            generation{approved.length === 1 ? "" : "s"}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {assets.map((a) => (
              <div key={a.id} className="panel overflow-hidden">
                <a href={a.mirror_url ?? a.url} target="_blank" rel="noreferrer" className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.mirror_url ?? a.url}
                    alt={a.gen.resolved_prompt.slice(0, 120)}
                    className="aspect-square w-full bg-base object-cover"
                  />
                </a>
                <div className="p-3">
                  <p className="line-clamp-2 text-xs text-muted">{a.gen.resolved_prompt}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-mono text-[0.65rem] text-faint">
                      {a.gen.campaign_name ?? "no campaign"} · v{a.gen.version}
                    </span>
                    <Link
                      href={`/jobs/${a.gen.id}`}
                      className="text-[0.7rem] text-muted hover:text-fg"
                    >
                      job →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
