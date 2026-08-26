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

async function printStudentCols() {
  const { data, error } = await supabase.from('students').select('*').limit(1);
  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("Sample Student Record:", data[0]);
  }
}

printStudentCols();
