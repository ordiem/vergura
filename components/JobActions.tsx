"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { reviewAction, rerunAction, type ActionState } from "@/lib/actions";

const INITIAL: ActionState = { ok: false, message: "" };

function Result({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return (
    <p className={`mt-2 text-xs ${state.ok ? "text-ok" : "text-bad"}`}>
      {state.message}
      {state.ok && state.id ? (
        <Link href={`/jobs/${state.id}`} className="ml-1 underline">
          open →
        </Link>
      ) : null}
    </p>
  );
}

export function ReviewPanel({
  id,
  review,
  canApprove,
  note,
}: {
  id: string;
  review: string;
  canApprove: boolean;
  note: string;
}) {
  const [state, action, pending] = useActionState(reviewAction, INITIAL);

  return (
    <form action={action} className="panel p-5">
      <div className="label">Review</div>
      <input type="hidden" name="id" value={id} />

      <textarea
        name="note"
        rows={2}
        defaultValue={note}
        placeholder="Review note (optional)"
        className="field mt-2 text-sm"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="submit"
          name="review"
          value="approved"
          disabled={pending || !canApprove || review === "approved"}
          className="btn btn-ok"
          title={canApprove ? undefined : "Only a successful generation can be approved."}
        >
          Approve
        </button>
        <button
          type="submit"
          name="review"
          value="rejected"
          disabled={pending || review === "rejected"}
          className="btn btn-bad"
        >
          Reject
        </button>
        <button
          type="submit"
          name="review"
          value="in_review"
          disabled={pending || review === "in_review"}
          className="btn"
        >
          Send back to review
        </button>
      </div>

      {!canApprove ? (
        <p className="mt-2 text-xs text-faint">
          Approval unlocks once the job completes successfully.
        </p>
      ) : null}
      <Result state={state} />
    </form>
  );
}

export function RerunPanel({ id, prompt }: { id: string; prompt: string }) {
  const [state, action, pending] = useActionState(rerunAction, INITIAL);
  const [open, setOpen] = useState(false);

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <div className="label">Iterate</div>
        <button type="button" onClick={() => setOpen((v) => !v)} className="btn">
          {open ? "Cancel" : "Re-run"}
        </button>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Creates a new version linked to this one. The preset re-applies its locked segments, so
        brand rules cannot drift across iterations.
      </p>

      {open ? (
        <form action={action} className="mt-3">
          <input type="hidden" name="id" value={id} />
          <textarea
            name="prompt"
            rows={4}
            defaultValue={prompt}
            className="field font-mono text-xs"
            placeholder="Adjust the operator prompt, or leave as-is to re-roll."
          />
          <button type="submit" disabled={pending} className="btn btn-primary mt-2 w-full">
            {pending ? "Submitting…" : "Submit new version"}
          </button>
          <Result state={state} />
        </form>
      ) : (
        <Result state={state} />
      )}
    </div>
  );
}
