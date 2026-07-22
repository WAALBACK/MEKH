-- Create table to store latest app versions for native updates
CREATE TABLE IF NOT EXISTS app_versions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  platform text NOT NULL DEFAULT 'android',
  latest_version text NOT NULL,
  min_supported_version text,
  force_update boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- Insert initial version (update this row when releasing new versions)
INSERT INTO app_versions (platform, latest_version, min_supported_version, force_update)
VALUES ('android', '1.0.0', '1.0.0', false)
ON CONFLICT DO NOTHING;

-- Enable RLS (optional - allow public read)
ALTER TABLE app_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to app_versions"
ON app_versions FOR SELECT
TO public
USING (true);
