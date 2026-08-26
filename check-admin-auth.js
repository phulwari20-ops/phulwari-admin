const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envPath = './.env.local';
let supabaseUrl = '';
let supabaseKey = '';

try {
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  lines.forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val;
      if (key === 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY' || key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseKey = val;
    }
  });
} catch (e) {
  console.error("Could not read .env.local:", e.message);
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables from .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmins() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('booking_type', 'Staff Account');

  if (error) {
    console.error("Error fetching admin credentials:", error.message);
    return;
  }

  console.log("=== Active Staff/Admin Accounts in Database ===");
  if (!data || data.length === 0) {
    console.log("No custom admin credentials found in database. Using defaults.");
  } else {
    data.forEach(r => {
      console.log(`Email: ${r.email}`);
      console.log(`Notes: ${r.notes}`);
      console.log("-----------------------------------------");
    });
  }
}

checkAdmins();
