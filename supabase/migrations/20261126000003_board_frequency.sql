-- "Asked N times in the last 5 years": kept up to date from the board question bank.
create or replace function public.refresh_board_freq(ch uuid) returns void
language sql security definer set search_path = public as $$
  update public.chapters c
     set board_freq_5y = (
       select count(*) from public.questions q
        where q.chapter_id = ch and q.source = 'board' and q.published
          and q.year > extract(year from now())::int - 5
     )
   where c.id = ch
$$;

create or replace function public.questions_board_freq() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op in ('UPDATE', 'DELETE') and old.source = 'board' then perform public.refresh_board_freq(old.chapter_id); end if;
  if tg_op in ('INSERT', 'UPDATE') and new.source = 'board' then perform public.refresh_board_freq(new.chapter_id); end if;
  return null;
end $$;

drop trigger if exists questions_board_freq on public.questions;
create trigger questions_board_freq after insert or update or delete on public.questions
  for each row execute function public.questions_board_freq();
