-- DONART V10.0.7 — Loja Etapa 2 · Fotografias
-- Executar UMA VEZ no Supabase SQL Editor.
-- Não elimina nem altera produtos, clientes ou encomendas existentes.

-- 1) Bucket público apenas para imagens destinadas à loja.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'donart-shop',
  'donart-shop',
  true,
  8388608,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update
set public = true,
    file_size_limit = 8388608,
    allowed_mime_types = array['image/jpeg','image/png','image/webp'];

-- 2) Cada utilizador autenticado só pode gerir ficheiros dentro da sua pasta.
drop policy if exists "donart_shop_insert_own" on storage.objects;
create policy "donart_shop_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'donart-shop'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "donart_shop_update_own" on storage.objects;
create policy "donart_shop_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'donart-shop'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'donart-shop'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "donart_shop_delete_own" on storage.objects;
create policy "donart_shop_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'donart-shop'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "donart_shop_select_own" on storage.objects;
create policy "donart_shop_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'donart-shop'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- O bucket é público apenas para LEITURA das fotografias da loja.
-- Upload/alteração/eliminação continuam limitados ao utilizador autenticado.
