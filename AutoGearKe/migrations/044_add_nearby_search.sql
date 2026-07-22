-- ============================================================================
-- Migration 044: Add Nearby Search
-- Adds a function to support location-based searches for the Home Page
-- ============================================================================

CREATE OR REPLACE FUNCTION find_nearby_technicians(
    p_lat NUMERIC,
    p_lng NUMERIC,
    p_max_distance_km NUMERIC DEFAULT 5,
    p_max_results INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    business_name TEXT,
    slug TEXT,
    phone TEXT,
    area TEXT,
    county TEXT,
    mobile_service TEXT,
    "status" TEXT,
    profile_image TEXT,
    cover_photo TEXT,
    thumbnail_image TEXT,
    created_at TIMESTAMPTZ,
    latitude NUMERIC,
    longitude NUMERIC,
    avg_rating NUMERIC,
    review_count INTEGER,
    completed_jobs INTEGER,
    is_verified BOOLEAN,
    distance_km NUMERIC,
    technician_services JSON
) AS $$
BEGIN
    -- Enforce absolute maximum of 10km
    IF p_max_distance_km > 10 THEN
        p_max_distance_km := 10;
    END IF;

    RETURN QUERY
    SELECT 
        t.id, 
        t.business_name, 
        t.slug, 
        t.phone, 
        t.area, 
        t.county, 
        t.mobile_service,
        t.status, 
        t.profile_image, 
        t.cover_photo, 
        t.thumbnail_image, 
        t.created_at,
        t.latitude, 
        t.longitude,
        t.avg_rating, 
        t.review_count, 
        t.completed_jobs, 
        t.is_verified,
        -- Calculate distance using Haversine formula
        (
            6371 * acos(
                cos(radians(p_lat)) * 
                cos(radians(t.latitude)) * 
                cos(radians(t.longitude) - radians(p_lng)) + 
                sin(radians(p_lat)) * 
                sin(radians(t.latitude))
            )
        )::NUMERIC AS distance_km,
        (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'id', ts.id,
                    'service_name', ts.service_name,
                    'category', ts.category,
                    'price', ts.price,
                    'negotiable', ts.negotiable,
                    'is_primary', ts.is_primary,
                    'service_variants', (
                        SELECT COALESCE(json_agg(
                            json_build_object(
                                'id', sv.id,
                                'variant_name', sv.variant_name,
                                'price', sv.price,
                                'is_negotiable', sv.is_negotiable
                            )
                        ), '[]'::json)
                        FROM service_variants sv
                        WHERE sv.service_id = ts.id
                    )
                )
            ), '[]'::json)
            FROM technician_services ts
            WHERE ts.technician_id = t.id
        ) AS technician_services
    FROM technicians t
    WHERE 
        t.status = 'live'
        AND t.latitude IS NOT NULL 
        AND t.longitude IS NOT NULL
        AND (
            6371 * acos(
                cos(radians(p_lat)) * 
                cos(radians(t.latitude)) * 
                cos(radians(t.longitude) - radians(p_lng)) + 
                sin(radians(p_lat)) * 
                sin(radians(t.latitude))
            )
        ) < p_max_distance_km
    ORDER BY distance_km ASC
    LIMIT p_max_results;
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION find_nearby_technicians TO authenticated, anon;

COMMENT ON FUNCTION find_nearby_technicians IS 
'Finds nearby technicians based on location and returns them with their services as JSON. Used for the Home Page.';
