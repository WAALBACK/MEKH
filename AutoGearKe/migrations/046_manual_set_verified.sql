-- Temporary migration to manually set is_verified for testing
-- This assumes migration 045 has been run

-- First, ensure the column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'technicians' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE technicians ADD COLUMN is_verified BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Manually compute and set is_verified for all technicians
UPDATE technicians t
SET is_verified = (
  -- Check all criteria
  t.status = 'live' AND
  t.completed_jobs >= 5 AND
  t.avg_rating >= 4.0 AND
  t.review_count >= 3 AND
  -- Check if has business hours
  EXISTS(SELECT 1 FROM business_hours WHERE technician_id = t.id AND is_open = true) AND
  -- Check profile completeness (simplified version)
  (
    CASE WHEN t.google_maps_link IS NOT NULL AND t.google_maps_link != '' THEN 15 ELSE 0 END +
    CASE WHEN t.service_guarantee IS NOT NULL AND t.service_guarantee != '' THEN 15 ELSE 0 END +
    CASE WHEN t.bio IS NOT NULL AND LENGTH(t.bio) >= 50 THEN 10 ELSE 0 END +
    CASE WHEN t.experience_years IS NOT NULL AND t.experience_years != '' THEN 10 ELSE 0 END +
    CASE WHEN t.profile_image IS NOT NULL AND t.profile_image != '' THEN 20 ELSE 0 END +
    CASE WHEN t.instagram IS NOT NULL AND t.instagram != '' THEN 10 ELSE 0 END +
    CASE WHEN t.tiktok_link IS NOT NULL AND t.tiktok_link != '' THEN 10 ELSE 0 END +
    CASE WHEN t.youtube_link IS NOT NULL AND t.youtube_link != '' THEN 10 ELSE 0 END
  ) >= 60
);

-- Show results
SELECT 
  business_name,
  is_verified,
  status,
  completed_jobs,
  avg_rating,
  review_count,
  (SELECT COUNT(*) FROM business_hours WHERE technician_id = technicians.id AND is_open = true) as business_hours_count
FROM technicians
WHERE status = 'live'
ORDER BY is_verified DESC, business_name;
