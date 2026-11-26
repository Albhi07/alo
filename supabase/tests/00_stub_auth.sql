-- Minimal stand-in for Supabase's auth schema so migrations and RLS can be tested on
-- plain Postgres (CI or local) without the Supabase CLI.
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key, email text, phone text);
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
grant usage on schema public, auth to anon, authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated;
