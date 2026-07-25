import "server-only";
import { requireDb } from "./client";

export type ReviewStatus = "draft" | "in_review" | "approved" | "rejected";
export type JobState = "waiting" | "queuing" | "generating" | "success" | "fail";

export type BrandPreset = {
  id: string;
  name: string;
  description: string;
  kind: string;
  model: string;
  locked_prefix: string;
  locked_suffix: string;
  negative_prompt: string;
  locked_params: Record<string, unknown>;
  editable_params: string[];
  archived: boolean;
  created_at: string;
};

export type Campaign = {
  id: string;
  name: string;
  objective: string;
  budget_credits: string | null;
  archived: boolean;
  created_at: string;
};

export type Generation = {
  id: string;
  campaign_id: string | null;
  preset_id: string | null;
  kind: string;
  model: string;
  operator_prompt: string;
  resolved_prompt: string;
  input: Record<string, unknown>;
  task_id: string | null;
  state: JobState;
  progress: number;
  credits_consumed: string;
  est_credits: string;
  cost_time_ms: number | null;
  fail_code: string | null;
  fail_msg: string | null;
  review: ReviewStatus;
  review_note: string;
  reviewed_at: string | null;
  parent_id: string | null;
  version: number;
  raw_result: unknown;
  created_at: string;
  updated_at: string;
};

export type GenerationWithAssets = Generation & {
  assets: { id: string; url: string; idx: number }[];
  campaign_name: string | null;
  preset_name: string | null;
};

/* ----------------------------- presets ----------------------------- */

export async function listPresets(includeArchived = false) {
  const sql = requireDb();
  return (await sql`
    select * from brand_presets
    where ${includeArchived ? sql`true` : sql`archived = false`}
    order by created_at desc
  `) as unknown as BrandPreset[];
}

export async function getPreset(id: string) {
  const sql = requireDb();
  const [row] = await sql`select * from brand_presets where id = ${id}`;
  return (row ?? null) as BrandPreset | null;
}

export async function createPreset(p: {
  name: string;
  description?: string;
  model: string;
  locked_prefix?: string;
  locked_suffix?: string;
  negative_prompt?: string;
  locked_params?: Record<string, unknown>;
  editable_params?: string[];
}) {
  const sql = requireDb();
  const [row] = await sql`
    insert into brand_presets ${sql({
      name: p.name,
      description: p.description ?? "",
      model: p.model,
      locked_prefix: p.locked_prefix ?? "",
      locked_suffix: p.locked_suffix ?? "",
      negative_prompt: p.negative_prompt ?? "",
      locked_params: JSON.stringify(p.locked_params ?? {}),
      editable_params: p.editable_params ?? [],
    })}
    returning *
  `;
  return row as unknown as BrandPreset;
}

export async function archivePreset(id: string) {
  const sql = requireDb();
  await sql`update brand_presets set archived = true where id = ${id}`;
}

/* ---------------------------- campaigns ---------------------------- */

export async function listCampaigns() {
  const sql = requireDb();
  return (await sql`
    select c.*,
           coalesce(sum(g.credits_consumed), 0) as spent,
           count(g.id)                          as generation_count
    from campaigns c
    left join generations g on g.campaign_id = c.id
    where c.archived = false
    group by c.id
    order by c.created_at desc
  `) as unknown as (Campaign & { spent: string; generation_count: string })[];
}

export async function getCampaign(id: string) {
  const sql = requireDb();
  const [row] = await sql`select * from campaigns where id = ${id}`;
  return (row ?? null) as Campaign | null;
}

export async function createCampaign(c: {
  name: string;
  objective?: string;
  budget_credits?: number | null;
}) {
  const sql = requireDb();
  const [row] = await sql`
    insert into campaigns ${sql({
      name: c.name,
      objective: c.objective ?? "",
      budget_credits: c.budget_credits ?? null,
    })}
    returning *
  `;
  return row as unknown as Campaign;
}

/** Spend + headroom for a campaign. Pending jobs count at their estimate. */
export async function campaignBudget(campaignId: string) {
  const sql = requireDb();
  const [row] = await sql`
    select
      c.budget_credits,
      coalesce(sum(g.credits_consumed), 0) as spent,
      coalesce(sum(case when g.state in ('waiting','queuing','generating')
                        then g.est_credits else 0 end), 0) as committed
    from campaigns c
    left join generations g on g.campaign_id = c.id
    where c.id = ${campaignId}
    group by c.budget_credits
  `;
  const budget = row?.budget_credits == null ? null : Number(row.budget_credits);
  const spent = Number(row?.spent ?? 0);
  const committed = Number(row?.committed ?? 0);
  return {
    budget,
    spent,
    committed,
    remaining: budget == null ? null : budget - spent - committed,
  };
}

/* --------------------------- generations --------------------------- */

export async function listGenerations(filter?: {
  campaignId?: string;
  review?: ReviewStatus;
  state?: JobState;
  limit?: number;
}) {
  const sql = requireDb();
  const limit = filter?.limit ?? 100;
  const rows = await sql`
    select g.*,
           c.name as campaign_name,
           p.name as preset_name,
           coalesce(
             json_agg(json_build_object('id', a.id, 'url', a.url, 'idx', a.idx)
                      order by a.idx)
             filter (where a.id is not null), '[]'
           ) as assets
    from generations g
    left join campaigns c        on c.id = g.campaign_id
    left join brand_presets p    on p.id = g.preset_id
    left join generation_assets a on a.generation_id = g.id
    where true
      ${filter?.campaignId ? sql`and g.campaign_id = ${filter.campaignId}` : sql``}
      ${filter?.review ? sql`and g.review = ${filter.review}` : sql``}
      ${filter?.state ? sql`and g.state = ${filter.state}` : sql``}
    group by g.id, c.name, p.name
    order by g.created_at desc
    limit ${limit}
  `;
  return rows as unknown as GenerationWithAssets[];
}

export async function getGeneration(id: string) {
  const sql = requireDb();
  const [row] = await sql`
    select g.*,
           c.name as campaign_name,
           p.name as preset_name,
           coalesce(
             json_agg(json_build_object('id', a.id, 'url', a.url, 'idx', a.idx)
                      order by a.idx)
             filter (where a.id is not null), '[]'
           ) as assets
    from generations g
    left join campaigns c         on c.id = g.campaign_id
    left join brand_presets p     on p.id = g.preset_id
    left join generation_assets a on a.generation_id = g.id
    where g.id = ${id}
    group by g.id, c.name, p.name
  `;
  return (row ?? null) as GenerationWithAssets | null;
}

/** All versions sharing a lineage root, oldest first — powers version compare. */
export async function getLineage(id: string) {
  const sql = requireDb();
  const rows = await sql`
    with recursive up as (
      select id, parent_id from generations where id = ${id}
      union all
      select g.id, g.parent_id from generations g join up on g.id = up.parent_id
    ),
    root as (select id from up where parent_id is null limit 1),
    down as (
      select id from root
      union all
      select g.id from generations g join down on g.parent_id = down.id
    )
    select g.*,
           coalesce(
             json_agg(json_build_object('id', a.id, 'url', a.url, 'idx', a.idx)
                      order by a.idx)
             filter (where a.id is not null), '[]'
           ) as assets
    from generations g
    left join generation_assets a on a.generation_id = g.id
    where g.id in (select id from down)
    group by g.id
    order by g.version asc, g.created_at asc
  `;
  return rows as unknown as GenerationWithAssets[];
}

export async function createGeneration(g: {
  campaign_id: string | null;
  preset_id: string | null;
  model: string;
  operator_prompt: string;
  resolved_prompt: string;
  input: Record<string, unknown>;
  est_credits: number;
  parent_id?: string | null;
  version?: number;
}) {
  const sql = requireDb();
  const [row] = await sql`
    insert into generations ${sql({
      campaign_id: g.campaign_id,
      preset_id: g.preset_id,
      model: g.model,
      operator_prompt: g.operator_prompt,
      resolved_prompt: g.resolved_prompt,
      input: JSON.stringify(g.input),
      est_credits: g.est_credits,
      parent_id: g.parent_id ?? null,
      version: g.version ?? 1,
    })}
    returning *
  `;
  return row as unknown as Generation;
}

export async function attachTaskId(id: string, taskId: string) {
  const sql = requireDb();
  await sql`
    update generations
    set task_id = ${taskId}, state = 'waiting', updated_at = now()
    where id = ${id}
  `;
}

export async function markFailed(id: string, msg: string) {
  const sql = requireDb();
  await sql`
    update generations
    set state = 'fail', fail_msg = ${msg}, updated_at = now()
    where id = ${id}
  `;
}

/** Applies a polled/callback KIE result. Idempotent. */
export async function applyTaskResult(
  id: string,
  t: {
    state: JobState;
    progress: number;
    urls: string[];
    creditsConsumed: number;
    costTimeMs: number | null;
    failCode: string | null;
    failMsg: string | null;
    raw: unknown;
  }
) {
  const sql = requireDb();
  await sql.begin(async (tx) => {
    await tx`
      update generations set
        state            = ${t.state},
        progress         = ${t.progress},
        credits_consumed = ${t.creditsConsumed},
        cost_time_ms     = ${t.costTimeMs},
        fail_code        = ${t.failCode},
        fail_msg         = ${t.failMsg},
        raw_result       = ${JSON.stringify(t.raw ?? null)},
        review           = case
                             when ${t.state}::job_state = 'success' and review = 'draft'
                             then 'in_review'::review_status
                             else review
                           end,
        updated_at       = now()
      where id = ${id}
    `;
    for (const [i, url] of t.urls.entries()) {
      await tx`
        insert into generation_assets ${tx({ generation_id: id, url, idx: i })}
        on conflict (generation_id, url) do nothing
      `;
    }
  });
}

export async function findByTaskId(taskId: string) {
  const sql = requireDb();
  const [row] = await sql`select * from generations where task_id = ${taskId}`;
  return (row ?? null) as Generation | null;
}

export async function setReview(id: string, review: ReviewStatus, note = "") {
  const sql = requireDb();
  const [row] = await sql`
    update generations
    set review = ${review}, review_note = ${note}, reviewed_at = now(), updated_at = now()
    where id = ${id}
    returning *
  `;
  return row as unknown as Generation;
}

export async function pendingGenerations() {
  const sql = requireDb();
  return (await sql`
    select * from generations
    where state in ('waiting','queuing','generating') and task_id is not null
    order by created_at asc
    limit 50
  `) as unknown as Generation[];
}

export async function dashboardStats() {
  const sql = requireDb();
  const [row] = await sql`
    select
      count(*) filter (where state in ('waiting','queuing','generating')) as in_flight,
      count(*) filter (where review = 'in_review')                        as awaiting_review,
      count(*) filter (where review = 'approved')                         as approved,
      count(*) filter (where state = 'fail')                              as failed,
      coalesce(sum(credits_consumed), 0)                                  as total_credits
    from generations
  `;
  return row as unknown as {
    in_flight: string;
    awaiting_review: string;
    approved: string;
    failed: string;
    total_credits: string;
  };
}
