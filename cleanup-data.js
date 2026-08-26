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
    'fees',
    'students',
    'enquiries',
    'bookings',
    'teacher_payments',
    'teacher_attendance'
  ];

  for (const table of tables) {
    console.log(`Clearing table: ${table}...`);
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    if (error) {
      console.error(`Error clearing ${table}:`, error.message);
    } else {
      console.log(`Successfully cleared ${table}.`);
    }
  }

  console.log('Cleanup finished!');
  process.exit(0);
}

clean();
