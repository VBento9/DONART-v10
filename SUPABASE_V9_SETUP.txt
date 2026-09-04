-- DONART V9.0.0 — BASE CLOUD NOVA E INDEPENDENTE
-- NÃO altera nem elimina public.donart_state (V8).

create table if not exists public.donart_v9_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  app_version text,
  device_id text,
  updated_at timestamptz not null default now(),
  revision bigint not null default 0
);

alter table public.donart_v9_state enable row level security;

drop policy if exists "donart_v9_select_own" on public.donart_v9_state;
create policy "donart_v9_select_own"
on public.donart_v9_state for select
to authenticated using (auth.uid() = user_id);

drop policy if exists "donart_v9_insert_own" on public.donart_v9_state;
create policy "donart_v9_insert_own"
on public.donart_v9_state for insert
to authenticated with check (auth.uid() = user_id);

drop policy if exists "donart_v9_update_own" on public.donart_v9_state;
create policy "donart_v9_update_own"
on public.donart_v9_state for update
to authenticated using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant usage on schema public to authenticated;
grant select, insert, update on public.donart_v9_state to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.donart_v9_state;
exception when duplicate_object then null;
end $$;

notify pgrst, 'reload schema';
