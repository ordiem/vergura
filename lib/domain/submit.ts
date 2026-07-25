import "server-only";
import { compose, estimateCredits, ComposeError } from "./compose";
import { createTask, getTask } from "@/lib/kie/client";
import {
  applyTaskResult,
  attachTaskId,
  campaignBudget,
  createGeneration,
  getGeneration,
  getPreset,
  markFailed,
  pendingGenerations,
  type GenerationWithAssets,
} from "@/lib/db/queries";

export class BudgetError extends Error {}

function callbackUrl() {
  const base = process.env.PUBLIC_BASE_URL;
  if (!base) return undefined; // fall back to polling
  return `${base.replace(/\/$/, "")}/api/webhooks/kie`;
}

/**
 * Composes, budget-checks, persists, then submits to KIE.
 *
 * The row is written *before* the API call so a failed submit is still
 * visible in the queue rather than vanishing.
 */
export async function submitGeneration(args: {
  campaignId: string | null;
  presetId: string | null;
  modelSlug: string;
  operatorPrompt: string;
  operatorParams: Record<string, unknown>;
  parentId?: string | null;
  version?: number;
}) {
  const preset = args.presetId ? await getPreset(args.presetId) : null;
  if (args.presetId && !preset) throw new ComposeError("Preset not found.");

  const composed = compose({
    preset,
    modelSlug: args.modelSlug,
    operatorPrompt: args.operatorPrompt,
    operatorParams: args.operatorParams,
  });

  const est = estimateCredits(composed.model, composed.input);

  // Budget guardrail — hard block, evaluated against spent + in-flight commit.
  if (args.campaignId) {
    const b = await campaignBudget(args.campaignId);
    if (b.remaining !== null && est > b.remaining) {
      throw new BudgetError(
        `This run needs ~${est} credits but the campaign has ${b.remaining.toFixed(2)} left ` +
          `(budget ${b.budget}, spent ${b.spent.toFixed(2)}, in flight ${b.committed.toFixed(2)}).`
      );
    }
  }

  const row = await createGeneration({
    campaign_id: args.campaignId,
    preset_id: args.presetId,
    model: composed.model.slug,
    operator_prompt: args.operatorPrompt,
    resolved_prompt: composed.resolvedPrompt,
    input: composed.input,
    est_credits: est,
    parent_id: args.parentId ?? null,
    version: args.version ?? 1,
  });

  try {
    const { taskId } = await createTask({
      model: composed.model.slug,
      input: composed.input,
      callBackUrl: callbackUrl(),
    });
    await attachTaskId(row.id, taskId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Submit failed";
    await markFailed(row.id, msg);
    throw err;
  }

  return { id: row.id, rejectedKeys: composed.rejectedKeys, estCredits: est };
}

/** Polls KIE for one generation and persists the result. */
export async function refreshGeneration(id: string): Promise<GenerationWithAssets | null> {
  const gen = await getGeneration(id);
  if (!gen?.task_id) return gen;
  if (gen.state === "success" || gen.state === "fail") return gen;

  const task = await getTask(gen.task_id);
  await applyTaskResult(id, task);
  return getGeneration(id);
}

/** Sweeps every in-flight job. Called by the queue view and the cron route. */
export async function refreshPending() {
  const pending = await pendingGenerations();
  const results = await Promise.allSettled(
    pending.map(async (g) => {
      if (!g.task_id) return;
      const task = await getTask(g.task_id);
      await applyTaskResult(g.id, task);
    })
  );
  return {
    checked: pending.length,
    failed: results.filter((r) => r.status === "rejected").length,
  };
}
