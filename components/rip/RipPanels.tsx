"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Uploader } from "./Uploader";
import type { ActionState } from "@/lib/actions";
import {
  analyseRefAction,
  conceptReviewAction,
  createRefAction,
  deleteRipAction,
  runRipAction,
} from "@/lib/rip-actions";
import type { Concept, Product, Ref, Rip } from "@/lib/db/rip-queries";

const INIT: ActionState = { ok: false, message: "" };

function Msg({ s }: { s: ActionState }) {
  if (!s.message) return null;
  return <p className={`mt-2 text-xs ${s.ok ? "text-ok" : "text-bad"}`}>{s.message}</p>;
}

/* ------------------------- 1. add a reference ------------------------- */

export function AddReference() {
  const [state, action, pending] = useActionState(createRefAction, INIT);
  return (
    <form action={action} className="panel space-y-3 p-5">
      <div className="label">1 · Reference ad</div>
      <Uploader name="source_url" folder="references" label="Upload the ad to rip" />
      <div>
        <label className="label" htmlFor="label">
          Label
        </label>
        <input id="label" name="label" className="field mt-1.5" placeholder="Competitor — sleep aid" />
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Saving…" : "Save reference"}
      </button>
      <Msg s={state} />
    </form>
  );
}

/* --------------------------- 2. analyse it --------------------------- */

export function RefCard({ r }: { r: Ref }) {
  const [state, action, pending] = useActionState(analyseRefAction, INIT);
  const a = r.analysis;

  return (
    <div className="panel p-4">
      <div className="flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={r.source_url}
          alt={r.label}
          className="h-20 w-20 shrink-0 rounded border border-line object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm">{r.label || "Untitled reference"}</span>
            {a ? (
              <span className="chip border-[rgba(74,222,128,0.35)] text-ok">analysed</span>
            ) : (
              <span className="chip text-faint">not analysed</span>
            )}
          </div>
          {a ? (
            <p className="mt-1 line-clamp-2 text-xs text-muted">{a.big_idea}</p>
          ) : (
            <form action={action} className="mt-2">
              <input type="hidden" name="id" value={r.id} />
              <button type="submit" disabled={pending} className="btn">
                {pending ? "Reading the ad…" : "Analyse"}
              </button>
            </form>
          )}
          {r.fail_msg ? <p className="mt-1 text-xs text-bad">{r.fail_msg}</p> : null}
          <Msg s={state} />
        </div>
      </div>

      {a ? (
        <details className="mt-3">
          <summary className="label cursor-pointer">Why it works</summary>
          <div className="mt-2 space-y-2 text-xs text-muted">
            <p>
              <span className="text-faint">Format: </span>
              {a.format} · <span className="text-faint">Tone: </span>
              {a.tone}
            </p>
            <ul className="list-disc space-y-0.5 pl-4">
              {a.why_it_works?.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
            {a.palette?.length ? (
              <p>
                <span className="text-faint">Palette: </span>
                {a.palette.join(" · ")}
              </p>
            ) : null}
            {a.lighting ? (
              <p>
                <span className="text-faint">Light: </span>
                {a.lighting}
              </p>
            ) : null}
            {a.detected_text?.length ? (
              <p className="font-mono text-[0.7rem] text-faint">
                Text read: {a.detected_text.join(" · ")}
              </p>
            ) : null}
          </div>
        </details>
      ) : null}
    </div>
  );
}

/* ----------------------------- 3. the rip ----------------------------- */

export function RunRip({
  refs,
  products,
}: {
  refs: Ref[];
  products: Product[];
}) {
  const [state, action, pending] = useActionState(runRipAction, INIT);
  const analysed = refs.filter((r) => r.analysis);

  return (
    <form action={action} className="panel space-y-3 p-5">
      <div className="label">3 · Rip onto a product</div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="ref_id">
            Reference
          </label>
          <select id="ref_id" name="ref_id" required className="field mt-1.5">
            <option value="">Choose…</option>
            {analysed.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label || r.id.slice(0, 8)}
              </option>
            ))}
          </select>
          {analysed.length === 0 ? (
            <p className="mt-1 text-xs text-faint">Analyse a reference first.</p>
          ) : null}
        </div>

        <div>
          <label className="label" htmlFor="product_id">
            Product
          </label>
          <select id="product_id" name="product_id" required className="field mt-1.5">
            <option value="">Choose…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {products.length === 0 ? (
            <p className="mt-1 text-xs text-faint">
              <Link href="/products" className="text-accent">
                Save a product first →
              </Link>
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="variant_count">
          Concepts to propose
        </label>
        <input
          id="variant_count"
          name="variant_count"
          type="number"
          min={1}
          max={5}
          defaultValue={3}
          className="field mt-1.5"
        />
      </div>

      <button
        type="submit"
        disabled={pending || analysed.length === 0 || products.length === 0}
        className="btn btn-primary w-full"
      >
        {pending ? "Translating the big idea…" : "Rip it"}
      </button>
      <Msg s={state} />
    </form>
  );
}

/* ----------------------- 4. review the concepts ----------------------- */

export function ConceptCard({ c, campaignId }: { c: Concept; campaignId: string | null }) {
  const [state, action, pending] = useActionState(conceptReviewAction, INIT);
  const [prompt, setPrompt] = useState(c.visual_prompt);

  const tone =
    c.status === "approved"
      ? "border-[rgba(74,222,128,0.35)] text-ok"
      : c.status === "rejected"
        ? "border-[rgba(248,113,113,0.4)] text-bad"
        : c.status === "generated"
          ? "border-accent text-accent"
          : "text-faint";

  return (
    <form action={action} className="panel p-4">
      <input type="hidden" name="id" value={c.id} />
      <input type="hidden" name="campaign_id" value={campaignId ?? ""} />

      <div className="flex flex-wrap items-center gap-2">
        <span className="chip text-muted">{c.angle || `concept ${c.idx + 1}`}</span>
        <span className={`chip ${tone}`}>{c.status}</span>
      </div>

      <p className="mt-2 text-sm">{c.big_idea}</p>
      <p className="mt-1 text-xs text-muted">{c.rationale}</p>

      {/* Copy stays structured and out of the image. */}
      <div className="mt-3 rounded-lg border border-line bg-base p-3">
        <div className="label mb-1.5">Copy · for your design tool, not the model</div>
        <p className="text-sm">{c.headline}</p>
        {c.subhead ? <p className="text-xs text-muted">{c.subhead}</p> : null}
        <p className="mt-1 font-mono text-[0.7rem] text-accent">{c.cta}</p>
        {c.body_copy ? <p className="mt-1 text-xs text-muted">{c.body_copy}</p> : null}
      </div>

      <div className="mt-3">
        <label className="label">Visual prompt · editable</label>
        <textarea
          name="visual_prompt"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="field mt-1.5 font-mono text-xs"
        />
        <p className="mt-1 text-xs text-faint">
          Imagery only. On generate, the product&apos;s photos are attached as references and an
          instruction to render that exact product is appended — then the brand preset applies its
          locked segments on top. The full text sent is on the job page.
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="submit"
          name="action"
          value="approve"
          disabled={pending || c.status === "generated"}
          className="btn btn-ok"
        >
          Approve
        </button>
        <button
          type="submit"
          name="action"
          value="generate"
          disabled={pending || c.status === "rejected"}
          className="btn btn-primary"
        >
          Generate
        </button>
        <button
          type="submit"
          name="action"
          value="save"
          disabled={pending}
          className="btn"
        >
          Save prompt
        </button>
        <button
          type="submit"
          name="action"
          value="reject"
          disabled={pending || c.status === "generated"}
          className="btn btn-bad"
        >
          Reject
        </button>
        <button
          type="submit"
          name="action"
          value="delete"
          disabled={pending || c.status === "generated"}
          onClick={(e) => {
            if (!confirm("Delete this concept? Reject keeps it on the record; delete does not.")) {
              e.preventDefault();
            }
          }}
          className="btn btn-bad ml-auto"
          title={
            c.status === "generated"
              ? "Generated concepts stay — the job would lose its origin."
              : "Remove this proposal entirely"
          }
        >
          Delete
        </button>
      </div>

      <Msg s={state} />
      {state.ok && state.id ? (
        <Link href={`/jobs/${state.id}`} className="mt-1 block text-xs underline">
          Open job →
        </Link>
      ) : null}
    </form>
  );
}

export function RipResult({ rip }: { rip: Rip }) {
  const [state, action, pending] = useActionState(deleteRipAction, INIT);
  const locked = rip.concepts.some((c) => c.status === "generated");

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="label">
          {rip.ref_label || "reference"} → {rip.product_name || "product"}
        </span>
        <span className="chip text-faint">{rip.concepts.length} concepts</span>
        <form action={action} className="ml-auto">
          <input type="hidden" name="id" value={rip.id} />
          <button
            type="submit"
            disabled={pending || locked}
            onClick={(e) => {
              if (!confirm(`Delete this whole run and its ${rip.concepts.length} concepts?`)) {
                e.preventDefault();
              }
            }}
            className="btn btn-bad"
            title={locked ? "A concept here generated — the run stays on the record." : undefined}
          >
            {pending ? "Deleting…" : "Delete run"}
          </button>
        </form>
      </div>
      <Msg s={state} />
      {rip.concepts.length === 0 ? (
        <p className="panel p-4 text-sm text-muted">
          Every concept in this run was deleted. Delete the run to clear it.
        </p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {rip.concepts.map((c) => (
            <ConceptCard key={c.id} c={c} campaignId={rip.campaign_id} />
          ))}
        </div>
      )}
    </section>
  );
}
