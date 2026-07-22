-- ============================================================================
-- Migration 043: Add Emergency Booking Support
-- Adds columns and functions to support roadside emergency bookings
-- ============================================================================

-- Add new columns to leads table for emergency bookings
ALTER TABLE leads ADD COLUMN IF NOT EXISTS situation TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS transmission TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS fuel_type TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS mobility_status TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS eta_minutes INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_emergency BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS client_email TEXT;

-- Add tow truck number plate to technicians table if not exists
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS tow_truck_number_plate TEXT;

-- Add service category to technician_services if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='technician_services' AND column_name='category') THEN
        ALTER TABLE technician_services ADD COLUMN category TEXT;
    END IF;
END $$;

-- Create index on technician coordinates for faster geospatial queries
CREATE INDEX IF NOT EXISTS idx_technicians_coordinates ON technicians(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create index on service category for faster filtering
CREATE INDEX IF NOT EXISTS idx_technician_services_category ON technician_services(category) WHERE category IS NOT NULL;

-- Create function to find nearby emergency technicians
-- This function performs all filtering, sorting, and ETA calculation on the server side
CREATE OR REPLACE FUNCTION find_nearby_emergency_technicians(
    p_lat NUMERIC,
    p_lng NUMERIC,
    p_mobility_status TEXT,
    p_max_results INTEGER DEFAULT 4
)
RETURNS TABLE (
    id UUID,
    first_name TEXT,
    last_name TEXT,
    business_name TEXT,
    slug TEXT,
    phone TEXT,
    email TEXT,
    bio TEXT,
    experience_years TEXT,
    area TEXT,
    mobile_service TEXT,
    tiktok_link TEXT,
    pricing_notes TEXT,
    "status" TEXT,
    user_id UUID,
    profile_image TEXT,
    cover_photo TEXT,
    thumbnail_image TEXT,
    tow_truck_number_plate TEXT,
    created_at TIMESTAMPTZ,
    latitude NUMERIC,
    longitude NUMERIC,
    google_maps_link TEXT,
    avg_rating NUMERIC,
    review_count INTEGER,
    distance_km NUMERIC,
    eta_minutes INTEGER
) AS $$
DECLARE
    v_service_category TEXT;
    v_avg_speed_kmh NUMERIC := 40; -- Average urban speed in km/h
BEGIN
    -- Determine service category based on mobility status
    IF p_mobility_status = 'yes' THEN
        v_service_category := 'mechanical_repair';
    ELSE
        v_service_category := 'towing';
    END IF;

    RETURN QUERY
    SELECT 
        t.id,
        t.first_name,
        t.last_name,
        t.business_name,
        t.slug,
        t.phone,
        t.email,
        t.bio,
        t.experience_years,
        t.area,
        t.mobile_service,
        t.tiktok_link,
        t.pricing_notes,
        t.status,
        t.user_id,
        t.profile_image,
        t.cover_photo,
        t.thumbnail_image,
        t.tow_truck_number_plate,
        t.created_at,
        t.latitude,
        t.longitude,
        t.google_maps_link,
        t.avg_rating,
        t.review_count,
        -- Calculate distance using Haversine formula (approximate)
        (
            6371 * acos(
                cos(radians(p_lat)) * 
                cos(radians(t.latitude)) * 
                cos(radians(t.longitude) - radians(p_lng)) + 
                sin(radians(p_lat)) * 
                sin(radians(t.latitude))
            )
        )::NUMERIC AS distance_km,
        -- Calculate ETA in minutes
        (
            (6371 * acos(
                cos(radians(p_lat)) * 
                cos(radians(t.latitude)) * 
                cos(radians(t.longitude) - radians(p_lng)) + 
                sin(radians(p_lat)) * 
                sin(radians(t.latitude))
            ) / v_avg_speed_kmh) * 60
        )::INTEGER AS eta_minutes
    FROM technicians t
    WHERE 
        t.status = 'live'
        AND t.latitude IS NOT NULL 
        AND t.longitude IS NOT NULL
        -- Filter by service category
        AND EXISTS (
            SELECT 1 
            FROM technician_services ts 
            WHERE ts.technician_id = t.id 
            AND ts.category = v_service_category
        )
        -- Only include technicians within reasonable distance (100km)
        AND (
            6371 * acos(
                cos(radians(p_lat)) * 
                cos(radians(t.latitude)) * 
                cos(radians(t.longitude) - radians(p_lng)) + 
                sin(radians(p_lat)) * 
                sin(radians(t.latitude))
            )
        ) < 100
    ORDER BY distance_km ASC
    LIMIT p_max_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission on the function to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION find_nearby_emergency_technicians TO authenticated, anon;

-- Add comment to document the function
COMMENT ON FUNCTION find_nearby_emergency_technicians IS 
'Finds nearby emergency technicians based on client location and mobility status. 
Performs server-side filtering by service category (mechanical_repair or towing), 
calculates distance and ETA, and returns up to 4 nearest technicians.';
