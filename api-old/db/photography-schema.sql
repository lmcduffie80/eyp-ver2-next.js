-- Photography Projects and Photos Schema
-- Run this to add photography management tables to your database

-- Photography Projects Table
CREATE TABLE IF NOT EXISTS photography_projects (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    cover_photo_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Photography Photos Table
CREATE TABLE IF NOT EXISTS photography_photos (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES photography_projects(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_photography_projects_display_order ON photography_projects(display_order);
CREATE INDEX IF NOT EXISTS idx_photography_photos_project_id ON photography_photos(project_id);
CREATE INDEX IF NOT EXISTS idx_photography_photos_display_order ON photography_photos(display_order);

-- Update trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_photography_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_photography_projects_timestamp
    BEFORE UPDATE ON photography_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_photography_projects_updated_at();

-- Sample data (optional - remove if not needed)
-- INSERT INTO photography_projects (project_name, description, display_order, is_featured)
-- VALUES 
--     ('Weddings 2025', 'Beautiful wedding photography from 2025', 1, true),
--     ('Engagement Sessions', 'Romantic engagement photo shoots', 2, false),
--     ('Family Portraits', 'Cherished family moments', 3, false);
