-- Add latitude/longitude to properties for map view
-- Run this in Supabase SQL Editor

ALTER TABLE properties ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_properties_coords ON properties(latitude, longitude) WHERE latitude IS NOT NULL;
