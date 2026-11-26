\set ON_ERROR_STOP on
-- Parent links, classes, summaries and analytics: each person sees only what they should.
-- s1, s2 students; p parent; t teacher; x stranger; a admin.
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000e1'), ('00000000-0000-0000-0000-0000000000e2'),
  ('00000000-0000-0000-0000-0000000000e3'), ('00000000-0000-0000-0000-0000000000e4'),
  ('00000000-0000-0000-0000-0000000000e5'), ('00000000-0000-0000-0000-0000000000e6')
on conflict do nothing;
insert into public.profiles (id, role) values ('00000000-0000-0000-0000-0000000000e6', 'admin') on conflict (id) do update set role = 'admin';

create temp table ids (k text primary key, v text);
grant all on ids to authenticated;

-- New event names from the app are accepted.
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e1', false);
insert into public.events (id, user_id, name) values (gen_random_uuid(), '00000000-0000-0000-0000-0000000000e1', 'drill_answered'),
  (gen_random_uuid(), '00000000-0000-0000-0000-0000000000e1', 'lesson_started'), (gen_random_uuid(), '00000000-0000-0000-0000-0000000000e1', 'lesson_completed');

-- Student s1 publishes a summary and makes a parent code. Nobody can make themselves admin.
insert into public.student_summaries (user_id, data) values ('00000000-0000-0000-0000-0000000000e1', '{"streak": 4}');
do $$ begin assert public.set_my_role('student') = 'student'; end $$;
do $$ begin
  begin perform public.set_my_role('admin'); raise exception 'became admin'; exception when invalid_parameter_value then null; end;
end $$;
insert into ids select 'code', (public.create_parent_code())->>'code';
do $$ begin assert (select v from ids where k = 'code') ~ '^[A-HJKMNP-Z2-9]{8}$', 'code format'; end $$;

-- A stranger can't read s1's summary.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e5', false);
do $$ begin assert (select count(*) from public.student_summaries) = 0, 'stranger sees no summary'; end $$;
do $$ begin assert (select count(*) from public.parent_link_codes) = 0, 'stranger sees no codes'; end $$;

-- The parent links with the code (lower case and spaces are fine), once.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e3', false);
do $$ begin assert public.set_my_role('parent') = 'parent'; end $$;
do $$ begin assert (public.link_parent('nope1234'))->>'error' = 'not_found', 'wrong code refused'; end $$;
do $$ declare c text := (select v from ids where k = 'code'); begin
  assert (public.link_parent(lower(substr(c, 1, 4)) || ' ' || substr(c, 5)))->>'student_id' = '00000000-0000-0000-0000-0000000000e1', 'linked';
end $$;
do $$ begin assert (select (data->>'streak')::int from public.student_summaries) = 4, 'parent sees summary'; end $$;
do $$ begin assert (select count(*) from public.mastery) = 0 and (select count(*) from public.events) = 0, 'parent sees no raw rows'; end $$;

-- The code was single use.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e5', false);
do $$ declare c text := (select v from ids where k = 'code'); begin
  assert (public.link_parent(c))->>'error' = 'not_found', 'code used up';
end $$;
-- Guessing is capped at 10 tries a day, and failed tries still count.
do $$ declare r jsonb; begin
  for i in 1..9 loop perform public.link_parent('AAAAAAA' || i); end loop;
  r := public.link_parent('ZZZZZZZZ');
  assert r->>'error' = 'too_many', 'try limit: ' || r;
end $$;

-- Only teachers make classes.
do $$ begin
  begin insert into public.classes (teacher_id, name) values ('00000000-0000-0000-0000-0000000000e5', 'Fake'); raise exception 'non-teacher made a class';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e4', false);
do $$ begin assert public.set_my_role('teacher') = 'teacher'; end $$;
insert into public.classes (teacher_id, name) values ('00000000-0000-0000-0000-0000000000e4', 'Class 10 Science');
insert into ids select 'class', id::text from public.classes;
insert into ids select 'join', join_code from public.classes;
insert into public.assignments (class_id, kind, ref_id, due_on) select id, 'chapter', gen_random_uuid(), '2027-01-20' from public.classes;
reset role;
insert into public.mastery (id, user_id, chapter_id, score, updated_at)
  select gen_random_uuid(), '00000000-0000-0000-0000-0000000000e1', id, 40, now() - interval '1 day' from public.chapters order by subject_code, number limit 1;
insert into public.mastery (id, user_id, chapter_id, score, updated_at)
  select gen_random_uuid(), '00000000-0000-0000-0000-0000000000e1', id, 75, now() from public.chapters order by subject_code, number limit 1;
set role authenticated;

-- Students can't add themselves without the code; with it they can.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e2', false);
do $$ begin
  begin
    insert into public.class_members (class_id, user_id) select v::uuid, '00000000-0000-0000-0000-0000000000e2' from ids where k = 'class';
    raise exception 'joined without the code';
  exception when insufficient_privilege then null; end;
end $$;
do $$ begin assert (select count(*) from public.assignments) = 0, 'not a member: no assignments'; end $$;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e1', false);
do $$ declare j text := (select v from ids where k = 'join'); begin
  assert (public.join_class(lower(j), 'Rafi'))->>'name' = 'Class 10 Science', 'joined';
end $$;
do $$ begin assert (select count(*) from public.assignments) = 1, 'member sees assignments'; end $$;
do $$ begin assert (select count(*) from public.classes) = 1, 'member sees the class'; end $$;

-- The teacher's overview has the member, latest mastery only, and the summary.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e4', false);
do $$ declare o jsonb := public.class_overview((select v::uuid from ids where k = 'class')); begin
  assert jsonb_array_length(o->'members') = 1 and o->'members'->0->>'nickname' = 'Rafi', 'members: ' || (o->'members');
  if exists (select 1 from public.chapters) then
    assert jsonb_array_length(o->'mastery') = 1 and (o->'mastery'->0->>'score')::int = 75, 'latest mastery: ' || (o->'mastery');
  end if;
  assert (o->'summaries'->'00000000-0000-0000-0000-0000000000e1'->>'streak')::int = 4, 'summary in overview';
end $$;
do $$ begin assert (select count(*) from public.student_summaries) = 1, 'teacher reads member summary'; end $$;

-- Other teachers (and parents) can't open the class overview; only admins see analytics.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e3', false);
do $$ begin
  begin perform public.class_overview((select v::uuid from ids where k = 'class')); raise exception 'parent opened a class';
  exception when insufficient_privilege then null; end;
  begin perform public.admin_analytics(7); raise exception 'parent saw analytics';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e6', false);
do $$ declare a jsonb := public.admin_analytics(7); begin
  assert (a->'lessons'->>'started')::int >= 1 and (a->'lessons'->>'completed')::int >= 1, 'lesson counts: ' || a;
  assert jsonb_array_length(a->'daily_active') >= 1 and (a->'daily_active'->-1->>'students')::int >= 1, 'daily active';
end $$;

-- Leaving: the student leaves the class; the student removes the parent.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e1', false);
delete from public.class_members where user_id = '00000000-0000-0000-0000-0000000000e1';
delete from public.parent_links where student_id = '00000000-0000-0000-0000-0000000000e1';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e3', false);
do $$ begin assert (select count(*) from public.student_summaries) = 0, 'unlinked parent sees nothing'; end $$;
reset role;
\echo 'parents, teachers and analytics tests passed'
