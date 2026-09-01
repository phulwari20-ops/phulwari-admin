-- Migration: Create public.banners table for Banners/Posters CMS
-- Timestamp: 2026-09-01

CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    cta_text TEXT DEFAULT 'Explore Now',
    cta_url TEXT,
    target_link_open TEXT DEFAULT 'Same Tab',
    banner_type TEXT DEFAULT 'Promotional Banner',
    aspect_ratio TEXT DEFAULT '16:9',
    image_url TEXT NOT NULL,
    mobile_image_url TEXT,
    thumbnail_url TEXT,
    display_position TEXT DEFAULT 'Hero Section',
    priority INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    device_target TEXT DEFAULT 'All Devices',
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active banners
DROP POLICY IF EXISTS "Public can view active banners" ON public.banners;
CREATE POLICY "Public can view active banners" ON public.banners
    FOR SELECT
    USING (true);

-- Allow authenticated users / admins full access
DROP POLICY IF EXISTS "Full access to banners for authenticated users" ON public.banners;
CREATE POLICY "Full access to banners for authenticated users" ON public.banners
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create index on status and display_position for fast queries
CREATE INDEX IF NOT EXISTS idx_banners_status_position ON public.banners (status, display_position);
