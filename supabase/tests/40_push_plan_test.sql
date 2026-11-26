\set ON_ERROR_STOP on
-- Push subscriptions and plan items are private to their owner.
insert into auth.users (id) values ('00000000-0000-0000-0000-0000000000c1'), ('00000000-0000-0000-0000-0000000000c2') on conflict do nothing;

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c1', false);
insert into public.push_subscriptions (endpoint, user_id, p256dh, auth) values ('https://push.example/c1', '00000000-0000-0000-0000-0000000000c1', 'k', 'a');
insert into public.plan_items (id, user_id, date, kind, ref_id, minutes, subject_code, slot)
  values ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000c1', '2027-02-01', 'mcq', 'x', 30, '109', 1);
do $$ begin
  begin
    insert into public.push_subscriptions (endpoint, user_id, p256dh, auth) values ('https://push.example/evil', '00000000-0000-0000-0000-0000000000c2', 'k', 'a');
    raise exception 'inserted a subscription for someone else';
  exception when insufficient_privilege then null;
  end;
end $$;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c2', false);
do $$ begin assert (select count(*) from public.push_subscriptions) = 0, 'cannot see others'' subscriptions'; end $$;
do $$ begin assert (select count(*) from public.plan_items) = 0, 'cannot see others'' plan'; end $$;
reset role;
do $$ begin assert (select subject_code from public.plan_items where id = '30000000-0000-0000-0000-000000000001') = '109', 'plan item keeps subject'; end $$;
\echo 'push and plan tests passed'
