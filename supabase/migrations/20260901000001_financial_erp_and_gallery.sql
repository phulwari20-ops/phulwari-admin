-- 1. Add sort_order to gallery
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- 2. Financial ERP Tables

-- Income Categories
CREATE TABLE IF NOT EXISTS income_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'Default', -- 'Default' or 'Custom'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-populate default income categories
INSERT INTO income_categories (name, type) VALUES
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
ON CONFLICT DO NOTHING;

-- Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'Default', -- 'Default' or 'Custom'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-populate default expense categories
INSERT INTO expense_categories (name, type) VALUES
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
ON CONFLICT DO NOTHING;

-- Financial Ledger (Records all Income and Expenses)
CREATE TABLE IF NOT EXISTS financial_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('Income', 'Expense')),
  category_id UUID,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  payment_mode TEXT,
  reference_no TEXT,
  status TEXT DEFAULT 'Completed', -- 'Completed', 'Pending', 'Void', 'Reversed'
  linked_student_id UUID, -- For fee collection auto-posting
  linked_teacher_id UUID, -- For teacher salary auto-posting
  vendor_name TEXT,       -- For vendor payments
  vendor_contact TEXT,    
  description TEXT,
  added_by TEXT,
  approved_by TEXT,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cash and Bank Book (To track balances over time or by account)
CREATE TABLE IF NOT EXISTS cash_bank_book (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  account_name TEXT NOT NULL, -- e.g., 'Cash Register', 'SBI', 'HDFC'
  type TEXT NOT NULL CHECK (type IN ('Credit', 'Debit')),
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  reference_id UUID, -- Links to financial_ledger.id
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
