-- ============================================================================
-- PHULWARI ERP & FEE SYSTEM MIGRATION SCRIPT
-- Run this script in the Supabase SQL Editor to ensure all table columns exist.
-- ============================================================================

-- 1. Ensure all Program & Registration columns exist on the `students` table
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS category text DEFAULT 'Child Activity';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS program_interested text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS preferred_time_slot text DEFAULT 'Morning (9:00 AM - 12:00 PM)';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS custom_days text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS classes_total integer DEFAULT 12;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS classes_consumed integer DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS valid_until date;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS validity_end_date date;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS plan_start_date date;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS emergency_contact_name text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS emergency_relationship text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS emergency_phone text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS emergency_alt_phone text;

-- 2. Ensure all Fee Transaction columns exist on the `fees` table
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

-- 3. Ensure student_custom_schedules table exists for customized batch schedules
CREATE TABLE IF NOT EXISTS public.student_custom_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  day_of_week text NOT NULL,
  class_name text NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS and public permissions if needed
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_custom_schedules ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public all access on students') THEN
    CREATE POLICY "Allow public all access on students" ON public.students FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public all access on fees') THEN
    CREATE POLICY "Allow public all access on fees" ON public.fees FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public all access on student_custom_schedules') THEN
    CREATE POLICY "Allow public all access on student_custom_schedules" ON public.student_custom_schedules FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
