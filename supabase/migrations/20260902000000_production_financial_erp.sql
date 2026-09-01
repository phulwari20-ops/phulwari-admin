-- Production Financial ERP Migration Schema for Phulwari Admin (100% Idempotent)

-- 1. Income Categories Table
CREATE TABLE IF NOT EXISTS public.income_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'Default',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure unique index on name for conflict resolution
CREATE UNIQUE INDEX IF NOT EXISTS idx_income_categories_name ON public.income_categories (name);

-- Pre-populate default income categories
INSERT INTO public.income_categories (name, type) VALUES
('Admission Fee', 'Default'),
('Registration Fee', 'Default'),
('Monthly Fee', 'Default'),
('Tuition Fee', 'Default'),
('Course Fee', 'Default'),
('Batch Fee', 'Default'),
('Renewal Fee', 'Default'),
('Re-Admission Fee', 'Default'),
('Study Material Fee', 'Default'),
('Test Series Fee', 'Default'),
('Exam Fee', 'Default'),
('Certificate Fee', 'Default'),
('Library Fee', 'Default'),
('Transport Fee', 'Default'),
('Hostel Fee', 'Default'),
('Donation', 'Default'),
('Sponsorship', 'Default'),
('Advertisement Income', 'Default'),
('Rental Income', 'Default'),
('Miscellaneous Income', 'Default')
ON CONFLICT (name) DO NOTHING;

-- 2. Expense Categories Table
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'Default',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure unique index on name for conflict resolution
CREATE UNIQUE INDEX IF NOT EXISTS idx_expense_categories_name ON public.expense_categories (name);

-- Pre-populate default expense categories
INSERT INTO public.expense_categories (name, type) VALUES
('Teacher Salary', 'Default'),
('Faculty Payout', 'Default'),
('Guest Faculty Payment', 'Default'),
('Admin Salary', 'Default'),
('Accountant Salary', 'Default'),
('Office Staff Salary', 'Default'),
('Office Rent', 'Default'),
('Electricity', 'Default'),
('Internet', 'Default'),
('Water Bill', 'Default'),
('Maintenance', 'Default'),
('Facebook Ads', 'Default'),
('Google Ads', 'Default'),
('WhatsApp Marketing', 'Default'),
('Banner Printing', 'Default'),
('Offline Marketing', 'Default'),
('Study Materials', 'Default'),
('Books', 'Default'),
('Printing', 'Default'),
('Certificates', 'Default'),
('Examination Expenses', 'Default'),
('Software Subscription', 'Default'),
('Domain', 'Default'),
('Hosting', 'Default'),
('Server', 'Default'),
('SMS Charges', 'Default'),
('WhatsApp API Charges', 'Default'),
('Travel', 'Default'),
('Refreshments', 'Default'),
('Stationery', 'Default'),
('Misc Expenses', 'Default')
ON CONFLICT (name) DO NOTHING;

-- 3. Financial Ledger Table (Incomes & Expenses)
CREATE TABLE IF NOT EXISTS public.financial_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('Income', 'Expense')),
  category_name TEXT NOT NULL,
  subcategory_name TEXT,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  payment_mode TEXT DEFAULT 'Cash',
  reference_no TEXT,
  receipt_no TEXT,
  status TEXT DEFAULT 'Completed', -- 'Completed', 'Pending', 'Void', 'Reversed'
  linked_student_id UUID,
  student_name TEXT,
  admission_no TEXT,
  batch_name TEXT,
  fee_head TEXT,
  linked_teacher_id TEXT,
  teacher_name TEXT,
  vendor_name TEXT,
  vendor_contact TEXT,
  description TEXT,
  added_by TEXT,
  approved_by TEXT,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Cash & Bank Register Table
CREATE TABLE IF NOT EXISTS public.cash_bank_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  account_type TEXT NOT NULL CHECK (account_type IN ('Cash', 'Bank')),
  bank_name TEXT, -- e.g. SBI, HDFC, ICICI
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('Deposit', 'Withdrawal', 'Transfer')),
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  opening_balance DECIMAL(12, 2) DEFAULT 0.00,
  closing_balance DECIMAL(12, 2) DEFAULT 0.00,
  reference_no TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Audit Trail Logs Table
CREATE TABLE IF NOT EXISTS public.financial_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL, -- 'INSERT', 'EDIT', 'VOID', 'REVERSE'
  record_id UUID,
  performed_by TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
