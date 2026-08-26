const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: batches } = await supabase.from('batches').select('*');
  console.log('batches:', batches);
  const { data: sch } = await supabase.from('batch_schedules').select('*');
  console.log('batch_schedules length:', sch ? sch.length : 0);
  console.log('batch_schedules sample:', sch ? sch.slice(0, 10) : []);
  process.exit(0);
}

check();
