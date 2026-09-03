const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function clean() {
  console.log('Starting data cleanup...');
  
  // Define tables to clear in child-first order to prevent foreign key constraint violations
  const tables = [
    'attendance',
    'student_custom_schedules',
    'student_documents',
    'fees',
    'students',
    'enquiries',
    'bookings',
    'teacher_payments',
    'teacher_attendance',
    'teachers',
    'batch_schedules',
    'batches',
    'class_fees',
    'classes',
    'financial_ledger',
    'cash_bank_register',
    'cash_bank_book',
    'financial_audit_logs',
    'incomes',
    'expenses',
    'income_categories',
    'expense_categories',
    'announcements',
    'banners',
    'birthday_landing_config',
    'blogs',
    'cms_content',
    'gallery',
    'holidays',
    'party_packages',
    'reviews',
    'categories',
    'fee_heads'
  ];

  for (const table of tables) {
    console.log(`Clearing table: ${table}...`);
    let { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      const res = await supabase.from(table).delete().gt('id', -1);
      error = res.error;
    }
    if (error) {
      const res2 = await supabase.from(table).delete().not('id', 'is', null);
      error = res2.error;
    }
    if (error) {
      const res3 = await supabase.from(table).delete().gt('created_at', '1970-01-01');
      error = res3.error;
    }
    if (error) {
      const res4 = await supabase.from(table).delete().neq('class_name', '___');
      error = res4.error;
    }
    if (error) {
      console.error(`Error clearing ${table}:`, error.message);
    } else {
      console.log(`Successfully cleared ${table}.`);
    }
  }

  console.log('Full data cleanup finished!');
  process.exit(0);
}

clean();
