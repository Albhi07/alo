-- Study plan items carry the subject and their position in the day, and remember when the
-- student edited them (re-planning keeps edited and finished items as they are).
alter table public.plan_items
  add column if not exists subject_code text references public.subjects (code),
  add column if not exists slot int not null default 0,
  add column if not exists edited boolean not null default false;
