/**
 * Structured output of reading a reference ad, and of translating it onto a
 * product. Pure types + prompt construction — no provider, no server-only, so
 * this stays testable.
 */

export type AnalysisResult = {
  /** Every piece of text legible in the ad, in reading order. */
  detected_text: string[];
  /** The single transferable insight, in one sentence. */
  big_idea: string;
  /** Why it works — the persuasion mechanics, not a description. */
  why_it_works: string[];
  /** Named format, e.g. "problem-agitate-solution", "before/after split". */
  format: string;
  /** Visual construction: layout, focal hierarchy, colour, type treatment. */
  visual_notes: string[];
  /**
   * The colour system, named concretely enough to rebuild ("deep navy ground,
   * warm cream product, single amber accent"). Optional: analyses stored before
   * this field existed do not have it.
   */
  palette?: string[];
  /** Lighting and camera: key direction, hardness, lens feel, framing. */
  lighting?: string;
  /** Who it is speaking to. */
  audience: string;
  /** Emotional register, e.g. "urgent", "clinical", "playful". */
  tone: string;
};

export type ConceptDraft = {
  angle: string;
  big_idea: string;
  rationale: string;
  headline: string;
  subhead: string;
  cta: string;
  body_copy: string;
  visual_prompt: string;
};

export const ANALYSIS_SHAPE = `{
  "detected_text": ["string, every legible line in reading order"],
  "big_idea": "one sentence, the transferable insight",
  "why_it_works": ["persuasion mechanics, 3-5 items"],
  "format": "named ad format",
  "visual_notes": ["layout, focal hierarchy, colour, type treatment"],
  "palette": ["named colours concrete enough to rebuild the scene"],
  "lighting": "key direction, hardness, lens feel, framing",
  "audience": "who this speaks to",
  "tone": "emotional register"
}`;

export const CONCEPT_SHAPE = `{
  "angle": "short label for this direction",
  "big_idea": "the reference's idea, restated for this product",
  "rationale": "why this carries the original mechanic across",
  "headline": "primary line, under 60 chars",
  "subhead": "supporting line, may be empty",
  "cta": "call to action, 2-4 words",
  "body_copy": "optional supporting sentence, may be empty",
  "visual_prompt": "image prompt: NO text, NO lettering, NO typography"
}`;

export function analysisPrompt() {
  return [
    "You are a direct-response creative strategist analysing a static ad.",
    "Read every piece of text in the image, then explain the persuasion mechanics —",
    "not what the ad looks like, but why it converts.",
    "",
    "Record the visual system precisely enough that another art director could",
    "rebuild the look around a completely different product: name the actual",
    "colours, where the light comes from and how hard it is, the lens and framing,",
    "and how the frame is divided. Vague notes like \"clean and modern\" are useless;",
    "\"deep navy ground, single warm key from upper left, hard shadow, 85mm at eye",
    "level, product on the lower-third line\" is what is wanted.",
    "",
    "Respond with ONLY a JSON object in exactly this shape, no prose, no code fence:",
    ANALYSIS_SHAPE,
  ].join("\n");
}

export function conceptPrompt(args: {
  analysis: AnalysisResult;
  productName: string;
  productDescription: string;
  brandNotes: string;
  variantCount: number;
}) {
  const a = args.analysis;
  return [
    "You are translating the STRATEGY of a proven ad onto a different product.",
    "",
    "THE REFERENCE AD — what makes it work:",
    `  Big idea:   ${a.big_idea}`,
    `  Format:     ${a.format}`,
    `  Audience:   ${a.audience}`,
    `  Tone:       ${a.tone}`,
    "  Mechanics:",
    ...(a.why_it_works ?? []).map((w) => `    - ${w}`),
    "  Visual construction:",
    ...(a.visual_notes ?? []).map((v) => `    - ${v}`),
    a.palette?.length ? `  Palette:    ${a.palette.join(", ")}` : "",
    a.lighting ? `  Light/lens: ${a.lighting}` : "",
    a.detected_text?.length
      ? `  Its copy (for reference only — do NOT reuse these words): ${a.detected_text.join(" / ")}`
      : "",
    "",
    "THE PRODUCT THIS MUST NOW SELL:",
    `  Name:        ${args.productName}`,
    `  What it is:  ${args.productDescription || "(not described)"}`,
    args.brandNotes ? `  Brand rules: ${args.brandNotes}` : "",
    "",
    "WHAT TRANSLATING THE ANGLE MEANS",
    "",
    "You are transferring the reference's persuasion MECHANIC, not its subject",
    "matter. The mechanic is the reusable part: what tension it creates, what",
    "objection it pre-empts, what order it reveals information in, where it puts",
    "the proof relative to the promise.",
    "",
    "Work in this order for each concept:",
    "  1. Name the specific mechanic you are transferring, in your own words.",
    "  2. Ask what the equivalent tension is for THIS product and THIS buyer.",
    "     The reference's category is irrelevant — only the mechanic transfers.",
    "  3. Write the concept so a reader who has never seen the reference would",
    "     find it native to this product, while the mechanic is still doing the",
    "     persuasive work.",
    "",
    "Put step 1 and 2 into the `rationale` field: name the mechanic, then say",
    "what it becomes for this product. A rationale that only restates the",
    "concept has failed.",
    "",
    "HARD CONSTRAINTS",
    "",
    "- Do NOT carry over the reference's product category, subject matter, props,",
    "  setting, or literal imagery. If the reference sells a supplement and this",
    "  product is furniture, nothing supplement-shaped may appear.",
    "- Do NOT reuse or lightly reword the reference's headline. Same mechanic,",
    "  different words, grounded in this product's own benefit.",
    "- Every claim must be one this product can actually make. Respect the brand",
    "  rules above as hard limits, not suggestions.",
    "",
    `Produce ${args.variantCount} concepts that transfer the mechanic through`,
    "genuinely different angles — vary which tension you pull on, not just the",
    "wording. Two concepts that could swap headlines are one concept.",
    "",
    "THE VISUAL PROMPT — TRANSLATING THE LOOK",
    "",
    "The product images attached to this message are the real product. The",
    "generator will be given those same photos as references, so write each",
    `\`visual_prompt\` as a scene built around ${args.productName} exactly as it`,
    "appears in them — never around a described stand-in, and never around the",
    "reference ad's product.",
    "",
    "Carry the reference's visual system across, concretely:",
    "  - Palette: reuse its colour relationships — ground, product, accent — named",
    "    as actual colours, adjusted only where they would fight the product's own",
    "    real colours or the brand rules.",
    "  - Light: same key direction, same hardness, same shadow behaviour.",
    "  - Composition: same focal hierarchy, same division of the frame, same",
    "    placement of the product relative to the empty space.",
    "  - Surface and setting: the same register of materials, re-chosen so they",
    "    belong to this product's world rather than the reference's.",
    "",
    "Write it as a specific, buildable scene, not adjectives. Say where the",
    "product sits, what it sits on, where the light comes from, what colour the",
    "ground is, how tight the crop is.",
    "",
    "Copy is set by a designer downstream and is never rendered by the image",
    "model. Every `visual_prompt` describes imagery ONLY, must leave clean",
    "negative space where the headline will sit, and must never instruct the model",
    "to draw text, letters, words, captions, logos, or typography — the product's",
    "own packaging is the sole exception, and it stays exactly as photographed.",
    "",
    `Respond with ONLY a JSON array of ${args.variantCount} objects, each shaped:`,
    CONCEPT_SHAPE,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Models wrap JSON in prose or fences despite instructions. Recover it. */
export function parseJsonLoose<T>(raw: string): T {
  const text = raw.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced ? fenced[1] : text).trim();

  try {
    return JSON.parse(candidate) as T;
  } catch {
    // Fall back to the outermost balanced array or object.
    for (const [open, close] of [
      ["[", "]"],
      ["{", "}"],
    ] as const) {
      const start = candidate.indexOf(open);
      const end = candidate.lastIndexOf(close);
      if (start !== -1 && end > start) {
        try {
          return JSON.parse(candidate.slice(start, end + 1)) as T;
        } catch {
          /* try the next shape */
        }
      }
    }
    throw new Error(`Model did not return valid JSON. Got: ${text.slice(0, 200)}`);
  }
}

/** Belt-and-braces: strip text instructions a model may still emit. */
export function stripTextDirectives(prompt: string) {
  return prompt
    .replace(
      /\b(with|showing|displaying|featuring|include[sd]?|render(?:ing|ed)?|add(?:ing)?)\s+(the\s+)?(headline|text|copy|type|typography|lettering|words?|caption|logo)\b[^.;]*/gi,
      ""
    )
    .replace(/\s{2,}/g, " ")
    .trim();
}
