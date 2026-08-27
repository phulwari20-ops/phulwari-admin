-- ===========================================================================
-- Fee Tracking + Student Photo columns
-- Run this in your Supabase SQL Editor
-- ===========================================================================

-- 1. Add fee tracking columns to fees table
alter table public.fees add column if not exists fee_head text;
alter table public.fees add column if not exists collected_for text;        -- 'One Time' or 'January 2027'
alter table public.fees add column if not exists mode_of_payment text;
alter table public.fees add column if not exists collection_date date;
alter table public.fees add column if not exists plan_validity_end date;
alter table public.fees add column if not exists collection_type text default 'Multiple Fee Collection';
alter table public.fees add column if not exists batch_id uuid references public.batches(id);

-- 2. Add photo_url to students
alter table public.students add column if not exists photo_url text;

-- 3. Create Supabase Storage bucket for student photos (run separately if needed)
-- insert into storage.buckets (id, name, public) values ('student-photos', 'student-photos', true) on conflict do nothing;

-- 4. Storage policy (run after bucket is created)
-- drop policy if exists "student_photos_all" on storage.objects;
-- create policy "student_photos_all" on storage.objects for all using (bucket_id = 'student-photos') with check (bucket_id = 'student-photos');
