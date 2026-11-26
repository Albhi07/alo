\set ON_ERROR_STOP on
-- Board questions keep chapters.board_freq_5y current; old years don't count.
do $$
declare ch uuid := (select id from public.chapters where subject_code = '109' and number = 3);
declare y int := extract(year from now())::int;
begin
  insert into public.questions (chapter_id, kind, subtype, medium, stem, answer_json, source, board, year)
  values (ch, 'mcq', 'single', 'bn', 'test 1', '{"index":0}', 'board', 'dhaka', y - 1),
         (ch, 'mcq', 'single', 'bn', 'test 2', '{"index":0}', 'board', 'sylhet', y - 2),
         (ch, 'mcq', 'single', 'bn', 'old', '{"index":0}', 'board', 'dhaka', y - 9);
  assert (select board_freq_5y from public.chapters where id = ch) = 2, 'two recent board questions';
  delete from public.questions where stem = 'test 1';
  assert (select board_freq_5y from public.chapters where id = ch) = 1, 'delete updates count';
  delete from public.questions where source = 'board';
end $$;
\echo 'board frequency tests passed'
