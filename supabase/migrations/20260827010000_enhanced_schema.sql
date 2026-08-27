-- ===========================================================================
-- Database Schema updates for Phulwari dynamic fee heads, batch pricing,
-- display features, batch history tracking, and enhanced attendance markers.
-- Run this script inside your Supabase SQL Editor.
-- ===========================================================================

-- 1. Create fee_heads table (if not exists)
create table if not exists public.fee_heads (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  default_amount numeric(10,2) not null default 0,
  is_system boolean not null default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS for fee_heads
alter table public.fee_heads enable row level security;
drop policy if exists "fee_heads_all" on public.fee_heads;
create policy "fee_heads_all" on public.fee_heads for all using (true) with check (true);

-- Insert default preset heads if not already present
insert into public.fee_heads (name, default_amount, is_system) values
  ('Registration Fee', 1000.00, true),
  ('Monthly Fee', 3500.00, true),
  ('Exam Fee', 500.00, false),
  ('Sports Fee', 300.00, false),
  ('Library Fee', 200.00, false),
  ('Development Fee', 500.00, false)
on conflict (name) do nothing;


-- 2. Add Display & Configuration Columns to public.batches table
alter table public.batches add column if not exists fee_amount numeric(10,2) default 0;
alter table public.batches add column if not exists validity_days integer default 30;
alter table public.batches add column if not exists category text;
alter table public.batches add column if not exists subcategory text;
alter table public.batches add column if not exists location text;
alter table public.batches add column if not exists emoji text default '⚡';
alter table public.batches add column if not exists tagline text default 'Flexible child activity & learning sessions';
alter table public.batches add column if not exists description text default 'Specially designed schedule for kids activity engagement.';
alter table public.batches add column if not exists includes jsonb default '[]'::jsonb;
alter table public.batches add column if not exists child_benefits jsonb default '[]'::jsonb;
alter table public.batches add column if not exists mother_benefits jsonb default '[]'::jsonb;
alter table public.batches add column if not exists best_for text default 'Children seeking a fun, safe, and engaging environment.';


-- 3. Add History & Transaction Columns to public.students table
alter table public.students add column if not exists batch_history jsonb default '[]'::jsonb;


-- 4. Add Leave & Holiday Columns to public.attendance table
alter table public.attendance add column if not exists leave_reason text;
alter table public.attendance add column if not exists holiday_reason text;


-- 5. Add Transaction & Tracking Columns to public.fees table
alter table public.fees add column if not exists transaction_id text;
alter table public.fees add column if not exists collection_time text;
alter table public.fees add column if not exists remarks text;
