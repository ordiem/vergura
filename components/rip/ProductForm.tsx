"use client";

import { useActionState } from "react";
import { Uploader } from "./Uploader";
import { createProductAction } from "@/lib/rip-actions";
import type { ActionState } from "@/lib/actions";
import type { BrandPreset } from "@/lib/db/queries";

const INIT: ActionState = { ok: false, message: "" };

export function ProductForm({ presets }: { presets: BrandPreset[] }) {
  const [state, action, pending] = useActionState(createProductAction, INIT);

  return (
    <form action={action} className="panel space-y-4 p-5">
      <div className="label">New product</div>

      <div>
        <label className="label" htmlFor="pname">
          Name
        </label>
        <input id="pname" name="name" required className="field mt-1.5" />
      </div>

      <div>
        <label className="label" htmlFor="pdesc">
          Description
        </label>
        <textarea
          id="pdesc"
          name="description"
          rows={3}
          className="field mt-1.5 text-sm"
          placeholder="What it is, what it does, who buys it."
        />
      </div>

      <div>
        <label className="label" htmlFor="notes">
          Brand rules
        </label>
        <textarea
          id="notes"
          name="brand_notes"
          rows={3}
          className="field mt-1.5 text-sm"
          placeholder="Tone, claims you may and may not make, required disclaimers."
        />
        <p className="mt-1 text-xs text-faint">
          The concept writer must respect these when translating an idea onto this product.
        </p>
      </div>

      <Uploader
        name="image_urls"
        folder="products"
        multiple
        label="Reference images — how the product actually looks"
      />

      <div>
        <label className="label" htmlFor="preset_id">
          Brand preset
        </label>
        <select id="preset_id" name="preset_id" className="field mt-1.5">
          <option value="">None — no locked brand language</option>
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-faint">
          Applied to every generation from this product, on top of the concept&apos;s prompt.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : "Save product"}
        </button>
        {state.message ? (
          <span className={`text-xs ${state.ok ? "text-ok" : "text-bad"}`}>{state.message}</span>
        ) : null}
      </div>
    </form>
  );
}
