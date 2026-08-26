-- Tables the admin panel already reads and writes but which were never created.
-- Until now `teachers` and `class_fees` returned HTTP 404 (PGRST205), so the
-- Teacher Management tab and the per-class fee settings failed silently and fell
-- back to browser localStorage.

-- ---------------------------------------------------------------------------
-- teachers
-- ---------------------------------------------------------------------------
-- `id` is text, not uuid: the admin generates ids client-side as `tch-<epoch>`
-- (app/page.tsx, handleSaveTeacher).
create table if not exists public.teachers (
  id             text primary key,
  name           text not null,
  email          text,
  phone          text,
  specialization text,
  assigned_batch text,
  status         text not null default 'Active',
  join_date      date default current_date,
  created_at     timestamptz not null default now()
);

create index if not exists teachers_status_idx on public.teachers (status);

-- ---------------------------------------------------------------------------
-- class_fees
-- ---------------------------------------------------------------------------
-- Written with .upsert({ class_name, monthly_fee }) and no explicit conflict
-- target, so class_name must carry the unique constraint itself.
create table if not exists public.class_fees (
  class_name  text primary key,
  monthly_fee numeric(10,2) not null default 0,
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- These match the access the rest of the admin's tables already grant: the
-- panel authenticates its own operators in application code and talks to
-- PostgREST with the publishable key.
alter table public.teachers   enable row level security;
alter table public.class_fees enable row level security;

drop policy if exists "teachers_all" on public.teachers;
create policy "teachers_all" on public.teachers
  for all using (true) with check (true);

drop policy if exists "class_fees_all" on public.class_fees;
create policy "class_fees_all" on public.class_fees
  for all using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Attendance integrity
-- ---------------------------------------------------------------------------
-- The batch/attendance blueprint requires one attendance row per class, per
-- student, per day. The unique index below is what makes the admin's
-- upsert(..., { onConflict: 'student_id,date,class_name,class_time' }) able to
-- change an already-marked status instead of failing with 23505.
-- Created only if an equivalent constraint is not already present.
do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and tablename  = 'attendance'
      and indexdef like '%student_id%date%class_name%class_time%'
  ) then
    create unique index attendance_student_date_class_time_key
      on public.attendance (student_id, date, class_name, class_time);
  end if;
end $$;
