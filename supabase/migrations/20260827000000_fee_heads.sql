-- Create fee_heads table for fully dynamic admin fee heads configuration
create table if not exists public.fee_heads (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  default_amount numeric(10,2) not null default 0,
  is_system boolean not null default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.fee_heads enable row level security;

-- Create policy for all operations
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
