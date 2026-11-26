-- AI tutor: daily quotas, token log, content search for the model's tools, exam-hours lock,
-- and a private bucket for photos of handwritten answers. Only the tutor Edge Function
-- (service role) writes here; students can read their own usage.

do $$ begin create role service_role nologin bypassrls; exception when duplicate_object then null; end $$;

create table public.tutor_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  messages int not null default 0,
  photos int not null default 0,
  tokens_in bigint not null default 0,
  tokens_out bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);
alter table public.tutor_usage enable row level security;
create policy tutor_usage_own on public.tutor_usage for select using (user_id = auth.uid());
create policy tutor_usage_admin on public.tutor_usage for select using (public.is_admin());

-- Bangladesh date (UTC+6, no daylight saving).
create or replace function public.bd_today() returns date
language sql stable as $$ select (now() at time zone 'Asia/Dhaka')::date $$;

-- Take one message (or one photo) from today's quota. Atomic: the row lock serialises
-- parallel requests from the same student. Returns what is left, or ok=false when spent.
create or replace function public.tutor_take(uid uuid, is_photo boolean, max_messages int, max_photos int)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u public.tutor_usage;
begin
  insert into public.tutor_usage (user_id, day) values (uid, public.bd_today()) on conflict do nothing;
  select * into u from public.tutor_usage where user_id = uid and day = public.bd_today() for update;
  if (is_photo and u.photos >= max_photos) or (not is_photo and u.messages >= max_messages) then
    return jsonb_build_object('ok', false, 'messages_left', greatest(0, max_messages - u.messages), 'photos_left', greatest(0, max_photos - u.photos));
  end if;
  update public.tutor_usage
     set messages = messages + (case when is_photo then 0 else 1 end),
         photos = photos + (case when is_photo then 1 else 0 end),
         updated_at = now()
   where user_id = uid and day = u.day
   returning * into u;
  return jsonb_build_object('ok', true, 'messages_left', greatest(0, max_messages - u.messages), 'photos_left', greatest(0, max_photos - u.photos));
end $$;

-- Give a unit back when the model call failed, and log tokens when it worked.
create or replace function public.tutor_settle(uid uuid, is_photo boolean, refund boolean, t_in int, t_out int)
returns void language sql security definer set search_path = public as $$
  update public.tutor_usage
     set messages = case when refund and not is_photo then greatest(0, messages - 1) else messages end,
         photos = case when refund and is_photo then greatest(0, photos - 1) else photos end,
         tokens_in = tokens_in + t_in,
         tokens_out = tokens_out + t_out,
         updated_at = now()
   where user_id = uid and day = public.bd_today()
$$;

-- True while any routine paper is being written (30 minutes before start until it ends),
-- Bangladesh time. The tutor stays closed then so it can't be used to cheat.
create or replace function public.exam_in_progress(at timestamptz default now())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.routine r
    where (at at time zone 'Asia/Dhaka') between (r.date + r.start_time - interval '30 minutes')
                                             and (r.date + r.start_time + make_interval(mins => r.duration_min))
  )
$$;

-- Search published lessons, chapters and questions for the tutor's search_lessons tool.
create or replace function public.tutor_search(q text, subj text default null, lim int default 8)
returns table (chapter_id uuid, subject_code text, chapter_no int, chapter_bn text, chapter_en text, hit text, kind text)
language sql stable security definer set search_path = public as $$
  with hits as (
    select c.id as chapter_id, null::text as hit, 'chapter' as kind, 3 as rank
      from public.chapters c
     where (c.title_bn ilike '%' || q || '%' or c.title_en ilike '%' || q || '%')
    union all
    select l.chapter_id, l.title_bn || ' / ' || l.title_en, 'lesson', 2
      from public.lessons l
     where l.published and (l.search @@ websearch_to_tsquery('simple', q) or (l.title_bn || ' ' || l.title_en) ilike '%' || q || '%')
    union all
    select qu.chapter_id, left(qu.stem, 160), qu.kind, 1
      from public.questions qu
     where qu.published and (qu.search @@ websearch_to_tsquery('simple', q) or qu.stem ilike '%' || q || '%')
  )
  select h.chapter_id, c.subject_code, c.number, c.title_bn, c.title_en, h.hit, h.kind
    from hits h join public.chapters c on c.id = h.chapter_id
   where subj is null or c.subject_code = subj
   order by h.rank desc, c.subject_code, c.number
   limit least(greatest(lim, 1), 20)
$$;

revoke all on function public.tutor_take(uuid, boolean, int, int) from public, anon, authenticated;
revoke all on function public.tutor_settle(uuid, boolean, boolean, int, int) from public, anon, authenticated;
grant execute on function public.tutor_take(uuid, boolean, int, int) to service_role;
grant execute on function public.tutor_settle(uuid, boolean, boolean, int, int) to service_role;
grant execute on function public.exam_in_progress(timestamptz) to anon, authenticated, service_role;
grant execute on function public.tutor_search(text, text, int) to anon, authenticated, service_role;
grant select on public.tutor_usage to authenticated;

-- Photos of handwritten answers: private, one folder per student (<user id>/<file>).
do $$ begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('tutor-photos', 'tutor-photos', false, 5 * 1024 * 1024, array['image/jpeg','image/png','image/webp'])
    on conflict (id) do nothing;
    execute $p$create policy tutor_photos_insert on storage.objects for insert to authenticated
      with check (bucket_id = 'tutor-photos' and (storage.foldername(name))[1] = auth.uid()::text)$p$;
    execute $p$create policy tutor_photos_select on storage.objects for select to authenticated
      using (bucket_id = 'tutor-photos' and (storage.foldername(name))[1] = auth.uid()::text)$p$;
    execute $p$create policy tutor_photos_delete on storage.objects for delete to authenticated
      using (bucket_id = 'tutor-photos' and (storage.foldername(name))[1] = auth.uid()::text)$p$;
  end if;
end $$;
