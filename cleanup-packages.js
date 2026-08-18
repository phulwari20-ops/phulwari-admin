const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const url = urlMatch[1].trim().replace(/['"]/g, '');
const key = keyMatch[1].trim().replace(/['"]/g, '');

const supabase = createClient(url, key);

async function cleanup() {
  const { data: allPackages, error } = await supabase.from('party_packages').select('*');
  if (error) {
    console.error('Error fetching packages:', error);
    return;
  }
  
  console.log('Total packages found:', allPackages.length);
  
  // Group by name
  const seen = {};
  const toDelete = [];
  const toKeep = [];
  
  for (const pkg of allPackages) {
    const pkgName = pkg.name || pkg.package_name;
    if (!seen[pkgName]) {
      seen[pkgName] = pkg;
      toKeep.push(pkg);
    } else {
      toDelete.push(pkg.id);
    }
  }
  
  console.log('Keeping packages:', toKeep.map(p => p.name || p.package_name));
  console.log('Deleting duplicate IDs:', toDelete);
  
  if (toDelete.length > 0) {
    for (const id of toDelete) {
       const { error: delErr } = await supabase.from('party_packages').delete().eq('id', id);
       if (delErr) {
         console.error('Error deleting', id, delErr);
       }
    }
    console.log('Successfully deleted', toDelete.length, 'duplicates.');
  } else {
    console.log('No duplicates found.');
  }
}
cleanup();
