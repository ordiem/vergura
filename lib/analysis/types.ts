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
  return [
    "You are translating a proven ad onto a different product.",
    "",
    "THE REFERENCE AD, ANALYSED:",
    JSON.stringify(args.analysis, null, 2),
    "",
    "THE PRODUCT TO TRANSLATE ONTO:",
    `Name: ${args.productName}`,
    `Description: ${args.productDescription}`,
    args.brandNotes ? `Brand rules that must be respected: ${args.brandNotes}` : "",
    "",
    `Produce ${args.variantCount} DISTINCT concepts that carry the reference's big idea`,
    "and persuasion mechanics onto this product. Vary the angle meaningfully —",
    "do not restate one idea three ways.",
    "",
    "CRITICAL CONSTRAINT ON visual_prompt:",
    "Copy is set downstream by a designer, never rendered by the image model.",
    "Each visual_prompt must describe imagery ONLY and must explicitly ask for",
    "clean negative space where the headline will sit. Never instruct the model",
    "to draw text, letters, words, logos, or typography.",
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
