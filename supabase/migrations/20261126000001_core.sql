-- Alo core: profiles, analytics events, shared helpers.
-- Conventions: snake_case, uuid ids, created_at/updated_at on every table, RLS on every table.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

do $$ begin
  create type public.user_role as enum ('student', 'parent', 'teacher', 'admin');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Content tables: stamp updated_at on every change.
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- Synced (device-written) tables: last-write-wins by updated_at. The device sets
-- updated_at; an older write arriving late (e.g. from a second phone that was offline)
-- is ignored instead of overwriting newer data. Rows are never duplicated because
-- ids are minted on the device and upserted on id.
create or replace function public.lww_guard() returns trigger
language plpgsql as $$
begin
  if tg_op = 'UPDATE' and new.updated_at < old.updated_at then
    return null; -- skip: the stored row is newer
  end if;
  if new.updated_at > now() + interval '1 day' then
    new.updated_at := now(); -- clamp wildly wrong device clocks
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  user_id uuid generated always as (id) stored,
  display_name text check (char_length(display_name) <= 40),
  role public.user_role not null default 'student',
  language text not null default 'bn' check (language in ('bn', 'en')),
  medium text not null default 'bn' check (medium in ('bn', 'en')),
  board text check (board in ('dhaka','rajshahi','chattogram','cumilla','jashore','barishal','sylhet','dinajpur','mymensingh','madrasah','technical')),
  "group" text check ("group" in ('science', 'business', 'humanities')),
  religion_code text check (religion_code in ('111','112','113','114')),
  fourth_subject_code text,
  daily_target_min int not null default 240 check (daily_target_min between 30 and 720),
  exam_year int not null default 2027,
  onboarded boolean not null default false,
  deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_lww on public.profiles;
create trigger profiles_lww before insert or update on public.profiles
  for each row execute function public.lww_guard();

-- Role checks used by RLS policies everywhere. security definer avoids RLS recursion.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;

-- A student may never promote themselves: role changes go through admins only.
create or replace function public.protect_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- No end-user JWT (SQL editor, service role): trusted, e.g. promoting the first admin.
  if auth.uid() is null then
    return new;
  end if;
  if tg_op = 'INSERT' and new.role = 'admin' and not public.is_admin() then
    new.role := 'student';
  elsif tg_op = 'UPDATE' and new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end $$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role before insert or update on public.profiles
  for each row execute function public.protect_role();

alter table public.profiles enable row level security;

drop policy if exists profiles_own on public.profiles;
create policy profiles_own on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_admin on public.profiles;
create policy profiles_admin on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Analytics events (privacy-friendly: event name + coarse props, no PII)
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (name in ('onboarding_completed','lesson_started','lesson_completed','mcq_answered','mock_submitted','focus_completed')),
  props jsonb not null default '{}'::jsonb check (pg_column_size(props) < 2048),
  deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists events_name_created on public.events (name, created_at);

drop trigger if exists events_lww on public.events;
create trigger events_lww before insert or update on public.events
  for each row execute function public.lww_guard();

alter table public.events enable row level security;
drop policy if exists events_insert_own on public.events;
create policy events_insert_own on public.events
  for insert with check (user_id = auth.uid());
-- Upserts of an already-sent event need update rights on the student's own rows.
drop policy if exists events_update_own on public.events;
create policy events_update_own on public.events
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists events_select_own on public.events;
create policy events_select_own on public.events
  for select using (user_id = auth.uid());
drop policy if exists events_admin on public.events;
create policy events_admin on public.events
  for select using (public.is_admin());
