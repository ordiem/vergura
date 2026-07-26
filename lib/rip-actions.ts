"use server";

import { revalidatePath } from "next/cache";
import { analyseRef, runRip, generateFromConcept, RipError } from "@/lib/domain/rip";
import { BudgetError } from "@/lib/domain/submit";
import {
  createBatch,
  createProduct,
  createRef,
  deleteConcept,
  deleteRip,
  setConceptStatus,
  updateConceptPrompt,
} from "@/lib/db/rip-queries";
import type { ActionState } from "@/lib/actions";

const fail = (message: string): ActionState => ({ ok: false, message });

function toMessage(err: unknown) {
  if (err instanceof BudgetError) return `Budget block: ${err.message}`;
  if (err instanceof RipError) return err.message;
  return err instanceof Error ? err.message : "Something went wrong.";
}

export async function createRefAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    const url = String(form.get("source_url") ?? "").trim();
    if (!/^https?:\/\//.test(url)) return fail("Upload an image or paste a valid URL.");
    const ref = await createRef(String(form.get("label") ?? "").trim(), url);
    revalidatePath("/rip");
    return { ok: true, message: "Reference saved. Analyse it next.", id: ref.id };
  } catch (err) {
    return fail(toMessage(err));
  }
}

export async function analyseRefAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    await analyseRef(String(form.get("id") ?? ""));
    revalidatePath("/rip");
    return { ok: true, message: "Analysed." };
  } catch (err) {
    return fail(toMessage(err));
  }
}

export async function createProductAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    const name = String(form.get("name") ?? "").trim();
    if (!name) return fail("Name is required.");
    const urls = String(form.get("image_urls") ?? "")
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => /^https?:\/\//.test(s));

    const p = await createProduct({
      name,
      description: String(form.get("description") ?? ""),
      brand_notes: String(form.get("brand_notes") ?? ""),
      preset_id: String(form.get("preset_id") ?? "") || null,
      imageUrls: urls,
    });
    revalidatePath("/products");
    revalidatePath("/rip");
    return { ok: true, message: `Product "${p.name}" saved.`, id: p.id };
  } catch (err) {
    return fail(toMessage(err));
  }
}

export async function runRipAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    const n = Number(form.get("variant_count") ?? 3);
    const res = await runRip({
      refId: String(form.get("ref_id") ?? ""),
      productId: String(form.get("product_id") ?? ""),
      campaignId: String(form.get("campaign_id") ?? "") || null,
      variantCount: Number.isFinite(n) ? Math.max(1, Math.min(5, n)) : 3,
    });
    revalidatePath("/rip");
    return { ok: true, message: `${res.count} concepts drafted.`, id: res.ripId };
  } catch (err) {
    return fail(toMessage(err));
  }
}

export async function conceptReviewAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    const id = String(form.get("id") ?? "");
    const action = String(form.get("action") ?? "");

    // Before the prompt write — there is no point saving an edit to a row we
    // are about to remove.
    if (action === "delete") {
      const outcome = await deleteConcept(id);
      revalidatePath("/rip");
      if (outcome === "generated") {
        return fail("Already generated — reject it instead so the job keeps its origin.");
      }
      if (outcome === "missing") return fail("That concept is already gone.");
      return { ok: true, message: "Concept deleted." };
    }

    const prompt = String(form.get("visual_prompt") ?? "").trim();
    if (prompt) await updateConceptPrompt(id, prompt);

    if (action === "reject") {
      await setConceptStatus(id, "rejected", String(form.get("note") ?? ""));
      revalidatePath("/rip");
      return { ok: true, message: "Concept rejected." };
    }

    if (action === "approve") {
      await setConceptStatus(id, "approved", String(form.get("note") ?? ""));
      revalidatePath("/rip");
      return { ok: true, message: "Approved. Generate when ready." };
    }

    if (action === "generate") {
      const res = await generateFromConcept({
        conceptId: id,
        campaignId: String(form.get("campaign_id") ?? "") || null,
      });
      revalidatePath("/rip");
      revalidatePath("/jobs");
      return { ok: true, message: `Submitted — ~${res.estCredits} credits.`, id: res.id };
    }

    if (action === "save") {
      revalidatePath("/rip");
      return { ok: true, message: "Prompt saved." };
    }

    return fail("Unknown action.");
  } catch (err) {
    return fail(toMessage(err));
  }
}

export async function deleteRipAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    const outcome = await deleteRip(String(form.get("id") ?? ""));
    revalidatePath("/rip");
    if (outcome === "generated") {
      return fail("This run has a generated concept — it stays on the record.");
    }
    if (outcome === "missing") return fail("That rip is already gone.");
    return { ok: true, message: "Rip deleted." };
  } catch (err) {
    return fail(toMessage(err));
  }
}

export async function createBatchAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    const name = String(form.get("name") ?? "").trim();
    if (!name) return fail("Name the batch.");
    const ids = form.getAll("asset").map(String).filter(Boolean);
    if (ids.length === 0) return fail("Select at least one approved asset.");

    const b = await createBatch(name, String(form.get("note") ?? ""), ids);
    revalidatePath("/batches");
    return { ok: true, message: `Batch "${b.name}" created.`, id: b.id };
  } catch (err) {
    return fail(toMessage(err));
  }
}
