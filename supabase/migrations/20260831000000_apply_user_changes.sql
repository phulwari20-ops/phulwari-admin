-- ===========================================================================
-- Database migration for student payments removal, blog SEO, and admission_date fix
-- Apply this SQL in your Supabase SQL Editor.
-- ===========================================================================

-- 1. Add missing admission_date to students table
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS admission_date DATE;

-- 2. Remove payment columns from students table (payment details are handled dynamically in fees table)
ALTER TABLE public.students DROP COLUMN IF EXISTS amount_paid;
ALTER TABLE public.students DROP COLUMN IF EXISTS total_fee;
ALTER TABLE public.students DROP COLUMN IF EXISTS payment_mode;
ALTER TABLE public.students DROP COLUMN IF EXISTS payment_for;
ALTER TABLE public.students DROP COLUMN IF EXISTS remarks;
ALTER TABLE public.students DROP COLUMN IF EXISTS plan_validity_date;

-- 3. Add SEO metadata columns to blogs table
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS focus_keyword TEXT;

-- 4. Enable RLS and add permissive policies for blogs table
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "blogs_all" ON public.blogs;
CREATE POLICY "blogs_all" ON public.blogs FOR ALL USING (true) WITH CHECK (true);
