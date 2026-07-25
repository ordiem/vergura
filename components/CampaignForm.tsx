"use client";

import { useActionState } from "react";
import { createCampaignAction, type ActionState } from "@/lib/actions";

const INITIAL: ActionState = { ok: false, message: "" };

export function CampaignForm() {
  const [state, action, pending] = useActionState(createCampaignAction, INITIAL);

  return (
    <form action={action} className="panel space-y-4 p-5">
      <div className="label">New campaign</div>

      <div>
        <label className="label" htmlFor="cname">
          Name
        </label>
        <input id="cname" name="name" required className="field mt-1.5" />
      </div>

      <div>
        <label className="label" htmlFor="objective">
          Brief
        </label>
        <textarea id="objective" name="objective" rows={3} className="field mt-1.5 text-sm" />
      </div>

      <div>
        <label className="label" htmlFor="budget">
          Budget (credits)
        </label>
        <input
          id="budget"
          name="budget_credits"
          type="number"
          min="0"
          step="0.01"
          className="field mt-1.5"
          placeholder="Leave blank for uncapped"
        />
        <p className="mt-1 text-xs text-faint">
          Submissions are blocked when the estimate exceeds what is left, counting in-flight jobs.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : "Create campaign"}
        </button>
        {state.message ? (
          <span className={`text-xs ${state.ok ? "text-ok" : "text-bad"}`}>{state.message}</span>
        ) : null}
      </div>
    </form>
  );
}
