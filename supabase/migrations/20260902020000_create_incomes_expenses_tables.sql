-- SQL Migration to create incomes, expenses, categories, and financial_ledger tables for Phulwari System

-- 1. Create Incomes Table
CREATE TABLE IF NOT EXISTS public.incomes (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category_name TEXT NOT NULL,
  subcategory_name TEXT,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  payment_mode TEXT DEFAULT 'Cash',
  reference_no TEXT,
  student_name TEXT,
  description TEXT,
  added_by TEXT DEFAULT 'Admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category_name TEXT NOT NULL,
  subcategory_name TEXT,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  payment_mode TEXT DEFAULT 'Bank Transfer',
  reference_no TEXT,
  vendor_name TEXT,
  vendor_contact TEXT,
  description TEXT,
  added_by TEXT DEFAULT 'Admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Categories Table (Dynamic Category Management)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  emoji TEXT DEFAULT '🧸',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-populate default Categories if missing
INSERT INTO public.categories (name, emoji) VALUES
('Child Activity', '🧸'),
('Zumba & Yoga', '🧘')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS and Grant Access Permissions
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on incomes" ON public.incomes;
CREATE POLICY "Allow public read access on incomes" ON public.incomes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert access on incomes" ON public.incomes;
CREATE POLICY "Allow public insert access on incomes" ON public.incomes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update access on incomes" ON public.incomes;
CREATE POLICY "Allow public update access on incomes" ON public.incomes FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete access on incomes" ON public.incomes;
CREATE POLICY "Allow public delete access on incomes" ON public.incomes FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access on expenses" ON public.expenses;
CREATE POLICY "Allow public read access on expenses" ON public.expenses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert access on expenses" ON public.expenses;
CREATE POLICY "Allow public insert access on expenses" ON public.expenses FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update access on expenses" ON public.expenses;
CREATE POLICY "Allow public update access on expenses" ON public.expenses FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete access on expenses" ON public.expenses;
CREATE POLICY "Allow public delete access on expenses" ON public.expenses FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access on categories" ON public.categories;
CREATE POLICY "Allow public read access on categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert access on categories" ON public.categories;
CREATE POLICY "Allow public insert access on categories" ON public.categories FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update access on categories" ON public.categories;
CREATE POLICY "Allow public update access on categories" ON public.categories FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete access on categories" ON public.categories;
CREATE POLICY "Allow public delete access on categories" ON public.categories FOR DELETE USING (true);
