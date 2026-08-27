-- ===========================================================================
-- Fee Ledger Enhancements
-- Adds granular tracking columns to the fees table to support
-- partial payments, fee head tracking, and due calculation.
-- Run this script inside your Supabase SQL Editor.
-- ===========================================================================

-- 1. Add granular fee tracking columns to public.fees table
alter table public.fees add column if not exists amount_paid numeric(10,2) default 0;
alter table public.fees add column if not exists pending_amount numeric(10,2) default 0;
alter table public.fees add column if not exists month text; -- To explicitly store the month for 'Monthly Fee'

-- Ensure consistency for existing records (if they were added manually before this migration)
update public.fees 
set amount_paid = amount, pending_amount = 0 
where status = 'paid' and (amount_paid is null or amount_paid = 0);

update public.fees 
set pending_amount = amount, amount_paid = 0 
where status = 'pending' and pending_amount = 0;
