-- Core access model with invite codes and role-based profiles.
create type public.app_role as enum ('admin', 'client');
create type public.invite_code_status as enum ('pending', 'used', 'disabled');
create type public.booking_status as enum ('requested', 'confirmed', 'completed', 'cancelled');
create type public.booking_source as enum ('manual', 'outlook');
create type public.invoice_status as enum ('draft', 'issued', 'paid', 'overdue', 'cancelled');
create type public.payment_status as enum ('unpaid', 'partially_paid', 'paid', 'failed');

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

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  dog_id uuid references public.dogs (id) on delete set null,
  outlook_event_id text unique,
  service_name text not null,
  title text,
  dog_names text[] not null default '{}',
  outlook_categories text[] not null default '{}',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  cancelled_at timestamptz,
  source public.booking_source not null default 'manual',
  status public.booking_status not null default 'requested',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  booking_id uuid references public.bookings (id) on delete set null,
  invoice_number text unique not null,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'EUR',
  status public.invoice_status not null default 'issued',
  due_date date,
  issued_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.payment_links (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  provider text not null,
  provider_reference text,
  url text not null,
  status public.payment_status not null default 'unpaid',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'EUR',
  spent_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses (id) on delete cascade,
  file_url text not null,
  notes text,
  created_at timestamptz not null default now()
);

-- Helper functions to avoid RLS self-recursion in policies.
create or replace function public.current_profile_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
  limit 1;
$$;

create or replace function public.current_profile_client_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.client_id
  from public.profiles p
  where p.id = auth.uid()
  limit 1;
$$;

alter table public.clients enable row level security;
alter table public.profiles enable row level security;
alter table public.invite_codes enable row level security;
alter table public.dogs enable row level security;
alter table public.bookings enable row level security;
alter table public.invoices enable row level security;
alter table public.payment_links enable row level security;
alter table public.expenses enable row level security;
alter table public.receipts enable row level security;

create policy "admin_all_clients" on public.clients
for all using (
  public.current_profile_role() = 'admin'
);

create policy "client_own_client" on public.clients
for select using (
  id = public.current_profile_client_id()
);

create policy "admin_all_profiles" on public.profiles
for all using (
  public.current_profile_role() = 'admin'
);

create policy "user_own_profile" on public.profiles
for select using (id = auth.uid());

create policy "admin_manage_invites" on public.invite_codes
for all using (
  public.current_profile_role() = 'admin'
);

create policy "admin_all_dogs" on public.dogs
for all using (
  public.current_profile_role() = 'admin'
);

create policy "client_own_dogs" on public.dogs
for select using (
  client_id = public.current_profile_client_id()
);

create policy "admin_all_bookings" on public.bookings
for all using (
  public.current_profile_role() = 'admin'
);

create policy "client_own_bookings" on public.bookings
for select using (
  client_id = public.current_profile_client_id()
);

create policy "client_update_own_bookings" on public.bookings
for update using (
  client_id = public.current_profile_client_id()
)
with check (
  client_id = public.current_profile_client_id()
);

create policy "admin_all_invoices" on public.invoices
for all using (
  public.current_profile_role() = 'admin'
);

create policy "client_own_invoices" on public.invoices
for select using (
  client_id = public.current_profile_client_id()
);

create policy "admin_all_payment_links" on public.payment_links
for all using (
  public.current_profile_role() = 'admin'
);

create policy "client_own_payment_links" on public.payment_links
for select using (
  exists (
    select 1
    from public.invoices i
    where i.id = payment_links.invoice_id
      and i.client_id = public.current_profile_client_id()
  )
);

create policy "admin_all_expenses" on public.expenses
for all using (
  public.current_profile_role() = 'admin'
);

create policy "admin_all_receipts" on public.receipts
for all using (
  public.current_profile_role() = 'admin'
);

-- Bootstrap note:
-- Your admin account is any auth user that has a row in public.profiles with role='admin'.
-- Example (run once in Supabase SQL editor after creating the user in Auth):
-- insert into public.profiles (id, role)
-- values ('YOUR_AUTH_USER_UUID', 'admin')
-- on conflict (id) do update set role = excluded.role, client_id = null;

-- Invite activation should be done by secure function with service role key; no direct client writes.
create policy "block_direct_client_invite_changes" on public.invite_codes
for update using (false);
