/**
 * Registry of KIE image models used for static creatives.
 *
 * Field definitions are transcribed from the per-model pages on docs.kie.ai.
 * They drive three things at once: the generation form controls, server-side
 * validation, and which keys a brand preset is allowed to lock.
 *
 * `estCredits` is an operator-supplied planning figure used for the budget
 * pre-check only — actual spend always comes back from KIE as creditsConsumed.
 */

export type FieldDef =
  | { key: string; label: string; type: "text"; max?: number; required?: boolean; help?: string }
  | { key: string; label: string; type: "select"; options: string[]; default?: string; help?: string }
  | { key: string; label: string; type: "number"; min?: number; max?: number; default?: number; help?: string }
  | { key: string; label: string; type: "boolean"; default?: boolean; help?: string }
  | { key: string; label: string; type: "urls"; max?: number; help?: string };

export type ModelDef = {
  slug: string;
  label: string;
  kind: "image";
  /** Legacy models use a bespoke endpoint instead of /jobs/createTask. */
  transport: "jobs";
  fields: FieldDef[];
  estCredits: number;
  docs: string;
};

export const IMAGE_MODELS: ModelDef[] = [
  {
    slug: "bytedance/seedream-v4-text-to-image",
    label: "Seedream 4.0 — Text to Image",
    kind: "image",
    transport: "jobs",
    estCredits: 1,
    docs: "https://docs.kie.ai/market/seedream/seedream-v4-text-to-image",
    fields: [
      { key: "prompt", label: "Prompt", type: "text", max: 5000, required: true },
      {
        key: "image_size",
        label: "Aspect",
        type: "select",
        default: "square_hd",
        options: [
          "square",
          "square_hd",
          "portrait_4_3",
          "portrait_3_2",
          "portrait_16_9",
          "landscape_4_3",
          "landscape_3_2",
          "landscape_16_9",
          "landscape_21_9",
        ],
      },
      { key: "image_resolution", label: "Resolution", type: "select", default: "1K", options: ["1K", "2K", "4K"] },
      { key: "max_images", label: "Variations", type: "number", min: 1, max: 6, default: 1 },
      { key: "seed", label: "Seed", type: "number", help: "Leave blank for random. Set to reproduce a result." },
      { key: "nsfw_checker", label: "NSFW check", type: "boolean", default: false },
    ],
  },
  {
    slug: "nano-banana-2",
    label: "Google Nano Banana 2",
    kind: "image",
    transport: "jobs",
    estCredits: 1,
    docs: "https://docs.kie.ai/market/google/nanobanana2",
    fields: [
      { key: "prompt", label: "Prompt", type: "text", max: 20000, required: true },
      {
        key: "image_input",
        label: "Reference images",
        type: "urls",
        max: 14,
        help: "Up to 14 JPEG/PNG/WebP URLs, 30MB each.",
      },
      {
        key: "aspect_ratio",
        label: "Aspect",
        type: "select",
        default: "auto",
        options: ["auto", "1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9", "1:4", "4:1", "1:8", "8:1"],
      },
      { key: "resolution", label: "Resolution", type: "select", default: "1K", options: ["1K", "2K", "4K"] },
      { key: "output_format", label: "Format", type: "select", default: "jpg", options: ["jpg", "png"] },
    ],
  },
  {
    slug: "grok-imagine/image-to-image",
    label: "Grok Imagine — Image to Image",
    kind: "image",
    transport: "jobs",
    estCredits: 1,
    docs: "https://docs.kie.ai/market/grok-imagine/image-to-image",
    fields: [
      { key: "prompt", label: "Prompt", type: "text", max: 390000 },
      { key: "image_urls", label: "Source image", type: "urls", max: 1, help: "Exactly one JPEG/PNG/WebP URL, max 10MB." },
      { key: "nsfw_checker", label: "NSFW check", type: "boolean", default: false },
    ],
  },
];

export const modelBySlug = (slug: string) => IMAGE_MODELS.find((m) => m.slug === slug) ?? null;

export function defaultInput(model: ModelDef): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of model.fields) {
    if ("default" in f && f.default !== undefined) out[f.key] = f.default;
  }
  return out;
}

/** Strips keys the model does not declare, so we never post unknown fields. */
export function pickKnownFields(model: ModelDef, input: Record<string, unknown>) {
  const allowed = new Set(model.fields.map((f) => f.key));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (!allowed.has(k)) continue;
    if (v === "" || v === null || v === undefined) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out;
}
