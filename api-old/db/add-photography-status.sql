-- Add status column to photography_projects table
-- This allows tracking project status (upcoming, completed, cancelled)

ALTER TABLE photography_projects 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'upcoming' 
CHECK (status IN ('upcoming', 'completed', 'cancelled'));

-- Create index for filtering by status
CREATE INDEX IF NOT EXISTS idx_photography_projects_status ON photography_projects(status);

-- Update existing projects to have 'upcoming' status
UPDATE photography_projects 
SET status = 'upcoming' 
WHERE status IS NULL;
