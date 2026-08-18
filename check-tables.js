const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const tables = ['staff', 'staff_members', 'staff_accounts', 'admin_users', 'users', 'teachers', 'enquiries', 'bookings'];
  for (const t of tables) {
    try {
      // [x] 1. Add Karate Training details to Roller Skating Page & change title to "Roller Skating & Karate".
      const { data, error } = await supabase.from(t).select('*').limit(1);
      if (error) {
        console.log(`Table '${t}' error:`, error.message);
      } else {
        console.log(`Table '${t}' exists! Data keys:`, data.length > 0 ? Object.keys(data[0]) : 'empty');
      }
    } catch (e) {
      console.log(`Table '${t}' exception:`, e.message);
    }
  }
  process.exit(0);
}

check();
