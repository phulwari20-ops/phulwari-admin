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

async function checkPolicies() {
  console.log("Checking if ID 4 exists before delete...");
  const { data: before } = await supabase.from('party_packages').select('*').eq('id', 4);
  console.log("Before delete:", before);

  console.log("Attempting to delete ID 4...");
  const { error } = await supabase.from('party_packages').delete().eq('id', 4);
  if (error) {
    console.error("Delete failed:", error.message);
  } else {
    console.log("Delete call succeeded.");
  }

  console.log("Checking if ID 4 exists after delete...");
  const { data: after } = await supabase.from('party_packages').select('*').eq('id', 4);
  console.log("After delete:", after);
}

checkPolicies();
