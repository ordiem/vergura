-- Vergura creative engineering platform — schema
-- Idempotent: safe to re-run.

create extension if not exists "pgcrypto";

-- Brand presets encode the "locked" part of a creative system. An operator
-- supplies only the variable middle of the prompt; prefix, suffix, negative
-- prompt, model and locked_params cannot be overridden at generation time.
create table if not exists brand_presets (
  id              uuid primary key default gen_random_uuid(),
  name            text        not null,
  description     text        not null default '',
  kind            text        not null default 'image',
  model           text        not null,
  locked_prefix   text        not null default '',
  locked_suffix   text        not null default '',
  negative_prompt text        not null default '',
  locked_params   jsonb       not null default '{}'::jsonb,
  editable_params text[]      not null default '{}',
  archived        boolean     not null default false,
  created_at      timestamptz not null default now()
);

-- A campaign is the brief + the budget envelope.
create table if not exists campaigns (
  id             uuid primary key default gen_random_uuid(),
  name           text        not null,
  objective      text        not null default '',
  budget_credits numeric(12,4),           -- null = uncapped
  archived       boolean     not null default false,
  created_at     timestamptz not null default now()
);

do $$ begin
  create type job_state as enum ('waiting','queuing','generating','success','fail');
exception when duplicate_object then null; end $$;

do $$ begin
  create type review_status as enum ('draft','in_review','approved','rejected');
exception when duplicate_object then null; end $$;

create table if not exists generations (
  id               uuid primary key default gen_random_uuid(),
  campaign_id      uuid references campaigns(id) on delete set null,
  preset_id        uuid references brand_presets(id) on delete set null,
  kind             text          not null default 'image',
  model            text          not null,
  operator_prompt  text          not null default '',
  resolved_prompt  text          not null,
  input            jsonb         not null default '{}'::jsonb,
  task_id          text unique,
  state            job_state     not null default 'waiting',
  progress         int           not null default 0,
  credits_consumed numeric(12,4) not null default 0,
  est_credits      numeric(12,4) not null default 0,
  cost_time_ms     int,
  fail_code        text,
  fail_msg         text,
  review           review_status not null default 'draft',
  review_note      text          not null default '',
  reviewed_at      timestamptz,
  parent_id        uuid references generations(id) on delete set null,
  version          int           not null default 1,
  raw_result       jsonb,
  created_at       timestamptz   not null default now(),
  updated_at       timestamptz   not null default now()
);

create table if not exists generation_assets (
  id            uuid primary key default gen_random_uuid(),
  generation_id uuid not null references generations(id) on delete cascade,
  url           text not null,
  idx           int  not null default 0,
  created_at    timestamptz not null default now(),
  unique (generation_id, url)
);

create index if not exists generations_campaign_idx on generations (campaign_id, created_at desc);
create index if not exists generations_state_idx    on generations (state) where state in ('waiting','queuing','generating');
create index if not exists generations_review_idx   on generations (review, created_at desc);
create index if not exists generations_parent_idx   on generations (parent_id);
create index if not exists assets_generation_idx    on generation_assets (generation_id, idx);
