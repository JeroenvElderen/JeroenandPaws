-- Core schema for Jeroen & Paws mobile + backend
create extension if not exists pgcrypto;

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  mobile text,
  email text,
  whatsapp_number text,
  invoice_email_alias text,
  active boolean not null default true,
  notes text,
  invite_code_hash text unique,
  invite_code_used_at timestamptz
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique,
  role text not null check (role in ('admin','client')),
  client_id uuid references clients(id),
  full_name text,
  email text,
  mobile text
);

create table if not exists dogs (id uuid primary key default gen_random_uuid(), client_id uuid not null references clients(id), dog_name text not null, breed text, notes text, active boolean default true);
create table if not exists client_prices (id uuid primary key default gen_random_uuid(), client_id uuid not null references clients(id), dog_id uuid references dogs(id), service_type text not null, duration text not null, price numeric(10,2) not null, active boolean default true);
create table if not exists bookings (id uuid primary key default gen_random_uuid(), client_id uuid not null references clients(id), dog_id uuid not null references dogs(id), service_type text not null, duration text not null, booking_date timestamptz not null, status text not null, outlook_event_id text, created_by uuid, cancelled_at timestamptz);
create table if not exists booking_requests (id uuid primary key default gen_random_uuid(), client_id uuid not null references clients(id), dog_id uuid references dogs(id), requested_date date not null, service_type text not null, duration text not null, message text, status text not null default 'pending');
create table if not exists invoices (id uuid primary key default gen_random_uuid(), client_id uuid not null references clients(id), invoice_number text unique not null, issue_date date not null, due_date date not null, subtotal numeric(10,2) not null, total_amount numeric(10,2) not null, status text not null, revolut_order_id text, checkout_url text, pdf_url text, internal_email_sent_at timestamptz);
create table if not exists payment_links (id uuid primary key default gen_random_uuid(), invoice_id uuid not null references invoices(id), invoice_line_id uuid, revolut_order_id text not null, checkout_url text not null, status text not null, sent_whatsapp_at timestamptz);
create table if not exists payments (id uuid primary key default gen_random_uuid(), invoice_id uuid not null references invoices(id), revolut_payment_id text, amount numeric(10,2), paid_at timestamptz, status text not null);
create table if not exists expenses (id uuid primary key default gen_random_uuid(), amount numeric(10,2) not null, currency text not null, category text, merchant text, description text, expense_date date not null, receipt_required boolean default true, receipt_url text, reconciled boolean default false, missing_receipt boolean default false, revolut_transaction_id text);
create table if not exists owner_draws (id uuid primary key default gen_random_uuid(), amount numeric(10,2) not null, draw_date date not null, description text, revolut_transaction_id text);

alter table profiles enable row level security;
alter table dogs enable row level security;
alter table bookings enable row level security;
alter table booking_requests enable row level security;
alter table invoices enable row level security;
alter table payment_links enable row level security;

create policy profiles_select_self_or_admin on profiles for select using (
  exists (select 1 from profiles me where me.auth_user_id = auth.uid() and (me.role = 'admin' or me.auth_user_id = profiles.auth_user_id))
);

create policy client_scoped_dogs on dogs for select using (
  exists (select 1 from profiles me where me.auth_user_id = auth.uid() and (me.role = 'admin' or me.client_id = dogs.client_id))
);

create policy client_scoped_bookings on bookings for select using (
  exists (select 1 from profiles me where me.auth_user_id = auth.uid() and (me.role = 'admin' or me.client_id = bookings.client_id))
);
