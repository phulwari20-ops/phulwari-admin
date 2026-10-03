-- ============================================================================
-- Realtime Lead Notifications & Sound Alert Setup
-- Ensures enquiries and bookings broadcast INSERT events via supabase_realtime
-- ============================================================================

-- 1. Ensure tables have full replica identity so payload.new contains all fields
ALTER TABLE public.enquiries REPLICA IDENTITY FULL;
ALTER TABLE public.bookings REPLICA IDENTITY FULL;

-- 2. Add both tables to the supabase_realtime publication
DO $$
BEGIN
  -- Add public.enquiries if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'enquiries'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries;
  END IF;

  -- Add public.bookings if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  END IF;
END $$;

-- 3. Verify public read access for enquiries so realtime subscription receives INSERT payloads
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'enquiries' AND policyname = 'Allow public select on enquiries'
  ) THEN
    CREATE POLICY "Allow public select on enquiries" 
    ON public.enquiries FOR SELECT 
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'enquiries' AND policyname = 'Allow public insert on enquiries'
  ) THEN
    CREATE POLICY "Allow public insert on enquiries" 
    ON public.enquiries FOR INSERT 
    WITH CHECK (true);
  END IF;
END $$;
