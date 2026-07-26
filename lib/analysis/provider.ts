import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { kieChat, KieAuthError } from "./kie-chat";
import {
  analysisPrompt,
  conceptPrompt,
  parseJsonLoose,
  stripTextDirectives,
  type AnalysisResult,
  type ConceptDraft,
} from "./types";

/**
 * Vision + reasoning provider for the RIP pipeline.
 *
 * Reading text off a reference ad and explaining why it converts is a
 * vision-LLM task, not a generation task, so it does not go through KIE.
 * KIE does expose /api/v1/chat/completions, but probing it with the project's
 * key returned "Operation not found" for every candidate model slug, so that
 * route is unavailable here.
 *
 * Falls back to a mock so the whole RIP flow is explorable without a key.
 */

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5";

export type AnalysisDriver = "anthropic" | "kie" | "mock";

/**
 * Explicit ANALYSIS_DRIVER wins. Otherwise prefer a direct Anthropic key,
 * then KIE (which needs Claude enabled on the key), then the mock.
 *
 * KIE is not auto-selected on the KIE key alone: that key is commonly not
 * entitled to Claude, and silently routing there turns a config gap into a
 * runtime 401 mid-workflow.
 */
export function analysisDriver(): AnalysisDriver {
  const explicit = process.env.ANALYSIS_DRIVER;
  if (explicit === "anthropic" || explicit === "kie" || explicit === "mock") {
    return explicit;
  }
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "mock";
}

export const isAnalysisConfigured = () => analysisDriver() !== "mock";
export const isAnalysisMock = () => analysisDriver() === "mock";

export const analysisModelName = () => {
  const d = analysisDriver();
  if (d === "mock") return "mock";
  if (d === "kie") return `${process.env.KIE_ANALYSIS_MODEL ?? "claude-sonnet-5"} (via KIE)`;
  return MODEL;
};

class RefusalError extends Error {}

export { KieAuthError };

function client() {
  return new Anthropic(); // reads ANTHROPIC_API_KEY from the environment
}

const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    detected_text: { type: "array", items: { type: "string" } },
    big_idea: { type: "string" },
    why_it_works: { type: "array", items: { type: "string" } },
    format: { type: "string" },
    visual_notes: { type: "array", items: { type: "string" } },
    palette: { type: "array", items: { type: "string" } },
    lighting: { type: "string" },
    audience: { type: "string" },
    tone: { type: "string" },
  },
  required: [
    "detected_text",
    "big_idea",
    "why_it_works",
    "format",
    "visual_notes",
    "palette",
    "lighting",
    "audience",
    "tone",
  ],
  additionalProperties: false,
} as const;

const CONCEPTS_SCHEMA = {
  type: "object",
  properties: {
    concepts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          angle: { type: "string" },
          big_idea: { type: "string" },
          rationale: { type: "string" },
          headline: { type: "string" },
          subhead: { type: "string" },
          cta: { type: "string" },
          body_copy: { type: "string" },
          visual_prompt: { type: "string" },
        },
        required: [
          "angle",
          "big_idea",
          "rationale",
          "headline",
          "subhead",
          "cta",
          "body_copy",
          "visual_prompt",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["concepts"],
  additionalProperties: false,
} as const;

/** Shared call path: structured JSON out, refusal surfaced as a real error. */
async function ask(
  content: Anthropic.ContentBlockParam[],
  schema: Record<string, unknown>
): Promise<string> {
  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 16000,
    output_config: { format: { type: "json_schema", schema } },
    messages: [{ role: "user", content }],
  });

  // Opus 5 safety classifiers can decline; content is empty or partial.
  if (res.stop_reason === "refusal") {
    throw new RefusalError(
      `The analysis model declined this image${
        res.stop_details?.category ? ` (${res.stop_details.category})` : ""
      }.`
    );
  }

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  if (!text) throw new Error("Analysis model returned no text.");
  return text;
}

/** Reads a reference ad: its copy, its big idea, and why it converts. */
export async function analyseReference(imageUrl: string): Promise<AnalysisResult> {
  const driver = analysisDriver();
  if (driver === "mock") return mockAnalysis(imageUrl);

  if (driver === "kie") {
    const raw = await kieChat({
      prompt: `${analysisPrompt()}\n\nReturn ONLY the JSON object.`,
      imageUrls: [imageUrl],
    });
    return parseJsonLoose<AnalysisResult>(raw);
  }

  const text = await ask(
    [
      { type: "image", source: { type: "url", url: imageUrl } },
      { type: "text", text: analysisPrompt() },
    ],
    ANALYSIS_SCHEMA as unknown as Record<string, unknown>
  );
  return parseJsonLoose<AnalysisResult>(text);
}

/** Translates an analysed reference onto a product as N distinct concepts. */
export async function draftConcepts(args: {
  analysis: AnalysisResult;
  productName: string;
  productDescription: string;
  brandNotes: string;
  productImageUrls: string[];
  variantCount: number;
}): Promise<ConceptDraft[]> {
  const driver = analysisDriver();
  if (driver === "mock") return mockConcepts(args);

  if (driver === "kie") {
    const raw = await kieChat({
      prompt: `${conceptPrompt(args)}\n\nReturn ONLY a JSON object of the form {"concepts": [...]}.`,
      imageUrls: args.productImageUrls.slice(0, 8),
    });
    const p = parseJsonLoose<{ concepts: ConceptDraft[] }>(raw);
    return (p.concepts ?? []).map((c) => ({
      ...c,
      visual_prompt: stripTextDirectives(c.visual_prompt ?? ""),
    }));
  }

  const content: Anthropic.ContentBlockParam[] = [
    ...args.productImageUrls.slice(0, 8).map(
      (url): Anthropic.ContentBlockParam => ({
        type: "image",
        source: { type: "url", url },
      })
    ),
    { type: "text", text: conceptPrompt(args) },
  ];

  const text = await ask(
    content,
    CONCEPTS_SCHEMA as unknown as Record<string, unknown>
  );
  const parsed = parseJsonLoose<{ concepts: ConceptDraft[] }>(text);

  // Copy is set downstream by a designer — never rendered by the image model.
  return (parsed.concepts ?? []).map((c) => ({
    ...c,
    visual_prompt: stripTextDirectives(c.visual_prompt ?? ""),
  }));
}

/* ---------------------------- mock driver ---------------------------- */

function mockAnalysis(imageUrl: string): AnalysisResult {
  return {
    detected_text: ["SLEEP DEEPER", "Clinically tested magnesium", "Shop now"],
    big_idea:
      "Reframes a nightly ritual as a measurable performance upgrade rather than a comfort purchase.",
    why_it_works: [
      "Leads with the outcome the buyer wants, not the ingredient",
      "Single dominant focal point; no competing elements",
      "Proof claim sits directly beneath the promise, pre-empting scepticism",
      "CTA is low-commitment and sits in the natural terminal read position",
    ],
    format: "promise / proof / action stack",
    visual_notes: [
      "Product occupies the lower third; upper two thirds held as negative space",
      "Single warm key light from the upper left, long soft shadow",
      "Restrained two-colour palette keeps attention on the product",
    ],
    palette: [
      "deep ink-navy ground",
      "warm cream product surface",
      "single muted amber accent in the shadow",
    ],
    lighting:
      "single warm key from upper left at roughly 45 degrees, medium-hard, long soft-edged shadow falling right; 85mm at product height, tight-ish crop",
    audience: "Working adults who treat sleep as a performance input",
    tone: "calm, clinical, quietly confident",
    ...(imageUrl ? {} : {}),
  };
}

function mockConcepts(args: {
  productName: string;
  variantCount: number;
}): ConceptDraft[] {
  const angles = [
    {
      angle: "literal",
      headline: "Deeper Sleep. Sharper Mornings.",
      prompt:
        "the product centred on a smooth stone plinth, dawn light raking from the left, deep shadow, clean negative space across the upper third for a headline, muted palette",
    },
    {
      angle: "abstract",
      headline: "Rest Is A Discipline.",
      prompt:
        "extreme macro of the product surface against a dark seamless background, single hard rim light, generous empty space on the right for copy, minimal composition",
    },
    {
      angle: "lifestyle",
      headline: "The Part Of The Day You Own.",
      prompt:
        "the product on a linen bedside surface in soft pre-dawn window light, shallow depth of field, uncluttered frame with open space along the top edge for a headline",
    },
    {
      angle: "comparison",
      headline: "Same Hours. Better Sleep.",
      prompt:
        "split composition with the product isolated on the right half against a graduated backdrop, left half held as flat clean space for copy, even studio lighting",
    },
    {
      angle: "proof-led",
      headline: "Tested. Then Tested Again.",
      prompt:
        "clinical overhead flat lay of the product on a pale seamless surface, even diffuse lighting, wide margins on all sides for typography, restrained palette",
    },
  ];

  return angles.slice(0, Math.max(1, Math.min(5, args.variantCount))).map((a) => ({
    angle: a.angle,
    big_idea: `${args.productName} reframed as a measurable upgrade, via the ${a.angle} angle.`,
    rationale:
      "Carries the reference's promise/proof/action stack across, keeping the single dominant focal point and the terminal-position CTA.",
    headline: a.headline,
    subhead: "Clinically tested. Nightly.",
    cta: "Shop the bundle",
    body_copy: "",
    visual_prompt: a.prompt,
  }));
}
