-- =====================================================
-- Add 24/7 Business Hours Option
-- Allows technicians to indicate they are open 24/7
-- =====================================================

-- Add is_24_7 column to technicians table
ALTER TABLE technicians
ADD COLUMN IF NOT EXISTS is_24_7 BOOLEAN DEFAULT false;

-- Add comment explaining the column
COMMENT ON COLUMN technicians.is_24_7 IS 'When true, technician is open 24 hours a day, 7 days a week. Overrides individual business_hours entries for display purposes.';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_technicians_is_24_7 ON technicians(is_24_7) WHERE is_24_7 = true;

DO $$ 
BEGIN
    RAISE NOTICE 'Migration 047 completed - Added is_24_7 column to technicians table!';
END $$;