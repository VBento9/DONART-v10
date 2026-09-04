-- DONART V10.0.6 — LOJA ETAPA 1
-- Objetivo: incluir produtos V10 no Realtime.
-- Seguro para executar várias vezes. Não elimina dados.

alter table public.donart_v10_products enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname='supabase_realtime'
      and schemaname='public'
      and tablename='donart_v10_products'
  ) then
    alter publication supabase_realtime add table public.donart_v10_products;
  end if;
end $$;

notify pgrst, 'reload schema';
