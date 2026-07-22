-- Migration 041: Add function to find nearby technicians using PostGIS
-- Improves performance by moving distance calculations to the database

-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Function to get nearby technicians with distance
CREATE OR REPLACE FUNCTION get_nearby_technicians(
  user_lat DOUBLE PRECISION,
  user_lon DOUBLE PRECISION,
  exclude_id UUID DEFAULT NULL,
  radius_km DOUBLE PRECISION DEFAULT 10
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
  experience_years INTEGER,
  county TEXT,
  area TEXT,
  mobile_service TEXT,
  instagram TEXT,
  tiktok_link TEXT,
  youtube_link TEXT,
  pricing_notes TEXT,
  status TEXT,
  user_id UUID,
  profile_image TEXT,
  cover_photo TEXT,
  thumbnail_image TEXT,
  created_at TIMESTAMPTZ,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  google_maps_link TEXT,
  technician_services JSON,
  technician_photos JSON,
  technician_videos JSON,
  technician_payments JSON,
  avg_rating NUMERIC,
  review_count INTEGER,
  reviews JSON,
  distance DOUBLE PRECISION
) AS $$
BEGIN
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
    t.county,
    t.area,
    t.mobile_service,
    t.instagram,
    t.tiktok_link,
    t.youtube_link,
    t.pricing_notes,
    t.status,
    t.user_id,
    t.profile_image,
    t.cover_photo,
    t.thumbnail_image,
    t.created_at,
    t.latitude,
    t.longitude,
    t.google_maps_link,
    -- Aggregate related data as JSON
    json_agg(ts.*) FILTER (WHERE ts.id IS NOT NULL) as technician_services,
    json_agg(tp.*) FILTER (WHERE tp.id IS NOT NULL) as technician_photos,
    json_agg(tv.*) FILTER (WHERE tv.id IS NOT NULL) as technician_videos,
    json_agg(tpym.*) FILTER (WHERE tpym.id IS NOT NULL) as technician_payments,
    t.avg_rating,
    t.review_count,
    json_agg(r.*) FILTER (WHERE r.id IS NOT NULL) as reviews,
    -- Distance in kilometers
    ST_Distance(
      ST_Point(t.longitude, t.latitude)::geography,
      ST_Point(user_lon, user_lat)::geography
    ) / 1000 as distance
  FROM technicians t
  LEFT JOIN technician_services ts ON ts.technician_id = t.id
  LEFT JOIN technician_photos tp ON tp.technician_id = t.id
  LEFT JOIN technician_videos tv ON tv.technician_id = t.id
  LEFT JOIN technician_payments tpym ON tpym.technician_id = t.id
  LEFT JOIN reviews r ON r.technician_id = t.id AND r.status = 'approved' AND r.is_visible = true
  WHERE t.status = 'live'
    AND t.latitude IS NOT NULL
    AND t.longitude IS NOT NULL
    AND (exclude_id IS NULL OR t.id != exclude_id)
    AND ST_DWithin(
      ST_Point(t.longitude, t.latitude)::geography,
      ST_Point(user_lon, user_lat)::geography,
      radius_km * 1000
    )
  GROUP BY t.id
  ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;