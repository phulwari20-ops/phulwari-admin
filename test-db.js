const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('Testing insert with all possible columns...');
  
  const payload = {
    booking_type: 'User Panel / Birthday Party Celebration',
    parent_name: 'Test Parent Name',
    phone: '9876543210',
    email: 'testparent@gmail.com',
    child_name: 'Test Child Name',
    child_age: 4,
    event_date: '2026-08-25',
    status: 'New',
    guests: '30-50 Guests',
    package_selection: 'Premium Birthday Package',
    requirements: 'Custom Jungle Safari theme, cupcakes needed.',
    source: 'User Panel / Birthday Party Celebration',
    payment_status: 'Pending',
    notes: 'Testing notes'
  };

  const { data, error } = await supabase.from('bookings').insert([payload]).select();
  
  if (error) {
    console.error('❌ Insert failed! Error details:', error);
    console.log('Trying fallback insert with only standard schema.sql columns...');
    
    // Standard fallback payload (storing extras in notes)
    const fallbackPayload = {
      booking_type: 'User Panel / Birthday Party Celebration',
      parent_name: 'Test Parent Name',
      phone: '9876543210',
      email: 'testparent@gmail.com',
      child_name: 'Test Child Name',
      child_age: 4,
      event_date: '2026-08-25',
      status: 'New',
      notes: JSON.stringify({
        guests: '30-50 Guests',
        package_selection: 'Premium Birthday Package',
        requirements: 'Custom Jungle Safari theme, cupcakes needed.',
        source: 'User Panel / Birthday Party Celebration',
        payment_status: 'Pending',
        additional_notes: 'Testing notes'
      })
    };
    
    const { data: fbData, error: fbErr } = await supabase.from('bookings').insert([fallbackPayload]).select();
    if (fbErr) {
      console.error('❌ Fallback insert failed too!', fbErr);
    } else {
      console.log('✅ Fallback insert succeeded! Succeeded record keys:', Object.keys(fbData[0]));
    }
  } else {
    console.log('✅ Success! Insert with all columns succeeded! Record keys:', Object.keys(data[0]));
    // Clean up
    await supabase.from('bookings').delete().eq('id', data[0].id);
    console.log('Deleted test record.');
  }
}

testInsert();
