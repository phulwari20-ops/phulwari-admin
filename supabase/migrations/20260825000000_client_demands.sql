-- ===========================================================================
-- Client demands (Aug 2026): printable receipt fields, student edit + batch
-- management, fee breakdown, lead follow-up, and the full teacher payroll module.
--
-- Every statement is idempotent (IF NOT EXISTS) so it is safe to run more than
-- once. The admin panel degrades gracefully when a column is missing (it strips
-- unknown fields and keeps a localStorage copy), so applying this migration is
-- what turns those features from "works in the browser only" into "persisted".
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- students: payment / plan-validity / fee-breakdown / multi-batch fields that
-- the Registration form now prints and the ERP modal now edits.
-- ---------------------------------------------------------------------------
alter table public.students add column if not exists amount_paid         numeric(10,2);
alter table public.students add column if not exists total_fee           numeric(10,2);
alter table public.students add column if not exists payment_mode        text;
alter table public.students add column if not exists payment_for         text;
alter table public.students add column if not exists remarks             text;
alter table public.students add column if not exists plan_validity_date  date;
alter table public.students add column if not exists validity_end_date   date;
alter table public.students add column if not exists classes_total       integer default 12;
alter table public.students add column if not exists classes_consumed    integer default 0;
alter table public.students add column if not exists custom_days         text;
alter table public.students add column if not exists category            text;
-- Extra active batches a student is enrolled in beyond the primary batch_id,
-- stored as a JSON array of { batch_id, batch_name, fee_amount, added_on }.
alter table public.students add column if not exists additional_batches  jsonb default '[]'::jsonb;

-- ---------------------------------------------------------------------------
-- enquiries: next follow-up date for lead management.
-- ---------------------------------------------------------------------------
alter table public.enquiries add column if not exists next_follow_up_date date;

-- ---------------------------------------------------------------------------
-- teachers: full registration + salary configuration fields.
-- (Base table created in 20260821120000_add_missing_admin_tables.sql.)
-- ---------------------------------------------------------------------------
alter table public.teachers add column if not exists photo_url             text;
alter table public.teachers add column if not exists address               text;
alter table public.teachers add column if not exists qualification         text;
alter table public.teachers add column if not exists subject               text;
alter table public.teachers add column if not exists designation           text;
alter table public.teachers add column if not exists employment_type       text default 'Full Time';
alter table public.teachers add column if not exists salary_type           text default 'Monthly';
alter table public.teachers add column if not exists monthly_salary        numeric(10,2) default 0;
alter table public.teachers add column if not exists salary_effective_from date;
alter table public.teachers add column if not exists bank_details          text;
alter table public.teachers add column if not exists emergency_contact     text;
alter table public.teachers add column if not exists documents             text;

-- ---------------------------------------------------------------------------
-- teacher_payments: salary / advance / bonus ledger. Advances are tracked with
-- advance_taken (paid out now) and advance_adjusted (recovered from salary), so
-- the running advance balance = SUM(advance_taken) - SUM(advance_adjusted).
-- ---------------------------------------------------------------------------
create table if not exists public.teacher_payments (
  id               text primary key,
  teacher_id       text not null references public.teachers(id) on delete cascade,
  date             date not null default current_date,
  salary_month     text,
  salary_amount    numeric(10,2) default 0,
  advance_taken    numeric(10,2) default 0,
  advance_adjusted numeric(10,2) default 0,
  deduction        numeric(10,2) default 0,
  bonus            numeric(10,2) default 0,
  net_paid         numeric(10,2) default 0,
  payment_mode     text,
  payment_type     text default 'Salary',
  remarks          text,
  reference_no     text,
  created_at       timestamptz not null default now()
);
create index if not exists teacher_payments_teacher_idx on public.teacher_payments (teacher_id);

-- ---------------------------------------------------------------------------
-- teacher_attendance: one row per teacher per day.
-- ---------------------------------------------------------------------------
create table if not exists public.teacher_attendance (
  id         text primary key,             -- tatt-<teacher_id>-<date>
  teacher_id text not null references public.teachers(id) on delete cascade,
  date       date not null,
  status     text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists teacher_attendance_teacher_date_key
  on public.teacher_attendance (teacher_id, date);

-- ---------------------------------------------------------------------------
-- Row Level Security — match the permissive policies the rest of the admin uses
-- (the panel authenticates operators in application code).
-- ---------------------------------------------------------------------------
alter table public.teacher_payments   enable row level security;
alter table public.teacher_attendance enable row level security;

drop policy if exists "teacher_payments_all" on public.teacher_payments;
create policy "teacher_payments_all" on public.teacher_payments
  for all using (true) with check (true);

drop policy if exists "teacher_attendance_all" on public.teacher_attendance;
create policy "teacher_attendance_all" on public.teacher_attendance
  for all using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Realtime: the admin subscribes to new enquiries to raise a lead push alert.
-- Adding the table to the publication is what makes those INSERT events arrive.
-- (Guarded so re-running does not error if it is already a member.)
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'enquiries'
  ) then
    alter publication supabase_realtime add table public.enquiries;
  end if;
end $$;
