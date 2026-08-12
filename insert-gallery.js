const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ftnbzukwjvgxdnkrvuer.supabase.co";
const supabaseKey = "sb_publishable_GFV9g9M3vPdFlOtFZ_dnEA_bR2Cm0HV";

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertGalleryImages() {
  const images = [
    { image_url: '/galary1.webp',  title: 'Phulwari Activity Centre',       category: 'Activities' },
    { image_url: '/galary2.webp',  title: 'Activity Room',                  category: 'Activities' },
    { image_url: '/galary3.webp',  title: 'Toddler Play Area',              category: 'Play' },
    { image_url: '/galary4.webp',  title: 'Art & Craft Workshop',           category: 'Art' },
    { image_url: '/galary5.webp',  title: 'Gymnastics Class',               category: 'Fitness' },
    { image_url: '/galary6.webp',  title: 'Kids Dance & Music',             category: 'Dance' },
    { image_url: '/galary7.webp',  title: 'Roller Skating Track',           category: 'Sports' },
    { image_url: '/galary8.webp',  title: 'MMA & Martial Arts',             category: 'Sports' },
    { image_url: '/galary9.webp',  title: 'Birthday Celebration Hall',      category: 'Parties' },
    { image_url: '/galary10.webp', title: 'Summer Camp Fun',                category: 'Camps' },
    { image_url: '/galary11.webp', title: 'Mother Fitness Studio',          category: 'Fitness' },
    { image_url: '/galary12.webp', title: 'Outdoor Play Garden',            category: 'Play' },
    { image_url: '/galary13.webp', title: 'Storytelling Session',           category: 'Learning' },
    { image_url: '/galary14.webp', title: 'Phulwari Circle Time',           category: 'Activities' },
    { image_url: '/galary15.webp', title: 'Clay Modeling',                  category: 'Art' },
    { image_url: '/galary16.webp', title: 'Music & Movement',               category: 'Dance' },
    { image_url: '/galary17.webp', title: 'Indoor Cricket Net',             category: 'Sports' },
    { image_url: '/galary18.webp', title: 'Winter Camp Creative Arts',      category: 'Camps' },
    { image_url: '/galary19.webp', title: 'Yoga & Mindfulness',             category: 'Fitness' },
    { image_url: '/galary20.webp', title: 'Party Decoration Setup',         category: 'Parties' },
    { image_url: '/galary21.webp', title: 'Preschool Learning Corner',      category: 'Learning' },
    { image_url: '/galary22.webp', title: 'Obstacle Course Fun',            category: 'Fitness' },
    { image_url: '/galary23.webp', title: 'Sensory Play Table',             category: 'Play' },
    { image_url: '/galary24.webp', title: 'Mini Stage Performances',        category: 'Dance' },
    { image_url: '/galary25.webp', title: 'Phulwari Annual Celebration',    category: 'Events' },
    { image_url: '/galary26.webp', title: 'Mother & Child Bonding',         category: 'Activities' },
  ];

  console.log("Clearing existing gallery images...");
  await supabase.from('gallery').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log("Inserting 26 gallery images...");
  const { data, error } = await supabase.from('gallery').insert(images);
  
  if (error) {
    console.error("Failed to insert gallery images:", error);
  } else {
    console.log("Successfully inserted 26 images into gallery_images!");
  }
}

insertGalleryImages();
