-- ===========================================================================
-- Party Packages & Birthday Landing Config RLS Policies
-- Enables full select/insert/update/delete operations for anonymous users
-- matching the security model of the rest of the Phulwari Admin panel.
-- ===========================================================================

-- 1. party_packages policies
alter table public.party_packages enable row level security;
drop policy if exists "party_packages_all" on public.party_packages;
create policy "party_packages_all" on public.party_packages
  for all using (true) with check (true);

-- 2. birthday_landing_config policies
alter table public.birthday_landing_config enable row level security;
drop policy if exists "birthday_landing_config_all" on public.birthday_landing_config;
create policy "birthday_landing_config_all" on public.birthday_landing_config
  for all using (true) with check (true);

-- 3. announcements policies
alter table public.announcements enable row level security;
drop policy if exists "announcements_all" on public.announcements;
create policy "announcements_all" on public.announcements
  for all using (true) with check (true);

-- 4. add admission_date column to students
alter table public.students add column if not exists admission_date date default current_date;
