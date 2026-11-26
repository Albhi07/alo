\set ON_ERROR_STOP on
-- Admin seeds content; students read only published rows and only their own progress.
insert into auth.users (id) values ('00000000-0000-0000-0000-0000000000ad'), ('00000000-0000-0000-0000-0000000000c1'), ('00000000-0000-0000-0000-0000000000c2'), ('00000000-0000-0000-0000-0000000000f1') on conflict do nothing;
insert into public.profiles (id, role) values ('00000000-0000-0000-0000-0000000000ad', 'admin');
-- (run as postgres, so the role protection is bypassed for this setup row)

set role anon;
do $$ begin assert (select count(*) from public.subjects) > 0, 'anon reads subjects'; end $$;
do $$ begin assert (select count(*) from public.lessons where not published) = 0, 'anon never sees drafts'; end $$;
reset role;

-- A draft lesson is hidden from students.
insert into public.lessons (id, chapter_id, title_bn, title_en, medium, published)
  select '20000000-0000-0000-0000-000000000001', id, 'খসড়া', 'Draft', 'bn', false from public.chapters limit 1;

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c1', false);
do $$ begin assert not exists (select 1 from public.lessons where id = '20000000-0000-0000-0000-000000000001'), 'draft hidden'; end $$;
do $$ begin
  begin
    insert into public.subjects (code, name_bn, name_en, mark_scheme) values ('999', 'x', 'x', 'cq70_mcq30');
    raise exception 'student must not write content';
  exception when insufficient_privilege then null; end;
end $$;

-- Student writes own mastery; a teacher of their class can read it; another student cannot.
insert into public.mastery (id, user_id, chapter_id, score, updated_at)
  select '30000000-0000-0000-0000-000000000001', auth.uid(), id, 40, now() from public.chapters limit 1;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000f1', false); -- teacher
select public.set_my_role('teacher');
insert into public.classes (id, teacher_id, name) values ('40000000-0000-0000-0000-000000000001', auth.uid(), 'Class 10 A');
do $$ begin assert (select count(*) from public.mastery) = 0, 'teacher sees nobody before they join'; end $$;

reset role;
select join_code as jc from public.classes where id = '40000000-0000-0000-0000-000000000001' \gset
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c1', false);
select public.join_class(:'jc', 'C1');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000f1', false);
do $$ begin assert (select count(*) from public.mastery) = 1, 'teacher sees member mastery'; end $$;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c2', false);
do $$ begin assert (select count(*) from public.mastery) = 0, 'other student sees nothing'; end $$;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000ad', false);
do $$ begin assert (select count(*) from public.lessons where not published) = 1, 'admin sees drafts'; end $$;
reset role;
\echo 'content tests passed'

-- Bangla search: full-text (simple config) and trigram both find Bangla words.
set role anon;
do $$ begin
  assert (select count(*) from public.questions where search @@ plainto_tsquery('simple', 'উৎপাদক')) > 0, 'fts finds উৎপাদক';
  assert (select count(*) from public.questions where stem ilike '%বাগানের%') > 0, 'trigram/ilike finds বাগানের';
  assert (select count(*) from public.lessons where search @@ plainto_tsquery('simple', 'সূত্র')) > 0, 'fts finds lesson title';
end $$;
reset role;
\echo 'search tests passed'
