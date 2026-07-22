-- Add tow truck number plate field to technicians table
ALTER TABLE technicians
ADD COLUMN IF NOT EXISTS tow_truck_number_plate TEXT;

-- Add comment for clarity
COMMENT ON COLUMN technicians.tow_truck_number_plate IS 'Required for technicians offering towing services - vehicle number plate of tow truck';