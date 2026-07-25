"use server";

import { revalidatePath } from "next/cache";
import { submitGeneration, BudgetError } from "@/lib/domain/submit";
import { ComposeError } from "@/lib/domain/compose";
import {
  archivePreset,
  createCampaign,
  createPreset,
  getGeneration,
  setReview,
  type ReviewStatus,
} from "@/lib/db/queries";
import { modelBySlug } from "@/lib/kie/models";

export type ActionState = { ok: boolean; message: string; id?: string };

const fail = (message: string): ActionState => ({ ok: false, message });

function paramsFromForm(form: FormData) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of form.entries()) {
    if (!k.startsWith("p_")) continue;
    const key = k.slice(2);
    if (typeof v === "string" && v.trim() !== "") out[key] = v;
  }
  return out;
}

export async function submitGenerationAction(
  _prev: ActionState,
  form: FormData
): Promise<ActionState> {
  try {
    const presetId = String(form.get("presetId") ?? "") || null;
    const campaignId = String(form.get("campaignId") ?? "") || null;
    const modelSlug = String(form.get("model") ?? "");
    const prompt = String(form.get("prompt") ?? "");

    if (!presetId && !modelBySlug(modelSlug)) return fail("Choose a model or a preset.");

    const res = await submitGeneration({
      campaignId,
      presetId,
      modelSlug,
      operatorPrompt: prompt,
      operatorParams: paramsFromForm(form),
    });

    revalidatePath("/jobs");
    revalidatePath("/");
    const note = res.rejectedKeys.length
      ? ` Ignored locked field(s): ${res.rejectedKeys.join(", ")}.`
      : "";
    return { ok: true, message: `Submitted — ~${res.estCredits} credits.${note}`, id: res.id };
  } catch (err) {
    if (err instanceof BudgetError) return fail(`Budget block: ${err.message}`);
    if (err instanceof ComposeError) return fail(err.message);
    return fail(err instanceof Error ? err.message : "Submit failed.");
  }
}

export async function rerunAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const id = String(form.get("id") ?? "");
    const source = await getGeneration(id);
    if (!source) return fail("Generation not found.");

    const overridePrompt = String(form.get("prompt") ?? "").trim();

    const res = await submitGeneration({
      campaignId: source.campaign_id,
      presetId: source.preset_id,
      modelSlug: source.model,
      operatorPrompt: overridePrompt || source.operator_prompt,
      // Re-send the original resolved input minus the prompt; the preset
      // re-applies its locked segments on top.
      operatorParams: Object.fromEntries(
        Object.entries(source.input ?? {}).filter(([k]) => k !== "prompt")
      ),
      parentId: source.id,
      version: (source.version ?? 1) + 1,
    });

    revalidatePath("/jobs");
    revalidatePath(`/jobs/${id}`);
    return { ok: true, message: `Re-run submitted as v${(source.version ?? 1) + 1}.`, id: res.id };
  } catch (err) {
    if (err instanceof BudgetError) return fail(`Budget block: ${err.message}`);
    if (err instanceof ComposeError) return fail(err.message);
    return fail(err instanceof Error ? err.message : "Re-run failed.");
  }
}

export async function reviewAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const id = String(form.get("id") ?? "");
    const review = String(form.get("review") ?? "") as ReviewStatus;
    const note = String(form.get("note") ?? "");

    if (!["draft", "in_review", "approved", "rejected"].includes(review)) {
      return fail("Invalid review status.");
    }
    const gen = await getGeneration(id);
    if (!gen) return fail("Generation not found.");
    if (review === "approved" && gen.state !== "success") {
      return fail("Only a successful generation can be approved.");
    }

    await setReview(id, review, note);
    revalidatePath(`/jobs/${id}`);
    revalidatePath("/jobs");
    revalidatePath("/library");
    revalidatePath("/");
    return { ok: true, message: `Marked ${review.replace("_", " ")}.` };
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Review failed.");
  }
}

export async function createPresetAction(
  _prev: ActionState,
  form: FormData
): Promise<ActionState> {
  try {
    const name = String(form.get("name") ?? "").trim();
    const model = String(form.get("model") ?? "");
    if (!name) return fail("Name is required.");
    const def = modelBySlug(model);
    if (!def) return fail("Choose a valid model.");

    const lockedParams: Record<string, unknown> = {};
    const editable: string[] = [];
    for (const f of def.fields) {
      if (f.key === "prompt") continue;
      const mode = String(form.get(`mode_${f.key}`) ?? "free");
      const value = String(form.get(`lock_${f.key}`) ?? "").trim();
      if (mode === "locked" && value !== "") {
        lockedParams[f.key] =
          f.type === "number" ? Number(value) : f.type === "boolean" ? value === "true" : value;
      } else if (mode === "free") {
        editable.push(f.key);
      }
      // mode === "hidden": neither locked nor editable — model default applies.
    }

    const preset = await createPreset({
      name,
      description: String(form.get("description") ?? ""),
      model,
      locked_prefix: String(form.get("locked_prefix") ?? ""),
      locked_suffix: String(form.get("locked_suffix") ?? ""),
      negative_prompt: String(form.get("negative_prompt") ?? ""),
      locked_params: lockedParams,
      editable_params: editable,
    });

    revalidatePath("/presets");
    revalidatePath("/generate");
    return { ok: true, message: `Preset "${preset.name}" created.`, id: preset.id };
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Could not create preset.");
  }
}

export async function archivePresetAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await archivePreset(String(form.get("id") ?? ""));
    revalidatePath("/presets");
    return { ok: true, message: "Preset archived." };
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Could not archive.");
  }
}

export async function createCampaignAction(
  _prev: ActionState,
  form: FormData
): Promise<ActionState> {
  try {
    const name = String(form.get("name") ?? "").trim();
    if (!name) return fail("Name is required.");
    const raw = String(form.get("budget_credits") ?? "").trim();
    const budget = raw === "" ? null : Number(raw);
    if (budget !== null && (!Number.isFinite(budget) || budget < 0)) {
      return fail("Budget must be a positive number, or blank for uncapped.");
    }

    const c = await createCampaign({
      name,
      objective: String(form.get("objective") ?? ""),
      budget_credits: budget,
    });
    revalidatePath("/campaigns");
    revalidatePath("/generate");
    return { ok: true, message: `Campaign "${c.name}" created.`, id: c.id };
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Could not create campaign.");
  }
}
