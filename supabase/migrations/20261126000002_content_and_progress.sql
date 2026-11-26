-- Alo data model: content (public-read when published), exam config, student progress
-- (device-synced, last-write-wins), classes, parent links. RLS on every table.

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------
create table public.subjects (
  code text primary key,
  name_bn text not null,
  name_en text not null,
  groups text[] not null default '{}',
  is_compulsory boolean not null default false,
  mark_scheme text not null check (mark_scheme in ('cq70_mcq30','cq50_mcq25_prac25','ict_th50_prac50','english_written100')),
  has_practical boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  subject_code text not null references public.subjects (code) on update cascade,
  number int not null,
  title_bn text not null,
  title_en text not null,
  syllabus_year int not null default 2027,
  board_freq_5y int not null default 0,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subject_code, number, syllabus_year)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters (id) on delete cascade,
  title_bn text not null,
  title_en text not null,
  medium text not null check (medium in ('bn','en')),
  duration_s int not null default 0,
  size_bytes int not null default 0 check (size_bytes <= 3 * 1024 * 1024), -- a 10-minute lesson stays under 3 MB
  version int not null default 1,
  published boolean not null default false,
  sort int not null default 0,
  search tsvector generated always as (to_tsvector('simple', coalesce(title_bn,'') || ' ' || coalesce(title_en,''))) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index lessons_chapter on public.lessons (chapter_id);
create index lessons_search on public.lessons using gin (search);
create index lessons_title_trgm on public.lessons using gin ((title_bn || ' ' || title_en) gin_trgm_ops);

create table public.lesson_scenes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  idx int not null,
  type text not null check (type in ('text','formula','diagram','question','worked_step')),
  body_json jsonb not null,
  audio_path text,
  captions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, idx)
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters (id) on delete cascade,
  kind text not null check (kind in ('mcq','cq','short')),
  subtype text check (subtype in ('single','multi_completion','situation','cq')),
  medium text not null check (medium in ('bn','en')),
  stem text not null,
  options_json jsonb,
  answer_json jsonb not null,
  explanation text,
  marks_json jsonb,
  source text not null default 'original' check (source in ('board','original')),
  board text,
  year int check (year between 2000 and 2100),
  difficulty int check (difficulty between 1 and 5),
  tags text[] not null default '{}',
  published boolean not null default true,
  search tsvector generated always as (to_tsvector('simple', coalesce(stem,'') || ' ' || coalesce(explanation,''))) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (source = 'original' or (board is not null and year is not null))
);
create index questions_chapter_kind on public.questions (chapter_id, kind);
create index questions_board_year on public.questions (board, year) where source = 'board';
create index questions_search on public.questions using gin (search);
create index questions_stem_trgm on public.questions using gin (stem gin_trgm_ops);

create table public.drill_templates (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters (id) on delete cascade,
  title text not null,
  vars_json jsonb not null,
  constraints_json jsonb not null default '[]',
  solution_js text not null, -- a data-only solution script (safe expression DSL, never eval'd JS)
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.method_sheets (
  id uuid primary key default gen_random_uuid(),
  subject_code text not null references public.subjects (code),
  chapter_id uuid references public.chapters (id) on delete set null,
  question_type text not null,
  medium text not null default 'bn' check (medium in ('bn','en')),
  body_md text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mocks (
  id uuid primary key default gen_random_uuid(),
  subject_code text not null references public.subjects (code),
  title text not null,
  medium text not null default 'bn' check (medium in ('bn','en')),
  paper_json jsonb not null,
  duration_mcq_min int not null,
  duration_cq_min int not null,
  exam_year int not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notices (
  id uuid primary key default gen_random_uuid(),
  title_bn text not null,
  title_en text not null,
  body text,
  event_date date,
  source_url text,
  last_checked date,
  verified boolean not null default false,
  board text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exam_config (
  exam_year int primary key,
  written_start date not null,
  written_end date not null,
  practical_start date,
  practical_end date,
  results_date date,
  status text not null default 'upcoming' check (status in ('upcoming','running','done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.routine (
  id uuid primary key default gen_random_uuid(),
  exam_year int not null references public.exam_config (exam_year) on update cascade,
  date date not null,
  subject_code text not null references public.subjects (code),
  paper text not null,
  start_time time not null default '10:00',
  duration_min int not null default 180,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (exam_year, subject_code, paper)
);

-- Content: anyone (even signed-out) may read; only admins write.
do $$
declare t text;
begin
  foreach t in array array['subjects','chapters','lessons','lesson_scenes','questions','drill_templates','method_sheets','mocks','notices','exam_config','routine'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create trigger %I before update on public.%I for each row execute function public.touch_updated_at()', t || '_touch', t);
    execute format('create policy %I on public.%I for all using (public.is_admin()) with check (public.is_admin())', t || '_admin', t);
  end loop;
end $$;

create policy subjects_read on public.subjects for select using (true);
create policy chapters_read on public.chapters for select using (true);
create policy lessons_read on public.lessons for select using (published);
create policy scenes_read on public.lesson_scenes for select using (exists (select 1 from public.lessons l where l.id = lesson_id and l.published));
create policy questions_read on public.questions for select using (published);
create policy drills_read on public.drill_templates for select using (true);
create policy method_read on public.method_sheets for select using (true);
create policy mocks_read on public.mocks for select using (published);
create policy notices_read on public.notices for select using (true);
create policy exam_config_read on public.exam_config for select using (true);
create policy routine_read on public.routine for select using (true);

-- ---------------------------------------------------------------------------
-- Student progress (written on the device first, synced with last-write-wins)
-- Each table has id (device-minted uuid), user_id, deleted flag, timestamps.
-- ---------------------------------------------------------------------------
create table public.attempts (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id uuid references public.questions (id) on delete set null,
  drill_template_id uuid references public.drill_templates (id) on delete set null,
  given_json jsonb,
  correct boolean,
  score numeric,
  time_ms int,
  device_id text,
  deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index attempts_user on public.attempts (user_id, created_at);

create table public.srs_cards (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  ease numeric not null default 2.5,
  interval_days int not null default 0,
  reps int not null default 0,
  due_on date not null,
  deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, question_id)
);

create table public.mastery (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  chapter_id uuid not null references public.chapters (id) on delete cascade,
  score numeric not null default 0 check (score between 0 and 100),
  deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, chapter_id)
);

create table public.mock_results (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  mock_id uuid references public.mocks (id) on delete set null,
  subject_code text references public.subjects (code),
  mcq_score numeric,
  cq_score numeric,
  practical_score numeric,
  total numeric,
  self_marked boolean not null default false,
  ai_marked boolean not null default false,
  started_at timestamptz,
  submitted_at timestamptz,
  deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.focus_sessions (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  subject_code text,
  started_at timestamptz not null,
  ended_at timestamptz,
  minutes int not null default 0 check (minutes between 0 and 600),
  device_id text,
  deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index focus_user_started on public.focus_sessions (user_id, started_at);

create table public.plans (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  generated_at timestamptz not null default now(),
  deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plan_items (
  id uuid primary key,
  plan_id uuid,
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  kind text not null check (kind in ('lesson','mcq','cq','mock','revision','rest')),
  ref_id text,
  minutes int not null default 0,
  done boolean not null default false,
  deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index plan_items_user_date on public.plan_items (user_id, date);

do $$
declare t text;
begin
  foreach t in array array['attempts','srs_cards','mastery','mock_results','focus_sessions','plans','plan_items'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create trigger %I before insert or update on public.%I for each row execute function public.lww_guard()', t || '_lww', t);
    execute format('create policy %I on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t || '_own', t);
    execute format('create policy %I on public.%I for select using (public.is_admin())', t || '_admin', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- AI tutor (written only by the Edge Function with the service role)
-- ---------------------------------------------------------------------------
create table public.tutor_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject_code text references public.subjects (code),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.tutor_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.tutor_threads (id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  image_path text,
  tokens_in int not null default 0,
  tokens_out int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tutor_messages_thread on public.tutor_messages (thread_id, created_at);
alter table public.tutor_threads enable row level security;
alter table public.tutor_messages enable row level security;
create policy tutor_threads_own on public.tutor_threads for select using (user_id = auth.uid());
create policy tutor_messages_own on public.tutor_messages for select using (
  exists (select 1 from public.tutor_threads t where t.id = thread_id and t.user_id = auth.uid()));
create policy tutor_threads_admin on public.tutor_threads for select using (public.is_admin());
create policy tutor_messages_admin on public.tutor_messages for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Classes and parents
-- ---------------------------------------------------------------------------
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  join_code text not null unique default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 6)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.class_members (
  class_id uuid not null references public.classes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  nickname text check (char_length(nickname) <= 24),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (class_id, user_id)
);
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  kind text not null check (kind in ('chapter','mock')),
  ref_id uuid not null,
  due_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.parent_links (
  parent_id uuid not null references auth.users (id) on delete cascade,
  student_id uuid not null references auth.users (id) on delete cascade,
  code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (parent_id, student_id)
);

alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.assignments enable row level security;
alter table public.parent_links enable row level security;

create policy classes_teacher on public.classes for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy classes_member_read on public.classes for select using (
  exists (select 1 from public.class_members m where m.class_id = id and m.user_id = auth.uid()));
create policy class_members_self on public.class_members for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy class_members_teacher on public.class_members for select using (
  exists (select 1 from public.classes c where c.id = class_id and c.teacher_id = auth.uid()));
create policy class_members_teacher_remove on public.class_members for delete using (
  exists (select 1 from public.classes c where c.id = class_id and c.teacher_id = auth.uid()));
create policy assignments_teacher on public.assignments for all using (
  exists (select 1 from public.classes c where c.id = class_id and c.teacher_id = auth.uid()))
  with check (exists (select 1 from public.classes c where c.id = class_id and c.teacher_id = auth.uid()));
create policy assignments_member on public.assignments for select using (
  exists (select 1 from public.class_members m where m.class_id = assignments.class_id and m.user_id = auth.uid()));
create policy parent_links_parent on public.parent_links for select using (parent_id = auth.uid());
create policy parent_links_student on public.parent_links for select using (student_id = auth.uid());
create policy parent_links_student_delete on public.parent_links for delete using (student_id = auth.uid());
-- Linking itself happens through a security-definer RPC (M8) that checks the student's code.

-- ---------------------------------------------------------------------------
-- Role helpers (security definer so policies don't recurse through RLS)
-- ---------------------------------------------------------------------------
create or replace function public.is_teacher_of(student uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.class_members m join public.classes c on c.id = m.class_id
    where m.user_id = student and c.teacher_id = auth.uid()
  )
$$;

create or replace function public.is_parent_of(student uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.parent_links where parent_id = auth.uid() and student_id = student)
$$;

-- Teachers see class members' mastery and mock results (heatmap, results table).
create policy mastery_teacher on public.mastery for select using (public.is_teacher_of(user_id));
create policy mock_results_teacher on public.mock_results for select using (public.is_teacher_of(user_id));


do $$
declare t text;
begin
  foreach t in array array['tutor_threads','tutor_messages','classes','class_members','assignments','parent_links'] loop
    execute format('create trigger %I before update on public.%I for each row execute function public.touch_updated_at()', t || '_touch', t);
  end loop;
end $$;

-- Synced client tables include `events` (core migration) and these; grant to API roles.
grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
