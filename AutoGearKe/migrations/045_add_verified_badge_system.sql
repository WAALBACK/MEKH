-- Migration: Add Verified Badge System
-- This migration adds the completed_jobs column to track technician job completion
-- The verified badge is computed dynamically based on multiple criteria

-- Add completed_jobs column to technicians table
ALTER TABLE technicians
ADD COLUMN IF NOT EXISTS completed_jobs INTEGER DEFAULT 0;

-- Add comment explaining the column
COMMENT ON COLUMN technicians.completed_jobs IS 'Number of jobs completed by the technician on the platform. Counted from leads table where status=job_done. Used for verified badge eligibility (requires >= 5).';

-- Create index for performance when filtering by completed_jobs
CREATE INDEX IF NOT EXISTS idx_technicians_completed_jobs ON technicians(completed_jobs);

-- Create a function to increment completed_jobs when a lead is marked as job_done
CREATE OR REPLACE FUNCTION increment_technician_completed_jobs()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment if status changed to 'job_done'
  IF NEW.status = 'job_done' AND (OLD.status IS NULL OR OLD.status != 'job_done') THEN
    UPDATE technicians
    SET completed_jobs = completed_jobs + 1
    WHERE id = NEW.technician_id;
  END IF;
  
  -- Decrement if status changed from 'job_done' to something else
  IF OLD.status = 'job_done' AND NEW.status != 'job_done' THEN
    UPDATE technicians
    SET completed_jobs = GREATEST(completed_jobs - 1, 0)
    WHERE id = NEW.technician_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-increment/decrement completed_jobs
DROP TRIGGER IF EXISTS trigger_increment_completed_jobs ON leads;
CREATE TRIGGER trigger_increment_completed_jobs
  AFTER UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION increment_technician_completed_jobs();

-- Backfill completed_jobs for existing technicians based on job_done leads
UPDATE technicians t
SET completed_jobs = (
  SELECT COUNT(*)
  FROM leads l
  WHERE l.technician_id = t.id
    AND l.status = 'job_done'
);

-- Add comment explaining the verification system
COMMENT ON TABLE technicians IS 'Technicians table. Verified badge is computed dynamically based on: status=live, completed_jobs>=5 (from leads where status=job_done), avg_rating>=4.0, rating_count>=3, and profile completeness score>=60 (includes google_maps_link and service_guarantee checks).';

-- Add is_verified computed column for performance optimization
ALTER TABLE technicians
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

COMMENT ON COLUMN technicians.is_verified IS 'Computed boolean indicating if technician meets all verified badge criteria. Updated automatically via trigger.';

-- Create index for performance when filtering verified technicians
CREATE INDEX IF NOT EXISTS idx_technicians_is_verified ON technicians(is_verified) WHERE is_verified = true;

-- Create a function to compute verification status
CREATE OR REPLACE FUNCTION compute_is_verified(tech_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  tech RECORD;
  has_business_hours BOOLEAN;
  profile_score INTEGER := 0;
BEGIN
  -- Get technician data
  SELECT 
    status, completed_jobs, avg_rating, review_count,
    google_maps_link, service_guarantee, bio, experience_years,
    profile_image, instagram, tiktok_link, youtube_link
  INTO tech
  FROM technicians
  WHERE id = tech_id;
  
  -- Check if technician has business hours
  SELECT EXISTS(
    SELECT 1 FROM business_hours 
    WHERE technician_id = tech_id AND is_open = true
  ) INTO has_business_hours;
  
  -- Calculate profile completeness score (max 100)
  IF tech.google_maps_link IS NOT NULL AND tech.google_maps_link != '' THEN
    profile_score := profile_score + 15;
  END IF;
  IF tech.service_guarantee IS NOT NULL AND tech.service_guarantee != '' THEN
    profile_score := profile_score + 15;
  END IF;
  IF tech.bio IS NOT NULL AND LENGTH(tech.bio) >= 50 THEN
    profile_score := profile_score + 10;
  END IF;
  IF tech.experience_years IS NOT NULL AND tech.experience_years != '' THEN
    profile_score := profile_score + 10;
  END IF;
  IF tech.profile_image IS NOT NULL AND tech.profile_image != '' THEN
    profile_score := profile_score + 20;
  END IF;
  IF tech.instagram IS NOT NULL AND tech.instagram != '' THEN
    profile_score := profile_score + 10;
  END IF;
  IF tech.tiktok_link IS NOT NULL AND tech.tiktok_link != '' THEN
    profile_score := profile_score + 10;
  END IF;
  IF tech.youtube_link IS NOT NULL AND tech.youtube_link != '' THEN
    profile_score := profile_score + 10;
  END IF;
  
  -- Return true if all criteria are met
  RETURN (
    tech.status = 'live' AND
    tech.completed_jobs >= 5 AND
    tech.avg_rating >= 4.0 AND
    tech.review_count >= 3 AND
    has_business_hours AND
    profile_score >= 60
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update is_verified for a technician
CREATE OR REPLACE FUNCTION update_technician_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Update is_verified based on computed criteria
  NEW.is_verified := compute_is_verified(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-update is_verified on technician changes
DROP TRIGGER IF EXISTS trigger_update_verification ON technicians;
CREATE TRIGGER trigger_update_verification
  BEFORE INSERT OR UPDATE ON technicians
  FOR EACH ROW
  EXECUTE FUNCTION update_technician_verification();

-- Create trigger to update verification when business_hours change
CREATE OR REPLACE FUNCTION update_verification_on_business_hours()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the technician's is_verified status
  UPDATE technicians
  SET is_verified = compute_is_verified(COALESCE(NEW.technician_id, OLD.technician_id))
  WHERE id = COALESCE(NEW.technician_id, OLD.technician_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_verification_on_business_hours ON business_hours;
CREATE TRIGGER trigger_update_verification_on_business_hours
  AFTER INSERT OR UPDATE OR DELETE ON business_hours
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_on_business_hours();

-- Backfill is_verified for all existing technicians
UPDATE technicians
SET is_verified = compute_is_verified(id);
