"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { submitGenerationAction, type ActionState } from "@/lib/actions";
import { IMAGE_MODELS, type FieldDef, type ModelDef } from "@/lib/kie/models";
import type { BrandPreset, Campaign } from "@/lib/db/queries";

type CampaignRow = Campaign & { spent: string; generation_count: string };

const INITIAL: ActionState = { ok: false, message: "" };

export function GenerateForm({
  presets,
  campaigns,
}: {
  presets: BrandPreset[];
  campaigns: CampaignRow[];
}) {
  const [state, action, pending] = useActionState(submitGenerationAction, INITIAL);
  const [presetId, setPresetId] = useState("");
  const [modelSlug, setModelSlug] = useState(IMAGE_MODELS[0].slug);
  const [prompt, setPrompt] = useState("");

  const preset = presets.find((p) => p.id === presetId) ?? null;
  const model: ModelDef =
    IMAGE_MODELS.find((m) => m.slug === (preset?.model ?? modelSlug)) ?? IMAGE_MODELS[0];

  const editable = useMemo(() => {
    if (!preset) return new Set(model.fields.map((f) => f.key));
    return new Set(preset.editable_params ?? []);
  }, [preset, model]);

  const lockedParams = (preset?.locked_params ?? {}) as Record<string, unknown>;

  const resolvedPreview = [
    preset?.locked_prefix?.trim(),
    prompt.trim(),
    preset?.locked_suffix?.trim(),
    preset?.negative_prompt?.trim() ? `Avoid: ${preset.negative_prompt.trim()}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const promptField = model.fields.find((f) => f.key === "prompt");
  const maxLen = promptField && promptField.type === "text" ? promptField.max : undefined;
  const overLimit = Boolean(maxLen && resolvedPreview.length > maxLen);

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-5">
        {/* Preset + campaign */}
        <div className="panel p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="presetId">
                Brand preset
              </label>
              <select
                id="presetId"
                name="presetId"
                className="field mt-1.5"
                value={presetId}
                onChange={(e) => setPresetId(e.target.value)}
              >
                <option value="">None — full manual control</option>
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="campaignId">
                Campaign
              </label>
              <select id="campaignId" name="campaignId" className="field mt-1.5">
                <option value="">None — no budget check</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.budget_credits
                      ? ` — ${Number(c.spent).toFixed(1)}/${Number(c.budget_credits).toFixed(0)}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="label" htmlFor="model">
              Model
            </label>
            <select
              id="model"
              name="model"
              className="field mt-1.5"
              value={model.slug}
              disabled={Boolean(preset)}
              onChange={(e) => setModelSlug(e.target.value)}
            >
              {IMAGE_MODELS.map((m) => (
                <option key={m.slug} value={m.slug}>
                  {m.label}
                </option>
              ))}
            </select>
            {preset ? (
              <p className="lock-badge mt-1.5">▪ locked by preset “{preset.name}”</p>
            ) : (
              <p className="mt-1.5 text-xs text-faint">
                <a href={model.docs} target="_blank" rel="noreferrer" className="hover:text-muted">
                  {model.slug} ↗
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Prompt */}
        <div className="panel p-5">
          <label className="label" htmlFor="prompt">
            Prompt
          </label>

          {preset?.locked_prefix ? (
            <div className="mt-2 rounded-t-lg border border-b-0 border-line bg-panel-2 px-3 py-2">
              <p className="lock-badge mb-1">▪ locked prefix</p>
              <p className="font-mono text-xs text-muted">{preset.locked_prefix}</p>
            </div>
          ) : null}

          <textarea
            id="prompt"
            name="prompt"
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the creative. Locked brand language is applied automatically."
            className={`field font-mono text-sm ${preset?.locked_prefix ? "rounded-t-none" : ""} ${
              preset?.locked_suffix || preset?.negative_prompt ? "rounded-b-none" : ""
            }`}
          />

          {preset?.locked_suffix || preset?.negative_prompt ? (
            <div className="rounded-b-lg border border-t-0 border-line bg-panel-2 px-3 py-2">
              {preset.locked_suffix ? (
                <>
                  <p className="lock-badge mb-1">▪ locked suffix</p>
                  <p className="font-mono text-xs text-muted">{preset.locked_suffix}</p>
                </>
              ) : null}
              {preset.negative_prompt ? (
                <p className="mt-1 font-mono text-xs text-faint">
                  Avoid: {preset.negative_prompt}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-3 flex items-center justify-between">
            <span className="label">Resolved · {resolvedPreview.length} chars</span>
            {maxLen ? (
              <span className={`font-mono text-xs ${overLimit ? "text-bad" : "text-faint"}`}>
                limit {maxLen.toLocaleString()}
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 rounded-lg border border-line bg-base p-3 font-mono text-xs leading-relaxed text-muted">
            {resolvedPreview || <span className="text-faint">Nothing yet.</span>}
          </p>
        </div>

        {/* Parameters */}
        <div className="panel p-5">
          <div className="label mb-3">Parameters</div>
          <div className="grid gap-4 sm:grid-cols-2">
            {model.fields
              .filter((f) => f.key !== "prompt")
              .map((f) => (
                <ParamControl
                  key={f.key}
                  field={f}
                  locked={f.key in lockedParams}
                  lockedValue={lockedParams[f.key]}
                  editable={editable.has(f.key)}
                  presetName={preset?.name}
                />
              ))}
          </div>
        </div>
      </div>

      {/* Submit rail */}
      <aside className="space-y-4">
        <div className="panel sticky top-20 p-5">
          <div className="label">Submit</div>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            The job is recorded before it is sent, so a failed submit still appears in the queue.
          </p>

          <button
            type="submit"
            disabled={pending || overLimit}
            className="btn btn-primary mt-4 w-full"
          >
            {pending ? "Submitting…" : "Generate"}
          </button>

          {overLimit ? (
            <p className="mt-2 text-xs text-bad">Resolved prompt exceeds the model limit.</p>
          ) : null}

          {state.message ? (
            <div
              className={`mt-4 rounded-lg border p-3 text-xs ${
                state.ok
                  ? "border-[rgba(74,222,128,0.3)] text-ok"
                  : "border-[rgba(248,113,113,0.3)] text-bad"
              }`}
            >
              {state.message}
              {state.ok && state.id ? (
                <Link href={`/jobs/${state.id}`} className="mt-2 block underline">
                  Open job →
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </aside>
    </form>
  );
}

function ParamControl({
  field,
  locked,
  lockedValue,
  editable,
  presetName,
}: {
  field: FieldDef;
  locked: boolean;
  lockedValue: unknown;
  editable: boolean;
  presetName?: string;
}) {
  const disabled = locked || !editable;
  const name = `p_${field.key}`;

  return (
    <div>
      <label className="label" htmlFor={name}>
        {field.label}
      </label>

      {locked ? (
        <>
          <input className="field mt-1.5" value={String(lockedValue)} disabled readOnly />
          <p className="lock-badge mt-1">▪ locked by {presetName ?? "preset"}</p>
        </>
      ) : !editable ? (
        <>
          <input className="field mt-1.5" value="model default" disabled readOnly />
          <p className="lock-badge mt-1">▪ not exposed</p>
        </>
      ) : field.type === "select" ? (
        <select id={name} name={name} className="field mt-1.5" defaultValue={field.default}>
          {field.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : field.type === "boolean" ? (
        <select id={name} name={name} className="field mt-1.5" defaultValue={String(field.default ?? false)}>
          <option value="false">off</option>
          <option value="true">on</option>
        </select>
      ) : field.type === "number" ? (
        <input
          id={name}
          name={name}
          type="number"
          min={field.min}
          max={field.max}
          defaultValue={field.default}
          className="field mt-1.5"
        />
      ) : field.type === "urls" ? (
        <textarea
          id={name}
          name={name}
          rows={2}
          placeholder="https://… (one per line)"
          className="field mt-1.5 font-mono text-xs"
        />
      ) : (
        <input id={name} name={name} className="field mt-1.5" disabled={disabled} />
      )}

      {field.help && editable && !locked ? (
        <p className="mt-1 text-xs text-faint">{field.help}</p>
      ) : null}
    </div>
  );
}
