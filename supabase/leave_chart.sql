-- Reference schema for the fedretire 2027 leave chart.
-- Apply in the public schema. RLS is on and there are no policies:
-- the Vercel API uses the service role key, which bypasses RLS.
-- The browser never receives that key.

create extension if not exists pgcrypto;

create table if not exists public.leave_chart_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text null,
  extra jsonb null,
  token_hash text not null unique,
  user_agent text null,
  created_at timestamptz default now(),
  last_seen_at timestamptz default now()
);

create table if not exists public.leave_chart_entries (
  signup_id uuid primary key references public.leave_chart_signups(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz default now()
);

alter table public.leave_chart_signups enable row level security;
alter table public.leave_chart_entries enable row level security;
