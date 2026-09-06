create or replace function public.donart_delete_online_test_order_v1(p_order_id uuid default null, p_public_id text default null)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_schema text;
  v_table text;
  v_idcol text;
  v_datacol text;
  v_sql text;
  v_count integer := 0;
begin
  if v_uid is null then
    raise exception 'authentication required';
  end if;

  if coalesce(p_public_id,'') !~ '^WEB-' then
    raise exception 'only WEB test orders can be deleted';
  end if;

  if not exists (
    select 1
    from public.donart_shop_settings s
    where (
      (s.data->>'orderApprovalMode') = 'testing'
      or (s.data->'shopDelivery'->>'orderApprovalMode') = 'testing'
      or coalesce(s.data->>'orderApprovalMode','') = ''
    )
  ) then
    raise exception 'test cleanup is disabled in production mode';
  end if;

  select n.nspname, c.relname
    into v_schema, v_table
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace pn on pn.oid=p.pronamespace
  join pg_catalog.pg_depend d on d.objid=p.oid
  join pg_catalog.pg_class c on c.oid=d.refobjid and c.relkind in ('r','p')
  join pg_catalog.pg_namespace n on n.oid=c.relnamespace
  where p.proname='donart_get_online_orders_v1'
    and pn.nspname='public'
    and n.nspname='public'
  order by c.relname
  limit 1;

  if v_table is null then
    raise exception 'online order source table not found';
  end if;

  select a.attname into v_idcol
  from pg_catalog.pg_attribute a
  join pg_catalog.pg_class c on c.oid=a.attrelid
  join pg_catalog.pg_namespace n on n.oid=c.relnamespace
  where n.nspname=v_schema and c.relname=v_table and a.attnum>0 and not a.attisdropped
    and a.attname='id'
  limit 1;

  select a.attname into v_datacol
  from pg_catalog.pg_attribute a
  join pg_catalog.pg_class c on c.oid=a.attrelid
  join pg_catalog.pg_namespace n on n.oid=c.relnamespace
  where n.nspname=v_schema and c.relname=v_table and a.attnum>0 and not a.attisdropped
    and a.attname='data'
  limit 1;

  if v_idcol is null or v_datacol is null then
    raise exception 'online order source has unexpected structure';
  end if;

  v_sql := format(
    'delete from %I.%I where (%I = $1 or %I->>''id'' = $2) and coalesce(%I->>''id'','''') like ''WEB-%%''',
    v_schema,v_table,v_idcol,v_datacol,v_datacol
  );
  execute v_sql using p_order_id,p_public_id;
  get diagnostics v_count = row_count;

  if v_count=0 then
    raise exception 'online test order not found';
  end if;

  return true;
end
$$;

revoke all on function public.donart_delete_online_test_order_v1(uuid,text) from public;
grant execute on function public.donart_delete_online_test_order_v1(uuid,text) to authenticated;
