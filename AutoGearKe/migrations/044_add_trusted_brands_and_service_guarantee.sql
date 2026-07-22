-- Migration: Add trusted_brands_used and service_guarantee to technicians table
-- Created: 2026-05-15

-- Add trusted_brands_used column (comma-separated brand names)
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS trusted_brands_used TEXT DEFAULT '';

-- Add service_guarantee column (text with line-separated guarantee points)
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS service_guarantee TEXT DEFAULT '';

-- Add comments for documentation
COMMENT ON COLUMN technicians.trusted_brands_used IS 'Comma-separated list of trusted brands/materials used by the technician (e.g., "3M, Pioneer, JBL, LLumar")';
COMMENT ON COLUMN technicians.service_guarantee IS 'Line-separated list of service guarantees provided by the technician (e.g., "7-day correction guarantee\nWarranty available\nFree re-installation if issue occurs")';