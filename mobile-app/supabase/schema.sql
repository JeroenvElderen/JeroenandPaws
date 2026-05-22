-- Core access model with invite codes and role-based profiles.
create type public.app_role as enum ('admin', 'client');
create type public.invite_code_status as enum ('pending', 'used', 'disabled');

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null,
  client_id uuid references public.clients (id),
  created_at timestamptz not null default now(),
  constraint client_role_requires_client_id
    check ((role = 'client' and client_id is not null) or (role = 'admin'))
);

create table if not exists public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  client_id uuid not null references public.clients (id) on delete cascade,
  status public.invite_code_status not null default 'pending',
  used_by_user_id uuid references auth.users (id),
  used_at timestamptz,
  expires_at timestamptz,
  reset_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.dogs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  breed text,
  birth_date date,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;
alter table public.profiles enable row level security;
alter table public.invite_codes enable row level security;
alter table public.dogs enable row level security;

create policy "admin_all_clients" on public.clients
for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "client_own_client" on public.clients
for select using (
  id = (select client_id from public.profiles where id = auth.uid())
);

create policy "admin_all_profiles" on public.profiles
for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "user_own_profile" on public.profiles
for select using (id = auth.uid());

create policy "admin_manage_invites" on public.invite_codes
for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "admin_all_dogs" on public.dogs
for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "client_own_dogs" on public.dogs
for select using (
  client_id = (select client_id from public.profiles where id = auth.uid())
);

-- Invite activation should be done by secure function with service role key; no direct client writes.
create policy "block_direct_client_invite_changes" on public.invite_codes
for update using (false);
