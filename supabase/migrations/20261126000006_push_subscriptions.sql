-- Web push subscriptions for exam reminders. A student sees and manages only their own;
-- the send-reminders Edge Function reads them with the service role.
create table public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  p256dh text not null,
  auth text not null,
  lang text not null default 'bn' check (lang in ('bn','en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index push_subscriptions_user on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;
create policy push_own_select on public.push_subscriptions for select using (user_id = auth.uid());
create policy push_own_insert on public.push_subscriptions for insert with check (user_id = auth.uid());
create policy push_own_update on public.push_subscriptions for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy push_own_delete on public.push_subscriptions for delete using (user_id = auth.uid());
create trigger push_subscriptions_touch before update on public.push_subscriptions for each row execute function public.touch_updated_at();
grant select, insert, update, delete on public.push_subscriptions to authenticated;

-- Notices that have already been pushed, so a daily run never sends one twice.
create table public.notice_pushes (
  notice_id uuid not null references public.notices (id) on delete cascade,
  kind text not null,
  sent_at timestamptz not null default now(),
  primary key (notice_id, kind)
);
alter table public.notice_pushes enable row level security;
