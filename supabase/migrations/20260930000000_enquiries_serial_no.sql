-- Add serial_no column to public.enquiries for lead serial number assignment & editing
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS serial_no text;
CREATE INDEX IF NOT EXISTS idx_enquiries_serial_no ON public.enquiries (serial_no);
