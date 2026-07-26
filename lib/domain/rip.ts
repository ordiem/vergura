import "server-only";
import { analyseReference, draftConcepts, analysisModelName } from "@/lib/analysis/provider";
import { submitGeneration } from "./submit";
import {
  createRip,
  failAnalysis,
  getConcept,
  getProduct,
  getRef,
  insertConcepts,
  saveAnalysis,
  setConceptStatus,
} from "@/lib/db/rip-queries";

export class RipError extends Error {}

/** Reads a reference ad and stores the structured result. */
export async function analyseRef(refId: string) {
  const ref = await getRef(refId);
  if (!ref) throw new RipError("Reference not found.");

  try {
    const analysis = await analyseReference(ref.source_url);
    await saveAnalysis(refId, analysis, analysisModelName());
    return analysis;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Analysis failed.";
    await failAnalysis(refId, msg);
    throw new RipError(msg);
  }
}

/**
 * The rip itself: an analysed reference translated onto a product as N
 * concepts. Nothing generates here — concepts are proposals awaiting approval.
 */
export async function runRip(args: {
  refId: string;
  productId: string;
  campaignId: string | null;
  variantCount: number;
}) {
  const [ref, product] = await Promise.all([
    getRef(args.refId),
    getProduct(args.productId),
  ]);
  if (!ref) throw new RipError("Reference not found.");
  if (!product) throw new RipError("Product not found.");
  if (!ref.analysis) {
    throw new RipError("Analyse the reference before ripping it.");
  }

  const rip = await createRip({
    ref_id: ref.id,
    product_id: product.id,
    campaign_id: args.campaignId,
    variant_count: args.variantCount,
    model: analysisModelName(),
  });

  const drafts = await draftConcepts({
    analysis: ref.analysis,
    productName: product.name,
    productDescription: product.description,
    brandNotes: product.brand_notes,
    productImageUrls: product.images.map((i) => i.url),
    variantCount: args.variantCount,
  });

  if (drafts.length === 0) throw new RipError("The model returned no concepts.");
  await insertConcepts(rip.id, drafts);
  return { ripId: rip.id, count: drafts.length };
}

/**
 * Assembles what the image model actually receives.
 *
 * Two failures to prevent, and they pull in opposite directions.
 *
 * With no reference photos the model invents a plausible-looking product to
 * fill the hero slot, and the ad sells something that merely resembles yours.
 *
 * With reference photos and no framing, it does the opposite: it treats the
 * packshot as the shot to adjust and hands back that same photograph with
 * props added — one unit, same crop, same background — silently discarding the
 * concept's composition. That is fatal when the mechanic depends on staging,
 * which for offer ads it usually does: a bundle you cannot count is not a
 * bundle. Observed live, so the role of the photos is stated before the scene
 * rather than after it, and copying their layout is ruled out explicitly.
 */
export function buildRenderPrompt(args: {
  visualPrompt: string;
  productName: string;
  refCount: number;
}) {
  const scene = args.visualPrompt.trim();
  if (args.refCount === 0) return scene;

  const noun =
    args.refCount === 1
      ? "The attached photograph is a product reference"
      : `The ${args.refCount} attached photographs are product references`;

  return [
    `${noun} for ${args.productName}. They define one thing only: what the ` +
      "product itself looks like — its shape, proportions, materials, packaging " +
      "and label artwork. Reproduce those exactly. Never redesign the packaging, " +
      "restyle the label, or substitute a lookalike.",
    "They are NOT a layout to imitate. Ignore their framing, camera angle, crop, " +
      "background, lighting and the number of units they happen to show. Build a " +
      "new photograph from scratch to the brief below, and follow its staging " +
      "literally — if it calls for several units, render exactly that many; if it " +
      "places them at a particular angle or depth, honour it.",
    `THE PHOTOGRAPH TO BUILD:\n\n${scene}`,
    "The only legible text anywhere in the frame is the product's own printed " +
      "packaging, exactly as photographed. Add no headlines, captions, price " +
      "badges, stickers, logos or lettering of any kind.",
  ].join("\n\n");
}

/**
 * Approves a concept and submits it for generation.
 *
 * The concept's visual prompt becomes the operator prompt, so the product's
 * brand preset still applies its locked segments on top — a concept cannot
 * escape brand control just because a model wrote it. The product's own
 * photography rides along as reference images so the scene is built around the
 * real thing.
 */
export async function generateFromConcept(args: {
  conceptId: string;
  campaignId: string | null;
}) {
  const concept = await getConcept(args.conceptId);
  if (!concept) throw new RipError("Concept not found.");
  if (concept.status === "rejected") {
    throw new RipError("This concept was rejected.");
  }
  if (!concept.visual_prompt.trim()) {
    throw new RipError("This concept has no visual prompt.");
  }

  const rip = await import("@/lib/db/rip-queries").then((m) => m.getRip(concept.rip_id));
  const product = rip?.product_id ? await getProduct(rip.product_id) : null;
  const referenceImages = (product?.images ?? []).map((i) => i.url);

  const operatorPrompt = buildRenderPrompt({
    visualPrompt: concept.visual_prompt,
    productName: product?.name ?? "",
    refCount: referenceImages.length,
  });

  const res = await submitGeneration({
    campaignId: args.campaignId ?? rip?.campaign_id ?? null,
    presetId: product?.preset_id ?? null,
    modelSlug: "nano-banana-2",
    operatorPrompt,
    operatorParams: {},
    referenceImages,
  });

  await setConceptStatus(args.conceptId, "generated");
  await linkGeneration(res.id, concept.id);
  return res;
}

async function linkGeneration(generationId: string, conceptId: string) {
  const { requireDb } = await import("@/lib/db/client");
  const sql = requireDb();
  await sql`update generations set concept_id = ${conceptId} where id = ${generationId}`;
}
