-- Add is_primary column to technician_services table
ALTER TABLE technician_services
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;

-- Add comment to explain the column
COMMENT ON COLUMN technician_services.is_primary IS 'Indicates if this is the primary service offered by the technician, displayed prominently in their profile';

-- Ensure only one service per technician can be marked as primary
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_primary_per_technician 
ON technician_services (technician_id) 
WHERE is_primary = TRUE;
