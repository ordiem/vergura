"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ReviewBadge, StateBadge } from "@/components/Badges";
import type { GenerationWithAssets, JobState, ReviewStatus } from "@/lib/db/queries";

type LiveRow = {
  id: string;
  state: JobState;
  progress: number;
  review: ReviewStatus;
  credits: number;
  failMsg: string | null;
  assets: string[];
};

const ACTIVE: JobState[] = ["waiting", "queuing", "generating"];
const POLL_MS = 4000;

export function JobQueue({ initial }: { initial: GenerationWithAssets[] }) {
  const [live, setLive] = useState<Record<string, LiveRow>>({});
  const [polling, setPolling] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Subscribe to server-side status sweeps while anything is in flight.
  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      try {
        const res = await fetch("/api/generations/poll", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const body = (await res.json()) as { generations: LiveRow[] };
        if (cancelled) return;
        setLive(Object.fromEntries(body.generations.map((g) => [g.id, g])));
        setPolling(body.generations.some((g) => ACTIVE.includes(g.state)));
      } catch {
        /* transient — retry on the next tick */
      }
    };

    void tick();
    timer.current = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const rows = initial.map((g) => {
    const l = live[g.id];
    return {
      ...g,
      state: l?.state ?? g.state,
      progress: l?.progress ?? g.progress,
      review: l?.review ?? g.review,
      credits: l ? l.credits : Number(g.credits_consumed),
      fail_msg: l?.failMsg ?? g.fail_msg,
      assetUrls: l?.assets.length ? l.assets : g.assets.map((a) => a.url),
    };
  });

  const active = rows.filter((r) => ACTIVE.includes(r.state)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="label">
          {rows.length} generation{rows.length === 1 ? "" : "s"}
        </span>
        {active > 0 ? (
          <span className="chip border-[rgba(251,191,36,0.4)] text-run">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-run" />
            {active} in flight
          </span>
        ) : null}
        <span className="ml-auto text-xs text-faint">
          {polling ? "live · polling KIE every 4s" : "idle"}
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="panel p-5 text-sm text-muted">
          Nothing in the queue.{" "}
          <Link href="/generate" className="text-accent">
            Generate something →
          </Link>
        </p>
      ) : (
        <div className="panel divide-y divide-[rgba(255,255,255,0.06)]">
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/jobs/${r.id}`}
              className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-panel-2"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded border border-line bg-base">
                {r.assetUrls[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.assetUrls[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-mono text-[0.6rem] text-faint">
                      {ACTIVE.includes(r.state) ? `${r.progress}%` : "—"}
                    </span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{r.resolved_prompt}</p>
                <p className="mt-0.5 truncate font-mono text-xs text-faint">
                  {r.model}
                  {r.campaign_name ? ` · ${r.campaign_name}` : ""}
                  {r.version > 1 ? ` · v${r.version}` : ""}
                  {r.assetUrls.length > 1 ? ` · ${r.assetUrls.length} assets` : ""}
                </p>
                {r.state === "fail" && r.fail_msg ? (
                  <p className="mt-0.5 truncate font-mono text-xs text-bad">{r.fail_msg}</p>
                ) : null}
              </div>

              <span className="hidden font-mono text-xs text-muted sm:block">
                {r.credits > 0 ? `${r.credits.toFixed(2)} cr` : ""}
              </span>
              <StateBadge state={r.state} />
              <ReviewBadge review={r.review} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
