-- M8: parent link, teacher classes, student summaries, analytics.

-- ---------------------------------------------------------------------------
-- Analytics: the app logs more event names than the first migration allowed; without
-- this those rows would be rejected and retried forever.
-- ---------------------------------------------------------------------------
alter table public.events drop constraint if exists events_name_check;
alter table public.events add constraint events_name_check check (name in (
  'onboarding_completed','lesson_started','lesson_completed','mcq_answered','drill_answered',
  'mock_started','mock_mcq_submitted','mock_submitted','mock_marked','focus_completed'));

-- ---------------------------------------------------------------------------
-- Roles: anyone may call themselves a student, parent or teacher (never admin).
-- Being a teacher only lets you make classes; students join them with a code.
-- ---------------------------------------------------------------------------
create or replace function public.protect_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or current_setting('alo.allow_role', true) = 'on' then
    return new;
  end if;
  if tg_op = 'INSERT' and new.role = 'admin' and not public.is_admin() then
    new.role := 'student';
  elsif tg_op = 'UPDATE' and new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end $$;

create or replace function public.set_my_role(r text) returns text
language plpgsql security definer set search_path = public as $$
declare cur public.user_role;
begin
  if auth.uid() is null then raise exception 'sign in first' using errcode = '28000'; end if;
  if r not in ('student','parent','teacher') then raise exception 'role not allowed' using errcode = '22023'; end if;
  select role into cur from public.profiles where id = auth.uid();
  if cur = 'admin' then return 'admin'; end if; -- admins keep their role
  perform set_config('alo.allow_role', 'on', true);
  insert into public.profiles (id, role) values (auth.uid(), r::public.user_role)
    on conflict (id) do update set role = excluded.role, updated_at = now();
  perform set_config('alo.allow_role', 'off', true);
  return r;
end $$;

create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select coalesce((select role::text from public.profiles where id = auth.uid()), 'student')
$$;

-- ---------------------------------------------------------------------------
-- Classes: fix policies that referred to each other (Postgres rejects recursive RLS)
-- and stop students adding themselves to any class without its join code.
-- ---------------------------------------------------------------------------
create or replace function public.is_class_teacher(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.classes where id = cid and teacher_id = auth.uid())
$$;
create or replace function public.is_class_member(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.class_members where class_id = cid and user_id = auth.uid())
$$;

drop policy if exists classes_teacher on public.classes;
drop policy if exists classes_member_read on public.classes;
drop policy if exists class_members_self on public.class_members;
drop policy if exists class_members_teacher on public.class_members;
drop policy if exists class_members_teacher_remove on public.class_members;
drop policy if exists assignments_member on public.assignments;

create policy classes_teacher_read on public.classes for select using (teacher_id = auth.uid());
create policy classes_teacher_insert on public.classes for insert
  with check (teacher_id = auth.uid() and public.my_role() in ('teacher','admin'));
create policy classes_teacher_update on public.classes for update using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy classes_teacher_delete on public.classes for delete using (teacher_id = auth.uid());
create policy classes_member_read on public.classes for select using (public.is_class_member(id));
create policy classes_admin on public.classes for select using (public.is_admin());

create policy class_members_self_read on public.class_members for select using (user_id = auth.uid());
create policy class_members_self_update on public.class_members for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy class_members_self_leave on public.class_members for delete using (user_id = auth.uid());
create policy class_members_teacher_read on public.class_members for select using (public.is_class_teacher(class_id));
create policy class_members_teacher_remove on public.class_members for delete using (public.is_class_teacher(class_id));
create policy assignments_member on public.assignments for select using (public.is_class_member(class_id));

-- Join a class by its code. Returns the class id and name.
create or replace function public.join_class(code text, nick text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare c public.classes;
begin
  if auth.uid() is null then raise exception 'sign in first' using errcode = '28000'; end if;
  if char_length(coalesce(trim(nick), '')) not between 1 and 24 then raise exception 'nickname 1-24 characters' using errcode = '22023'; end if;
  select * into c from public.classes where join_code = upper(trim(code));
  if not found then raise exception 'no class with that code' using errcode = 'P0002'; end if;
  if c.teacher_id = auth.uid() then raise exception 'that is your own class' using errcode = '22023'; end if;
  insert into public.class_members (class_id, user_id, nickname) values (c.id, auth.uid(), trim(nick))
    on conflict (class_id, user_id) do update set nickname = excluded.nickname;
  return jsonb_build_object('id', c.id, 'name', c.name);
end $$;

-- ---------------------------------------------------------------------------
-- Student summaries: the student's own device computes streak, hours, readiness and
-- predicted GPA (the same numbers it shows the student) and publishes them here.
-- Parents and teachers read this, never the raw rows behind it.
-- ---------------------------------------------------------------------------
create table public.student_summaries (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null check (pg_column_size(data) < 8192),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.student_summaries enable row level security;
create trigger student_summaries_touch before update on public.student_summaries for each row execute function public.touch_updated_at();
create policy student_summaries_own on public.student_summaries for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy student_summaries_parent on public.student_summaries for select using (public.is_parent_of(user_id));
create policy student_summaries_teacher on public.student_summaries for select using (public.is_teacher_of(user_id));
grant select, insert, update, delete on public.student_summaries to authenticated;

-- ---------------------------------------------------------------------------
-- Parent link: the student makes a short-lived, single-use code and gives it to a parent.
-- ---------------------------------------------------------------------------
create table public.parent_link_codes (
  student_id uuid primary key references auth.users (id) on delete cascade,
  code text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
alter table public.parent_link_codes enable row level security;
create policy parent_link_codes_own on public.parent_link_codes for select using (student_id = auth.uid());

create table public.parent_link_attempts (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  tries int not null default 0,
  primary key (user_id, day)
);
alter table public.parent_link_attempts enable row level security;

create policy parent_links_parent_delete on public.parent_links for delete using (parent_id = auth.uid());

-- Letters and digits that can't be mixed up when read aloud or typed (no 0/O, 1/I/L).
create or replace function public.create_parent_code() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  c text;
  b bytea;
begin
  if auth.uid() is null then raise exception 'sign in first' using errcode = '28000'; end if;
  loop
    b := gen_random_bytes(8);
    c := '';
    for i in 0..7 loop c := c || substr(alphabet, 1 + get_byte(b, i) % length(alphabet), 1); end loop;
    exit when not exists (select 1 from public.parent_link_codes where code = c);
  end loop;
  insert into public.parent_link_codes (student_id, code, expires_at) values (auth.uid(), c, now() + interval '2 days')
    on conflict (student_id) do update set code = excluded.code, expires_at = excluded.expires_at, created_at = now();
  return jsonb_build_object('code', c, 'expires_at', now() + interval '2 days');
end $$;

-- Errors are returned, not raised, so the try counter is kept even when the code is wrong.
create or replace function public.link_parent(code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  k public.parent_link_codes;
  n int;
begin
  if auth.uid() is null then return jsonb_build_object('error', 'sign_in'); end if;
  -- At most 10 tries a day, so codes can't be guessed.
  insert into public.parent_link_attempts (user_id, day, tries) values (auth.uid(), public.bd_today(), 1)
    on conflict (user_id, day) do update set tries = parent_link_attempts.tries + 1
    returning tries into n;
  if n > 10 then return jsonb_build_object('error', 'too_many'); end if;
  select * into k from public.parent_link_codes
   where parent_link_codes.code = upper(regexp_replace(link_parent.code, '[^A-Za-z0-9]', '', 'g')) and expires_at > now();
  if not found then return jsonb_build_object('error', 'not_found'); end if;
  if k.student_id = auth.uid() then return jsonb_build_object('error', 'own_code'); end if;
  insert into public.parent_links (parent_id, student_id, code) values (auth.uid(), k.student_id, k.code)
    on conflict (parent_id, student_id) do nothing;
  delete from public.parent_link_codes where student_id = k.student_id; -- single use
  return jsonb_build_object('student_id', k.student_id);
end $$;

-- ---------------------------------------------------------------------------
-- Teacher dashboard: one call returns members, their latest mastery per chapter,
-- submitted mock results and published summaries.
-- ---------------------------------------------------------------------------
create or replace function public.class_overview(cid uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_class_teacher(cid) and not public.is_admin() then
    raise exception 'not your class' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'members', coalesce((select jsonb_agg(jsonb_build_object('user_id', m.user_id, 'nickname', m.nickname, 'joined', m.created_at) order by m.nickname)
      from public.class_members m where m.class_id = cid), '[]'),
    'mastery', coalesce((select jsonb_agg(jsonb_build_object('user_id', x.user_id, 'chapter_id', x.chapter_id, 'score', x.score))
      from (select distinct on (ma.user_id, ma.chapter_id) ma.user_id, ma.chapter_id, round(ma.score)::int as score
              from public.mastery ma join public.class_members m on m.user_id = ma.user_id and m.class_id = cid
             where not ma.deleted order by ma.user_id, ma.chapter_id, ma.updated_at desc) x), '[]'),
    'mocks', coalesce((select jsonb_agg(jsonb_build_object('user_id', r.user_id, 'mock_id', r.mock_id, 'subject_code', r.subject_code,
              'mcq_score', r.mcq_score, 'cq_score', r.cq_score, 'total', r.total, 'submitted_at', r.submitted_at) order by r.submitted_at desc)
      from public.mock_results r join public.class_members m on m.user_id = r.user_id and m.class_id = cid
     where not r.deleted and r.submitted_at is not null), '[]'),
    'summaries', coalesce((select jsonb_object_agg(s.user_id, s.data)
      from public.student_summaries s join public.class_members m on m.user_id = s.user_id and m.class_id = cid), '{}')
  );
end $$;

-- ---------------------------------------------------------------------------
-- Admin analytics: daily active students, lesson completion, hardest questions.
-- Aggregates only; no per-student rows leave the database.
-- ---------------------------------------------------------------------------
create or replace function public.admin_analytics(days int default 14) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare since timestamptz := now() - make_interval(days => least(greatest(days, 1), 90));
begin
  if not public.is_admin() then raise exception 'admins only' using errcode = '42501'; end if;
  return jsonb_build_object(
    'daily_active', coalesce((select jsonb_agg(jsonb_build_object('day', d, 'students', n) order by d)
      from (select (created_at at time zone 'Asia/Dhaka')::date as d, count(distinct user_id) as n
              from public.events where created_at >= since and not deleted group by 1) x), '[]'),
    'lessons', jsonb_build_object(
      'started', (select count(*) from public.events where name = 'lesson_started' and created_at >= since and not deleted),
      'completed', (select count(*) from public.events where name = 'lesson_completed' and created_at >= since and not deleted)),
    'events', coalesce((select jsonb_object_agg(name, n) from (select name, count(*) as n from public.events
      where created_at >= since and not deleted group by name) x), '{}'),
    'hardest', coalesce((select jsonb_agg(jsonb_build_object('question_id', x.question_id, 'chapter_id', q.chapter_id, 'stem', left(q.stem, 140),
              'attempts', x.n, 'correct_pct', x.pct) order by x.pct, x.n desc)
      from (select question_id, count(*) as n, round(100.0 * count(*) filter (where correct) / count(*)) as pct
              from public.attempts where question_id is not null and created_at >= since and not deleted
             group by question_id having count(*) >= 5 order by 3, 2 desc limit 10) x
      join public.questions q on q.id = x.question_id), '[]'),
    'students', (select count(*) from public.profiles where role = 'student' and not deleted)
  );
end $$;

revoke all on function public.set_my_role(text), public.join_class(text, text), public.create_parent_code(),
  public.link_parent(text), public.class_overview(uuid), public.admin_analytics(int) from public, anon;
grant execute on function public.set_my_role(text), public.my_role(), public.join_class(text, text), public.create_parent_code(),
  public.link_parent(text), public.class_overview(uuid), public.admin_analytics(int) to authenticated;
