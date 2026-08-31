-- ===========================================================================
-- Add missing columns to public.fees table
-- Run this in your Supabase SQL Editor to resolve Fee Insert Errors.
-- ===========================================================================

ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS discount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS discount_type TEXT DEFAULT 'flat';
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS net_amount NUMERIC(10,2) DEFAULT 0;
