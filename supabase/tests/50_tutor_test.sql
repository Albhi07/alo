\set ON_ERROR_STOP on
-- Tutor quotas are per student per day, only the Edge Function (service role) can spend them,
-- the exam-hours lock follows the routine, and search finds published content.
insert into auth.users (id) values ('00000000-0000-0000-0000-0000000000d1'), ('00000000-0000-0000-0000-0000000000d2') on conflict do nothing;

-- Students can't call the quota functions themselves.
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d1', false);
do $$ begin
  begin
    perform public.tutor_take('00000000-0000-0000-0000-0000000000d1', false, 1000, 1000);
    raise exception 'a student spent quota directly';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.tutor_usage (user_id, day, messages) values ('00000000-0000-0000-0000-0000000000d1', public.bd_today(), -50);
    raise exception 'a student wrote their own usage';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

-- Two messages allowed, the third refused; photos counted apart.
do $$
declare r jsonb;
begin
  r := public.tutor_take('00000000-0000-0000-0000-0000000000d1', false, 2, 1);
  assert (r->>'ok')::boolean and (r->>'messages_left')::int = 1, 'first message taken: ' || r;
  r := public.tutor_take('00000000-0000-0000-0000-0000000000d1', false, 2, 1);
  assert (r->>'ok')::boolean and (r->>'messages_left')::int = 0, 'second message taken';
  r := public.tutor_take('00000000-0000-0000-0000-0000000000d1', false, 2, 1);
  assert not (r->>'ok')::boolean, 'third message refused';
  r := public.tutor_take('00000000-0000-0000-0000-0000000000d1', true, 2, 1);
  assert (r->>'ok')::boolean and (r->>'photos_left')::int = 0, 'photo has its own quota';
  -- A failed call gives the unit back; tokens are logged.
  perform public.tutor_settle('00000000-0000-0000-0000-0000000000d1', true, true, 0, 0);
  perform public.tutor_settle('00000000-0000-0000-0000-0000000000d1', false, false, 1200, 300);
  assert (select photos from public.tutor_usage where user_id = '00000000-0000-0000-0000-0000000000d1') = 0, 'photo refunded';
  assert (select tokens_in from public.tutor_usage where user_id = '00000000-0000-0000-0000-0000000000d1') = 1200, 'tokens logged';
end $$;

-- Each student sees only their own usage.
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d2', false);
do $$ begin assert (select count(*) from public.tutor_usage) = 0, 'cannot see others'' usage'; end $$;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d1', false);
do $$ begin assert (select count(*) from public.tutor_usage) = 1, 'sees own usage'; end $$;
reset role;

-- Exam-hours lock: on during a paper (and 30 minutes before), off otherwise.
insert into public.exam_config (exam_year, written_start, written_end) values (2099, '2099-02-10', '2099-03-10') on conflict do nothing;
insert into public.routine (exam_year, date, subject_code, paper, start_time, duration_min)
  select 2099, '2099-02-10', code, 'test', '10:00', 180 from public.subjects order by code limit 1;
do $$ begin
  assert public.exam_in_progress('2099-02-10 09:45+06'), 'locked 15 minutes before';
  assert public.exam_in_progress('2099-02-10 12:59+06'), 'locked during the paper';
  assert not public.exam_in_progress('2099-02-10 13:30+06'), 'open after the paper';
  assert not public.exam_in_progress('2099-02-11 11:00+06'), 'open on a free day';
end $$;
delete from public.routine where exam_year = 2099;
delete from public.exam_config where exam_year = 2099;

-- Search finds a seeded chapter by its title (seed has chapters when content is built).
do $$
declare t text;
begin
  select title_en into t from public.chapters order by subject_code, number limit 1;
  if t is not null then
    assert exists (select 1 from public.tutor_search(split_part(t, ' ', 1))), 'search finds chapter ' || t;
  end if;
end $$;
\echo 'tutor tests passed'
