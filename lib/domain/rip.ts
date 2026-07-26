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
 * Anchors the render to the real product.
 *
 * Without this the model reads the concept as a description and invents a
 * plausible-looking product to fill the hero slot — the reference photos are
 * the difference between an ad for your product and an ad for something that
 * resembles it.
 */
function productAnchor(name: string, refCount: number) {
  if (refCount === 0) return "";
  const noun = refCount === 1 ? "The attached reference image shows" : `The ${refCount} attached reference images show`;
  return [
    `${noun} the actual product: ${name}.`,
    "Render that exact product as the hero — same shape, proportions, materials,",
    "packaging, label artwork and brand colours as the reference. Do not redesign",
    "it, restyle its packaging, or substitute a lookalike.",
    "Apply the scene, palette, lighting and composition described above around it.",
    "The only legible text may be what already exists on the product itself; add",
    "no headlines, captions, logos or lettering of your own.",
  ].join(" ");
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

  const operatorPrompt = [concept.visual_prompt.trim(), productAnchor(product?.name ?? "", referenceImages.length)]
    .filter(Boolean)
    .join("\n\n");

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
