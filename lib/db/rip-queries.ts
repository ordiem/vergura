import "server-only";
import { requireDb } from "./client";
import type { AnalysisResult } from "@/lib/analysis/types";

export type ConceptStatus = "proposed" | "approved" | "rejected" | "generated";

export type Ref = {
  id: string;
  label: string;
  source_url: string;
  analysis: AnalysisResult | null;
  analysed_at: string | null;
  analysis_model: string;
  fail_msg: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  brand_notes: string;
  preset_id: string | null;
  created_at: string;
  images: { id: string; url: string; caption: string; idx: number }[];
};

export type Concept = {
  id: string;
  rip_id: string;
  idx: number;
  angle: string;
  big_idea: string;
  rationale: string;
  headline: string;
  subhead: string;
  cta: string;
  body_copy: string;
  visual_prompt: string;
  status: ConceptStatus;
  review_note: string;
  created_at: string;
};

export type Rip = {
  id: string;
  ref_id: string | null;
  product_id: string | null;
  campaign_id: string | null;
  variant_count: number;
  model: string;
  fail_msg: string | null;
  created_at: string;
  ref_label: string | null;
  ref_url: string | null;
  product_name: string | null;
  concepts: Concept[];
};

/* ------------------------------ refs ------------------------------ */

export async function createRef(label: string, sourceUrl: string) {
  const sql = requireDb();
  const [row] = await sql`
    insert into refs ${sql({ label, source_url: sourceUrl })} returning *
  `;
  return row as unknown as Ref;
}

export async function listRefs() {
  const sql = requireDb();
  return (await sql`
    select * from refs where archived = false order by created_at desc limit 100
  `) as unknown as Ref[];
}

export async function getRef(id: string) {
  const sql = requireDb();
  const [row] = await sql`select * from refs where id = ${id}`;
  return (row ?? null) as Ref | null;
}

export async function saveAnalysis(id: string, analysis: AnalysisResult, model: string) {
  const sql = requireDb();
  await sql`
    update refs set
      analysis = ${JSON.stringify(analysis)},
      analysed_at = now(), analysis_model = ${model}, fail_msg = null
    where id = ${id}
  `;
}

export async function failAnalysis(id: string, msg: string) {
  const sql = requireDb();
  await sql`update refs set fail_msg = ${msg} where id = ${id}`;
}

/* ---------------------------- products ---------------------------- */

export async function listProducts() {
  const sql = requireDb();
  return (await sql`
    select p.*, coalesce(
      json_agg(json_build_object('id', i.id, 'url', i.url, 'caption', i.caption, 'idx', i.idx)
               order by i.idx) filter (where i.id is not null), '[]'
    ) as images
    from products p
    left join product_images i on i.product_id = p.id
    where p.archived = false
    group by p.id
    order by p.created_at desc
  `) as unknown as Product[];
}

export async function getProduct(id: string) {
  const sql = requireDb();
  const [row] = await sql`
    select p.*, coalesce(
      json_agg(json_build_object('id', i.id, 'url', i.url, 'caption', i.caption, 'idx', i.idx)
               order by i.idx) filter (where i.id is not null), '[]'
    ) as images
    from products p
    left join product_images i on i.product_id = p.id
    where p.id = ${id}
    group by p.id
  `;
  return (row ?? null) as Product | null;
}

export async function createProduct(p: {
  name: string;
  description: string;
  brand_notes: string;
  preset_id: string | null;
  imageUrls: string[];
}) {
  const sql = requireDb();
  return (await sql.begin(async (tx) => {
    const [row] = await tx`
      insert into products ${tx({
        name: p.name,
        description: p.description,
        brand_notes: p.brand_notes,
        preset_id: p.preset_id,
      })} returning *
    `;
    for (const [i, url] of p.imageUrls.entries()) {
      await tx`
        insert into product_images ${tx({ product_id: row.id, url, idx: i })}
        on conflict (product_id, url) do nothing
      `;
    }
    return row;
  })) as unknown as Product;
}

/* ------------------------- rips + concepts ------------------------- */

export async function createRip(r: {
  ref_id: string;
  product_id: string;
  campaign_id: string | null;
  variant_count: number;
  model: string;
}) {
  const sql = requireDb();
  const [row] = await sql`insert into rips ${sql(r)} returning *`;
  return row as unknown as Rip;
}

export async function insertConcepts(
  ripId: string,
  drafts: Omit<Concept, "id" | "rip_id" | "idx" | "status" | "review_note" | "created_at">[]
) {
  const sql = requireDb();
  await sql.begin(async (tx) => {
    for (const [i, d] of drafts.entries()) {
      await tx`
        insert into concepts ${tx({
          rip_id: ripId,
          idx: i,
          angle: d.angle ?? "",
          big_idea: d.big_idea ?? "",
          rationale: d.rationale ?? "",
          headline: d.headline ?? "",
          subhead: d.subhead ?? "",
          cta: d.cta ?? "",
          body_copy: d.body_copy ?? "",
          visual_prompt: d.visual_prompt ?? "",
        })}
      `;
    }
  });
}

const RIP_SELECT = (sql: ReturnType<typeof requireDb>) => sql`
  select r.*, f.label as ref_label, f.source_url as ref_url, p.name as product_name,
         coalesce(
           json_agg(to_jsonb(c.*) order by c.idx) filter (where c.id is not null), '[]'
         ) as concepts
  from rips r
  left join refs f     on f.id = r.ref_id
  left join products p on p.id = r.product_id
  left join concepts c on c.rip_id = r.id
`;

export async function listRips() {
  const sql = requireDb();
  return (await sql`
    ${RIP_SELECT(sql)} group by r.id, f.label, f.source_url, p.name
    order by r.created_at desc limit 50
  `) as unknown as Rip[];
}

export async function getRip(id: string) {
  const sql = requireDb();
  const [row] = await sql`
    ${RIP_SELECT(sql)} where r.id = ${id}
    group by r.id, f.label, f.source_url, p.name
  `;
  return (row ?? null) as Rip | null;
}

export async function getConcept(id: string) {
  const sql = requireDb();
  const [row] = await sql`select * from concepts where id = ${id}`;
  return (row ?? null) as Concept | null;
}

export async function setConceptStatus(id: string, status: ConceptStatus, note = "") {
  const sql = requireDb();
  await sql`
    update concepts
    set status = ${status}, review_note = ${note}, reviewed_at = now(), updated_at = now()
    where id = ${id}
  `;
}

export async function updateConceptPrompt(id: string, visualPrompt: string) {
  const sql = requireDb();
  await sql`
    update concepts set visual_prompt = ${visualPrompt}, updated_at = now() where id = ${id}
  `;
}

export type DeleteOutcome = "deleted" | "generated" | "missing";

/**
 * Discards a proposal outright — for concepts that are noise, not for ones you
 * disagree with (reject keeps those on the record).
 *
 * A concept that already generated is not deletable: generations.concept_id is
 * `on delete set null`, so removing it would leave a job in the ledger with no
 * trace of what authorised it. The guard lives in the WHERE clause so a
 * generate landing between the check and the delete cannot slip through.
 */
export async function deleteConcept(id: string): Promise<DeleteOutcome> {
  const sql = requireDb();
  const [row] = await sql`
    delete from concepts c
    where c.id = ${id}
      and c.status <> 'generated'
      and not exists (select 1 from generations g where g.concept_id = c.id)
    returning c.id
  `;
  if (row) return "deleted";
  const [survivor] = await sql`select id from concepts where id = ${id}`;
  return survivor ? "generated" : "missing";
}

/**
 * Drops a whole rip run and its concepts (cascade), for when none of the
 * proposals are worth keeping. Blocked by the same rule: if any concept in the
 * run generated, the run is part of the audit trail and stays.
 */
export async function deleteRip(id: string): Promise<DeleteOutcome> {
  const sql = requireDb();
  const [row] = await sql`
    delete from rips r
    where r.id = ${id}
      and not exists (
        select 1 from concepts c
        where c.rip_id = r.id
          and (c.status = 'generated'
               or exists (select 1 from generations g where g.concept_id = c.id))
      )
    returning r.id
  `;
  if (row) return "deleted";
  const [survivor] = await sql`select id from rips where id = ${id}`;
  return survivor ? "generated" : "missing";
}

/* ----------------------------- batches ----------------------------- */

export type Batch = {
  id: string;
  name: string;
  note: string;
  exported_at: string | null;
  export_kind: string | null;
  created_at: string;
  items: { id: string; url: string; mirror_url: string | null; idx: number }[];
};

export async function listBatches() {
  const sql = requireDb();
  return (await sql`
    select b.*, coalesce(
      json_agg(json_build_object('id', a.id, 'url', a.url,
                                 'mirror_url', a.mirror_url, 'idx', bi.idx)
               order by bi.idx) filter (where a.id is not null), '[]'
    ) as items
    from batches b
    left join batch_items bi      on bi.batch_id = b.id
    left join generation_assets a on a.id = bi.asset_id
    group by b.id
    order by b.created_at desc limit 50
  `) as unknown as Batch[];
}

export async function getBatch(id: string) {
  const sql = requireDb();
  const [row] = await sql`
    select b.*, coalesce(
      json_agg(json_build_object('id', a.id, 'url', a.url,
                                 'mirror_url', a.mirror_url, 'idx', bi.idx)
               order by bi.idx) filter (where a.id is not null), '[]'
    ) as items
    from batches b
    left join batch_items bi      on bi.batch_id = b.id
    left join generation_assets a on a.id = bi.asset_id
    where b.id = ${id}
    group by b.id
  `;
  return (row ?? null) as Batch | null;
}

/** Only approved assets may be batched — the second gate. */
export async function createBatch(name: string, note: string, assetIds: string[]) {
  const sql = requireDb();
  return (await sql.begin(async (tx) => {
    const [batch] = await tx`insert into batches ${tx({ name, note })} returning *`;
    let idx = 0;
    for (const assetId of assetIds) {
      const [ok] = await tx`
        select a.id from generation_assets a
        join generations g on g.id = a.generation_id
        where a.id = ${assetId} and g.review = 'approved'
      `;
      if (!ok) continue;
      await tx`
        insert into batch_items ${tx({ batch_id: batch.id, asset_id: assetId, idx: idx++ })}
        on conflict (batch_id, asset_id) do nothing
      `;
    }
    return batch;
  })) as unknown as Batch;
}

export async function markExported(id: string, kind: string, ref: string) {
  const sql = requireDb();
  await sql`
    update batches set exported_at = now(), export_kind = ${kind}, export_ref = ${ref}
    where id = ${id}
  `;
}
