"use client";

import { useActionState, useState } from "react";
import { createPresetAction, type ActionState } from "@/lib/actions";
import { IMAGE_MODELS } from "@/lib/kie/models";

const INITIAL: ActionState = { ok: false, message: "" };

/**
 * Per parameter the author picks one of:
 *   locked — pinned to a value, operators see it greyed out
 *   free   — operators may set it per generation
 *   hidden — not exposed; the model default applies
 */
export function PresetForm() {
  const [state, action, pending] = useActionState(createPresetAction, INITIAL);
  const [slug, setSlug] = useState(IMAGE_MODELS[0].slug);
  const model = IMAGE_MODELS.find((m) => m.slug === slug) ?? IMAGE_MODELS[0];
  const [modes, setModes] = useState<Record<string, string>>({});

  const modeOf = (key: string) => modes[key] ?? "free";

  return (
    <form action={action} className="panel space-y-5 p-5">
      <div className="label">New preset</div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">
            Name
          </label>
          <input id="name" name="name" required className="field mt-1.5" placeholder="Q3 Performance — Product" />
        </div>
        <div>
          <label className="label" htmlFor="pmodel">
            Model (locked for operators)
          </label>
          <select
            id="pmodel"
            name="model"
            className="field mt-1.5"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setModes({});
            }}
          >
            {IMAGE_MODELS.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="description">
          Description
        </label>
        <input id="description" name="description" className="field mt-1.5" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="locked_prefix">
            Locked prefix
          </label>
          <textarea
            id="locked_prefix"
            name="locked_prefix"
            rows={3}
            className="field mt-1.5 font-mono text-xs"
            placeholder="Studio product photograph, brand palette of deep navy and warm sand,"
          />
        </div>
        <div>
          <label className="label" htmlFor="locked_suffix">
            Locked suffix
          </label>
          <textarea
            id="locked_suffix"
            name="locked_suffix"
            rows={3}
            className="field mt-1.5 font-mono text-xs"
            placeholder="shot on 85mm, soft key light, no text overlays."
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="negative_prompt">
          Negative prompt
        </label>
        <input
          id="negative_prompt"
          name="negative_prompt"
          className="field mt-1.5 font-mono text-xs"
          placeholder="watermarks, logos, distorted hands, text"
        />
        <p className="mt-1 text-xs text-faint">
          These models expose no negative-prompt field, so this is appended to the prompt as
          “Avoid: …”.
        </p>
      </div>

      <div>
        <div className="label mb-2">Parameter control</div>
        <div className="space-y-2">
          {model.fields
            .filter((f) => f.key !== "prompt")
            .map((f) => {
              const mode = modeOf(f.key);
              return (
                <div
                  key={f.key}
                  className="grid items-center gap-2 rounded-lg border border-line p-2.5 sm:grid-cols-[1fr_auto_10rem]"
                >
                  <span className="text-sm">{f.label}</span>

                  <select
                    name={`mode_${f.key}`}
                    value={mode}
                    onChange={(e) => setModes((m) => ({ ...m, [f.key]: e.target.value }))}
                    className="field w-full sm:w-32"
                  >
                    <option value="free">Operator sets</option>
                    <option value="locked">Locked</option>
                    <option value="hidden">Model default</option>
                  </select>

                  {mode === "locked" ? (
                    f.type === "select" ? (
                      <select name={`lock_${f.key}`} className="field" defaultValue={f.default}>
                        {f.options.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : f.type === "boolean" ? (
                      <select name={`lock_${f.key}`} className="field" defaultValue="false">
                        <option value="false">off</option>
                        <option value="true">on</option>
                      </select>
                    ) : (
                      <input
                        name={`lock_${f.key}`}
                        type={f.type === "number" ? "number" : "text"}
                        defaultValue={f.type === "number" ? f.default : undefined}
                        className="field"
                      />
                    )
                  ) : (
                    <span className="text-xs text-faint">
                      {mode === "free" ? "editable per run" : "not exposed"}
                    </span>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : "Create preset"}
        </button>
        {state.message ? (
          <span className={`text-xs ${state.ok ? "text-ok" : "text-bad"}`}>{state.message}</span>
        ) : null}
      </div>
    </form>
  );
}
