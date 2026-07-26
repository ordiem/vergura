-- RIP pipeline: reference analysis -> product translation -> concept -> batch.
-- Idempotent: safe to re-run. Applied after schema.sql.

-- An uploaded inspiration ad plus the structured read of why it works.
create table if not exists refs (
  id            uuid primary key default gen_random_uuid(),
  label         text        not null default '',
  source_url    text        not null,              -- hosted copy of the upload
  analysis      jsonb,                             -- AnalysisResult, null until analysed
  analysed_at   timestamptz,
  analysis_model text       not null default '',
  fail_msg      text,
  archived      boolean     not null default false,
  created_at    timestamptz not null default now()
);

-- A pre-saved product the reference gets translated onto.
create table if not exists products (
  id           uuid primary key default gen_random_uuid(),
  name         text        not null,
  description  text        not null default '',
  -- Free-form brand facts the concept writer must respect (tone, claims,
  -- disclaimers, target audience).
  brand_notes  text        not null default '',
  preset_id    uuid references brand_presets(id) on delete set null,
  archived     boolean     not null default false,
  created_at   timestamptz not null default now()
);

create table if not exists product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url        text not null,
  caption    text not null default '',
  idx        int  not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, url)
);

do $$ begin
  create type concept_status as enum ('proposed','approved','rejected','generated');
exception when duplicate_object then null; end $$;

-- One rip run pairs a reference with a product and proposes N concepts.
create table if not exists rips (
  id          uuid primary key default gen_random_uuid(),
  ref_id      uuid references refs(id) on delete set null,
  product_id  uuid references products(id) on delete set null,
  campaign_id uuid references campaigns(id) on delete set null,
  variant_count int       not null default 3,
  model       text        not null default '',
  fail_msg    text,
  created_at  timestamptz not null default now()
);

-- A single proposed translation. Copy is stored structured and kept OUT of the
-- image: the visual prompt asks for negative space, and the operator sets type
-- downstream.
create table if not exists concepts (
  id            uuid primary key default gen_random_uuid(),
  rip_id        uuid not null references rips(id) on delete cascade,
  idx           int  not null default 0,
  angle         text not null default '',        -- e.g. literal / abstract / lifestyle
  big_idea      text not null default '',
  rationale     text not null default '',        -- why this translates the reference
  headline      text not null default '',
  subhead       text not null default '',
  cta           text not null default '',
  body_copy     text not null default '',
  visual_prompt text not null default '',        -- editable before approval
  status        concept_status not null default 'proposed',
  review_note   text not null default '',
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Link a generation back to the concept that authorised it.
alter table generations add column if not exists concept_id uuid references concepts(id) on delete set null;

-- Mirror of a KIE asset on our own storage. KIE serves results from
-- tempfile.aiquickdraw.com, which is not durable.
alter table generation_assets add column if not exists mirror_url text;
alter table generation_assets add column if not exists mirrored_at timestamptz;

-- A named selection of assets, exported together.
create table if not exists batches (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  note        text        not null default '',
  campaign_id uuid references campaigns(id) on delete set null,
  exported_at timestamptz,
  export_kind text,                                -- 'zip' today, 'gdrive' later
  export_ref  text,                                -- filename or remote folder id
  created_at  timestamptz not null default now()
);

create table if not exists batch_items (
  id         uuid primary key default gen_random_uuid(),
  batch_id   uuid not null references batches(id) on delete cascade,
  asset_id   uuid not null references generation_assets(id) on delete cascade,
  idx        int  not null default 0,
  created_at timestamptz not null default now(),
  unique (batch_id, asset_id)   -- an asset may join many batches, once each
);

create index if not exists concepts_rip_idx     on concepts (rip_id, idx);
create index if not exists concepts_status_idx  on concepts (status, created_at desc);
create index if not exists rips_ref_idx         on rips (ref_id);
create index if not exists batch_items_batch_idx on batch_items (batch_id, idx);
create index if not exists generations_concept_idx on generations (concept_id);
