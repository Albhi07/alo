-- Mock results keep the paper's maximum marks, so a percentage can be shown (and used by
-- the readiness score) before the CQ part is self-marked.
alter table public.mock_results
  add column if not exists mcq_max numeric,
  add column if not exists max_total numeric;
