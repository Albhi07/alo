-- RLS + last-write-wins checks for the core migration. Any failed assert aborts with an error.
\set ON_ERROR_STOP on
insert into auth.users (id) values
  ('00000000-0000-0000-0000-00000000000a'), ('00000000-0000-0000-0000-00000000000b');

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);

-- A student can create their own profile but not promote themselves to admin.
insert into public.profiles (id, role, updated_at) values ('00000000-0000-0000-0000-00000000000a', 'admin', '2026-01-01T10:00:00Z');
do $$ begin assert (select role from public.profiles where id = auth.uid()) = 'student', 'role escalation blocked'; end $$;

-- ...nor write someone else's profile.
do $$ begin
  begin
    insert into public.profiles (id) values ('00000000-0000-0000-0000-00000000000b');
    raise exception 'should have failed';
  exception when insufficient_privilege then null; end;
end $$;

-- Last-write-wins: an older write that arrives late is ignored.
insert into public.profiles (id, daily_target_min, updated_at) values ('00000000-0000-0000-0000-00000000000a', 300, '2026-01-01T12:00:00Z')
  on conflict (id) do update set daily_target_min = excluded.daily_target_min, updated_at = excluded.updated_at;
insert into public.profiles (id, daily_target_min, updated_at) values ('00000000-0000-0000-0000-00000000000a', 120, '2026-01-01T11:00:00Z')
  on conflict (id) do update set daily_target_min = excluded.daily_target_min, updated_at = excluded.updated_at;
do $$ begin assert (select daily_target_min from public.profiles where id = auth.uid()) = 300, 'older write ignored'; end $$;

-- Events: re-sending the same event id never creates a duplicate.
insert into public.events (id, user_id, name, updated_at) values ('10000000-0000-0000-0000-000000000001', auth.uid(), 'focus_completed', now())
  on conflict (id) do update set updated_at = excluded.updated_at;
insert into public.events (id, user_id, name, updated_at) values ('10000000-0000-0000-0000-000000000001', auth.uid(), 'focus_completed', now())
  on conflict (id) do update set updated_at = excluded.updated_at;
do $$ begin assert (select count(*) from public.events) = 1, 'no duplicate events'; end $$;

-- Student B sees nothing of A.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000b', false);
do $$ begin
  assert (select count(*) from public.profiles) = 0, 'B cannot read A profile';
  assert (select count(*) from public.events) = 0, 'B cannot read A events';
end $$;
reset role;
\echo 'core tests passed'
