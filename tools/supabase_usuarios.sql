-- Gestor PrintAR 3D — usuários com aprovação e dados compartilhados da loja
-- Rodar UMA vez no Supabase: SQL Editor → colar tudo → Run.

-- 1) Tabela de perfis (aprovação e administrador)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  approved boolean not null default false,
  is_admin boolean not null default false,
  store_id uuid,
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists store_id uuid;
alter table public.profiles enable row level security;
grant select, update on public.profiles to authenticated;

-- 2) Funções auxiliares
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false)
$$;

-- loja que a conta usa: aprovada → loja do administrador; senão → a própria
create or replace function public.my_store() returns uuid
language sql security definer stable set search_path = public as $$
  select case when p.approved or p.is_admin then coalesce(p.store_id, p.id) else p.id end
  from public.profiles p where p.id = auth.uid()
$$;

-- 3) Perfil criado automaticamente para cada conta nova
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- perfis para as contas que já existem
insert into public.profiles (id, email)
  select u.id, u.email from auth.users u on conflict (id) do nothing;

-- 4) Administrador = dono dos dados atuais da loja (a linha com mais dados)
update public.profiles set is_admin = true, approved = true
  where id = (select s.id from public.stores s order by length(s.data::text) desc nulls last limit 1);

-- 5) Permissões da tabela de perfis
drop policy if exists "perfil: ler" on public.profiles;
drop policy if exists "perfil: admin altera" on public.profiles;
create policy "perfil: ler" on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy "perfil: admin altera" on public.profiles for update
  using (public.is_admin()) with check (public.is_admin());

-- 6) Dados da loja: cada conta lê/salva a loja que pode usar
do $$ declare r record; begin
  for r in select policyname from pg_policies where schemaname = 'public' and tablename = 'stores' loop
    execute format('drop policy %I on public.stores', r.policyname);
  end loop;
end $$;
create policy "loja: ler" on public.stores for select using (id = public.my_store());
create policy "loja: inserir" on public.stores for insert with check (id = public.my_store());
create policy "loja: atualizar" on public.stores for update using (id = public.my_store()) with check (id = public.my_store());

-- 7) Fotos: mesma regra (pasta da loja)
do $$ declare r record; begin
  for r in select policyname from pg_policies where schemaname = 'storage' and tablename = 'objects'
           and (coalesce(qual, '') like '%fotos%' or coalesce(with_check, '') like '%fotos%') loop
    execute format('drop policy %I on storage.objects', r.policyname);
  end loop;
end $$;
create policy "fotos: ler" on storage.objects for select
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = public.my_store()::text);
create policy "fotos: enviar" on storage.objects for insert
  with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = public.my_store()::text);
create policy "fotos: atualizar" on storage.objects for update
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = public.my_store()::text);

-- 8) Conferência: deve mostrar o seu e-mail como administrador
select email, approved as aprovado, is_admin as administrador from public.profiles order by created_at;
