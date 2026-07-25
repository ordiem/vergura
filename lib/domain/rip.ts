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
 * Approves a concept and submits it for generation.
 *
 * The concept's visual prompt becomes the operator prompt, so the product's
 * brand preset still applies its locked segments on top — a concept cannot
 * escape brand control just because a model wrote it.
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

  const res = await submitGeneration({
    campaignId: args.campaignId ?? rip?.campaign_id ?? null,
    presetId: product?.preset_id ?? null,
    modelSlug: "nano-banana-2",
    operatorPrompt: concept.visual_prompt,
    operatorParams: {},
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
