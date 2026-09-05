import { createClient } from '@supabase/supabase-js';

const url = 'https://ftnbzukwjvgxdnkrvuer.supabase.co';
const key = 'sb_publishable_GFV9g9M3vPdFlOtFZ_dnEA_bR2Cm0HV';

const supabase = createClient(url, key);

async function run() {
  console.log('Checking master admin in DB...');
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('booking_type', 'Staff Account')
    .eq('email', 'phulwari20@gmail.com');

  if (error) {
    console.error('Error fetching:', error);
    return;
  }

  console.log('Current master admin record in DB:', data);

  if (!data || data.length === 0) {
    console.log('Master admin record not found. Inserting...');
    const payload = {
      booking_type: 'Staff Account',
      parent_name: 'Master Administrator',
      email: 'phulwari20@gmail.com',
      phone: '6207368839',
      notes: JSON.stringify({
        password: 'Phulwari@1295',
        role: 'Admin',
        permissions: ['dashboard', 'students', 'attendance', 'fees', 'schedule', 'teachers', 'expenses', 'enquiries', 'bookings', 'gallery', 'announcements', 'website', 'staff']
      })
    };
    const { data: inserted, error: insertError } = await supabase
      .from('bookings')
      .insert([payload])
      .select();

    if (insertError) {
      console.error('Error inserting:', insertError);
    } else {
      console.log('Successfully inserted master admin record:', inserted);
    }
  } else {
    console.log('Master admin already exists in database.');
    let notes = {};
    try { notes = JSON.parse(data[0].notes || '{}'); } catch(e) {}
    console.log('Master admin notes:', notes);
  }
}

run();
