select
  'donart_v10_orders' as origem,
  count(*) as total,
  count(*) filter (where coalesce(data->>'source','') = 'online_store') as online,
  count(*) filter (where coalesce(data->>'source','') <> 'online_store') as manuais
from public.donart_v10_orders;

select
  id,
  status,
  data->>'id' as public_id,
  data->>'source' as source,
  user_id,
  updated_at
from public.donart_v10_orders
order by updated_at desc
limit 50;

select
  p.proname as funcao,
  pg_get_function_identity_arguments(p.oid) as argumentos,
  p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname='public'
  and p.proname in (
    'donart_get_online_orders_v1',
    'donart_delete_online_test_order_v1'
  )
order by p.proname;

select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname='public'
  and tablename in (
    'donart_v10_orders',
    'donart_v10_order_items',
    'donart_v10_clients'
  )
order by tablename, policyname;
