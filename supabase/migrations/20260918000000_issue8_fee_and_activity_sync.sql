-- ============================================================================
-- PHULWARI ISSUE 8: DYNAMIC ACTIVITIES, MOTHER PROGRAMS & FEE TRACKING MIGRATION
-- Run this SQL in your Supabase SQL Editor to ensure all tables, columns, and indexes are in place.
-- ============================================================================

-- 1. Ensure `activity_pages` Table Exists with All Necessary CMS Columns
CREATE TABLE IF NOT EXISTS public.activity_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  aliases text[] DEFAULT '{}',
  badge_text text NOT NULL,
  title_tag text NOT NULL,
  meta_description text NOT NULL,
  h1 text NOT NULL,
  intro_p1 text NOT NULL,
  intro_p2 text,
  hero_image text NOT NULL,
  gallery_images text[] DEFAULT '{}',
  color text NOT NULL DEFAULT '#FF4D8D',
  bg text NOT NULL DEFAULT '#FFE6EF',
  content_color text,
  icon text NOT NULL DEFAULT 'Sparkles',
  why_matters_title text NOT NULL,
  why_matters_content text NOT NULL,
  benefits_title text NOT NULL,
  benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  programs_title text NOT NULL,
  programs jsonb NOT NULL DEFAULT '[]'::jsonb,
  why_choose_title text NOT NULL,
  why_choose_points jsonb NOT NULL DEFAULT '[]'::jsonb,
  hyper_local_title text NOT NULL,
  hyper_local_points jsonb NOT NULL DEFAULT '[]'::jsonb,
  testimonials jsonb NOT NULL DEFAULT '[]'::jsonb,
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  schema_json jsonb,
  cta jsonb,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Ensure Fee Transaction Columns and Fast Lookup Indexes Exist
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS receipt_no text;
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS transaction_id text;
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS collection_type text DEFAULT 'Multiple Fee Collection';
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS fee_head text;
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS collected_for text;
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS amount numeric DEFAULT 0;
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS discount numeric DEFAULT 0;
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS discount_type text DEFAULT 'flat';
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS net_amount numeric DEFAULT 0;
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS amount_paid numeric DEFAULT 0;
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS pending_amount numeric DEFAULT 0;
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS mode_of_payment text;
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS collection_date date;
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS collection_time timestamp with time zone DEFAULT now();
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS remarks text;
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS plan_validity_end date;

-- Create Indexes on fees for instant search and sorting
CREATE INDEX IF NOT EXISTS idx_fees_receipt_no ON public.fees (receipt_no);
CREATE INDEX IF NOT EXISTS idx_fees_student_id ON public.fees (student_id);
CREATE INDEX IF NOT EXISTS idx_fees_collection_date ON public.fees (collection_date DESC);
CREATE INDEX IF NOT EXISTS idx_fees_created_at ON public.fees (created_at DESC);

-- 3. Ensure Student Columns Exist for Categories & Dynamic Enrollment
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS category text DEFAULT 'Child Activity';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS program_interested text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS custom_days text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS classes_total integer DEFAULT 12;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS classes_consumed integer DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS validity_end_date date;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS plan_start_date date;

CREATE INDEX IF NOT EXISTS idx_students_category ON public.students (category);
CREATE INDEX IF NOT EXISTS idx_students_batch_id ON public.students (batch_id);

-- 4. Enable Row Level Security (RLS) & Public Policies
ALTER TABLE public.activity_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public all access on activity_pages') THEN
    CREATE POLICY "Allow public all access on activity_pages" ON public.activity_pages FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public all access on fees') THEN
    CREATE POLICY "Allow public all access on fees" ON public.fees FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public all access on students') THEN
    CREATE POLICY "Allow public all access on students" ON public.students FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
