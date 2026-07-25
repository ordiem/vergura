"use client";

import { useActionState, useState } from "react";
import { createBatchAction } from "@/lib/rip-actions";
import type { ActionState } from "@/lib/actions";

const INIT: ActionState = { ok: false, message: "" };

export type Selectable = {
  id: string;
  url: string;
  prompt: string;
  campaign: string | null;
};

/** Selection is the gate: only approved assets are offered here. */
export function BatchBuilder({ assets }: { assets: Selectable[] }) {
  const [state, action, pending] = useActionState(createBatchAction, INIT);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setPicked((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <form action={action} className="space-y-4">
      <div className="panel flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[12rem] flex-1">
          <label className="label" htmlFor="bname">
            Batch name
          </label>
          <input id="bname" name="name" required className="field mt-1.5" placeholder="Q3 Sleep — Round 2" />
        </div>
        <div className="min-w-[12rem] flex-1">
          <label className="label" htmlFor="bnote">
            Note
          </label>
          <input id="bnote" name="note" className="field mt-1.5" />
        </div>
        <button
          type="submit"
          disabled={pending || picked.size === 0}
          className="btn btn-primary"
        >
          {pending ? "Creating…" : `Create batch (${picked.size})`}
        </button>
      </div>

      {state.message ? (
        <p className={`text-xs ${state.ok ? "text-ok" : "text-bad"}`}>
          {state.message}
          {state.ok && state.id ? (
            <a href={`/api/batches/${state.id}/export`} className="ml-2 underline">
              download manifest →
            </a>
          ) : null}
        </p>
      ) : null}

      {assets.length === 0 ? (
        <p className="panel p-5 text-sm text-muted">
          No approved assets yet. Approve generations in the queue first — nothing can be batched
          without passing review.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {assets.map((a) => {
            const on = picked.has(a.id);
            return (
              <button
                type="button"
                key={a.id}
                onClick={() => toggle(a.id)}
                className={`overflow-hidden rounded-lg border text-left transition-colors ${
                  on ? "border-accent bg-panel-2" : "border-line hover:bg-panel-2"
                }`}
              >
                {on ? <input type="hidden" name="asset" value={a.id} /> : null}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.url} alt="" className="aspect-square w-full bg-base object-cover" />
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="font-mono text-[0.6rem] text-faint">
                    {a.campaign ?? "no campaign"}
                  </span>
                  <span className={`text-xs ${on ? "text-accent" : "text-faint"}`}>
                    {on ? "✓" : "+"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </form>
  );
}
