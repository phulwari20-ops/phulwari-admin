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

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertMasterAdmin() {
  const payload = {
    booking_type: 'Staff Account',
    parent_name: 'Master Administrator',
    email: 'phulwari20@gmail.com',
    phone: '6207368839',
    notes: JSON.stringify({
      password: 'Hello123',
      role: 'Admin',
      permissions: ['dashboard', 'students', 'attendance', 'fees', 'teachers', 'batches', 'enquiries', 'deactivated', 'bookings', 'announcements', 'birthdays', 'gallery']
    })
  };

  // First check if it already exists
  const { data: existing } = await supabase
    .from('bookings')
    .eq('booking_type', 'Staff Account')
    .eq('email', 'phulwari20@gmail.com');

  if (existing && existing.length > 0) {
    console.log("Master Admin record already exists in database. Updating it...");
    const { error: updateErr } = await supabase
      .from('bookings')
      .update(payload)
      .eq('id', existing[0].id);

    if (updateErr) {
      console.error("Error updating record:", updateErr.message);
    } else {
      console.log("🎉 Successfully updated Master Admin in Supabase!");
    }
  } else {
    const { error: insertErr } = await supabase
      .from('bookings')
      .insert([payload]);

    if (insertErr) {
      console.error("Error inserting record:", insertErr.message);
    } else {
      console.log("🎉 Successfully inserted Master Admin (phulwari20@gmail.com) into Supabase bookings table!");
    }
  }
}

insertMasterAdmin();
