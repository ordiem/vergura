"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/auth-actions";
import type { ActionState } from "@/lib/actions";

const INIT: ActionState = { ok: false, message: "" };

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, INIT);

  return (
    <form action={action} className="panel space-y-4 p-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          className="field mt-1.5"
        />
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Checking…" : "Sign in"}
      </button>
      {state.message ? <p className="text-xs text-bad">{state.message}</p> : null}
    </form>
  );
}
