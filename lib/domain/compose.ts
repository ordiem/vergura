import { modelBySlug, pickKnownFields, type ModelDef } from "@/lib/kie/models";
import type { BrandPreset } from "@/lib/db/queries";

export type ComposeResult = {
  model: ModelDef;
  resolvedPrompt: string;
  input: Record<string, unknown>;
  /** Keys the operator was not allowed to set, reported back for transparency. */
  rejectedKeys: string[];
};

export class ComposeError extends Error {}

/**
 * Merges an operator's request with a brand preset.
 *
 * Precedence, strongest last:
 *   model defaults  ->  operator params (only if whitelisted)  ->  locked_params
 *
 * The preset's model always wins; an operator cannot switch models. When no
 * preset is attached the operator has full control of the declared fields.
 */
export function compose(args: {
  preset: BrandPreset | null;
  modelSlug: string;
  operatorPrompt: string;
  operatorParams: Record<string, unknown>;
}): ComposeResult {
  const slug = args.preset?.model ?? args.modelSlug;
  const model = modelBySlug(slug);
  if (!model) throw new ComposeError(`Unknown model: ${slug}`);

  const promptFieldRaw = model.fields.find((f) => f.key === "prompt");
  const promptField = promptFieldRaw?.type === "text" ? promptFieldRaw : undefined;
  const operatorPrompt = args.operatorPrompt.trim();

  const preset = args.preset;
  const rejectedKeys: string[] = [];

  // 1. Prompt assembly — locked segments bracket the operator's text.
  const segments = [
    preset?.locked_prefix?.trim(),
    operatorPrompt,
    preset?.locked_suffix?.trim(),
  ].filter((s): s is string => Boolean(s && s.length));

  // No model in the image registry exposes a negative_prompt field, so a
  // preset's negative prompt is folded into the prompt text instead of being
  // silently dropped.
  const negative = preset?.negative_prompt?.trim();
  if (negative) segments.push(`Avoid: ${negative}`);

  const resolvedPrompt = segments.join(" ");

  if (promptField?.required && !resolvedPrompt) {
    throw new ComposeError("Prompt is empty after applying the preset.");
  }
  if (promptField?.max && resolvedPrompt.length > promptField.max) {
    throw new ComposeError(
      `Resolved prompt is ${resolvedPrompt.length} chars; ${model.label} allows ${promptField.max}.`
    );
  }

  // 2. Parameters.
  const allowed = preset ? new Set(preset.editable_params ?? []) : null;
  const operatorClean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(args.operatorParams ?? {})) {
    if (k === "prompt") continue;
    if (allowed && !allowed.has(k)) {
      rejectedKeys.push(k);
      continue;
    }
    operatorClean[k] = v;
  }

  const merged: Record<string, unknown> = {
    ...operatorClean,
    ...(preset?.locked_params ?? {}),
    prompt: resolvedPrompt,
  };

  const input = coerce(model, pickKnownFields(model, merged));
  validate(model, input);

  return { model, resolvedPrompt, input, rejectedKeys };
}

/** Form values arrive as strings; the API is typed. */
function coerce(model: ModelDef, input: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const f of model.fields) {
    if (!(f.key in input)) continue;
    const v = input[f.key];
    switch (f.type) {
      case "number": {
        const n = typeof v === "number" ? v : Number(String(v).trim());
        if (Number.isFinite(n)) out[f.key] = n;
        break;
      }
      case "boolean":
        out[f.key] = v === true || v === "true" || v === "on";
        break;
      case "urls": {
        const arr = Array.isArray(v)
          ? v.map(String)
          : String(v)
              .split(/[\n,]/)
              .map((s) => s.trim());
        const urls = arr.filter((s) => /^https?:\/\//.test(s));
        if (urls.length) out[f.key] = urls;
        break;
      }
      default:
        out[f.key] = typeof v === "string" ? v : String(v);
    }
  }
  return out;
}

function validate(model: ModelDef, input: Record<string, unknown>) {
  for (const f of model.fields) {
    const v = input[f.key];
    if (v === undefined) {
      if (f.type === "text" && f.required) throw new ComposeError(`${f.label} is required.`);
      if (f.type === "urls" && f.key === "image_urls") {
        throw new ComposeError(`${model.label} requires ${f.label}.`);
      }
      continue;
    }
    if (f.type === "select" && !f.options.includes(String(v))) {
      throw new ComposeError(`${f.label} must be one of: ${f.options.join(", ")}.`);
    }
    if (f.type === "number") {
      const n = Number(v);
      if (f.min !== undefined && n < f.min) throw new ComposeError(`${f.label} must be ≥ ${f.min}.`);
      if (f.max !== undefined && n > f.max) throw new ComposeError(`${f.label} must be ≤ ${f.max}.`);
    }
    if (f.type === "urls" && f.max && Array.isArray(v) && v.length > f.max) {
      throw new ComposeError(`${f.label} accepts at most ${f.max}.`);
    }
  }
}

/** Planning estimate only — real spend comes back as creditsConsumed. */
export function estimateCredits(model: ModelDef, input: Record<string, unknown>) {
  const n = Number(input.max_images ?? 1);
  const variations = Number.isFinite(n) && n > 0 ? n : 1;
  const res = String(input.image_resolution ?? input.resolution ?? "1K");
  const resMultiplier = res === "4K" ? 4 : res === "2K" ? 2 : 1;
  return Number((model.estCredits * variations * resMultiplier).toFixed(4));
}
