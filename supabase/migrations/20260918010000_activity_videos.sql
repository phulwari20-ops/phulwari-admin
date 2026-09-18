-- ============================================================================
-- PHULWARI: VIDEO MANAGEMENT SYSTEM & R2 / LOCAL VIDEO ASSETS MIGRATION
-- Adds `videos` jsonb column to activity_pages and seeds initial video records
-- ============================================================================

-- 1. Ensure `videos` jsonb column exists on activity_pages table
ALTER TABLE public.activity_pages ADD COLUMN IF NOT EXISTS videos jsonb DEFAULT '[]'::jsonb;

-- 2. Seed / Update video records for existing activity pages
-- A. Birthday Party Celebrations
UPDATE public.activity_pages
SET videos = jsonb_build_array(
  jsonb_build_object(
    'id', 'vid-birthday-1',
    'title', 'Real Birthday Party Celebrations at Phulwari',
    'description', 'Watch toddlers and kids enjoying vibrant themed birthday celebrations, interactive games, and soft-play fun in Patna.',
    'url', '/videos/birthday_party.mov',
    'poster', '/birthday_party/image.png',
    'duration', '0:35',
    'is_featured', true,
    'created_at', now()
  )
)
WHERE slug = 'kids-and-child-birthday-party' OR slug = 'birthday-party' OR slug = 'birthday';

-- B. Cricket Coaching
UPDATE public.activity_pages
SET videos = jsonb_build_array(
  jsonb_build_object(
    'id', 'vid-cricket-1',
    'title', 'Junior Cricket Coaching & Net Practice',
    'description', 'Batting, bowling, and fielding drills guided by certified cricket coaches in Patna.',
    'url', '/videos/cricket.mov',
    'poster', '/cricket.webp',
    'duration', '0:28',
    'is_featured', true,
    'created_at', now()
  )
)
WHERE slug = 'cricket-coaching-patna' OR slug = 'cricket';

-- C. Gymnastics Academy
UPDATE public.activity_pages
SET videos = jsonb_build_array(
  jsonb_build_object(
    'id', 'vid-gymnastics-1',
    'title', 'Kids Gymnastics Training & Flexibility Drills',
    'description', 'Somersaults, balance beam, and agility training in our padded safety facility.',
    'url', '/videos/gymnastics.mov',
    'poster', '/Gymnastics/DSC_9788.webp',
    'duration', '0:30',
    'is_featured', true,
    'created_at', now()
  )
)
WHERE slug = 'gymnastics-classes-for-kids-patna' OR slug = 'gymnastics';

-- D. Roller Skating
UPDATE public.activity_pages
SET videos = jsonb_build_array(
  jsonb_build_object(
    'id', 'vid-skating-1',
    'title', 'Roller Skating Practice & Balance Training',
    'description', 'Kids mastering speed, smooth turns, and balance on our professional smooth skating rink.',
    'url', '/videos/skating.mov',
    'poster', '/rollerscating.webp',
    'duration', '0:42',
    'is_featured', true,
    'created_at', now()
  )
)
WHERE slug = 'roller-skating' OR slug = 'roller-skating-classes-patna' OR slug = 'skating';
