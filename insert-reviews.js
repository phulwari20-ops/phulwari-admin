const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ftnbzukwjvgxdnkrvuer.supabase.co";
const supabaseKey = "sb_publishable_GFV9g9M3vPdFlOtFZ_dnEA_bR2Cm0HV";

const supabase = createClient(supabaseUrl, supabaseKey);

const defaultReviews = [
  { id: '1', author_name: 'Sushmita Kumari', initials: 'SK', date_str: 'October 2024', tag: 'Phulwari Premium Circle', content: 'My son joined the Premium Circle and it has been life-changing. He is more confident, active and social. The gymnastics and yoga sessions are excellent. The environment is very safe and nurturing.', rating: 5 },
  { id: '2', author_name: 'Priyaraj', initials: 'P', date_str: 'November 2024', tag: 'Phulwari Premium Circle', content: 'Phulwari is an amazing place for kids! My daughter has improved so much in dance and art since joining. The trainers are very experienced and caring. Highly recommend to all parents.', rating: 5 },
  { id: '3', author_name: 'Braj Raj', initials: 'BR', date_str: 'October 2024', tag: 'Phulwari Core', content: 'The Mother & Toddler Program is absolutely wonderful. My toddler loves the playzone and I enjoy the fitness sessions. It\'s a great bonding experience. The staff is very supportive and friendly.', rating: 5 }
];

async function setupReviews() {
  console.log("Checking reviews table...");
  const { data, error } = await supabase.from('reviews').select('*').limit(1);
  if (error) {
    console.error("Error accessing reviews:", error.message);
    if (error.message.includes("relation") && error.message.includes("does not exist")) {
      console.log("Please run a SQL script to create the 'reviews' table first.");
    }
    return;
  }
  
  console.log("Inserting default reviews...");
  const { error: insertError } = await supabase.from('reviews').upsert(defaultReviews);
  if (insertError) {
    console.error("Insert error:", insertError);
  } else {
    console.log("Successfully inserted default reviews!");
  }
}

setupReviews();
