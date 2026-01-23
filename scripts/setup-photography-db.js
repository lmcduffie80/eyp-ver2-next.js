#!/usr/bin/env node

/**
 * Photography Database Setup Script
 * This script creates the photography_projects and photography_photos tables
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple function to load .env.local
function loadEnvLocal() {
    const envPath = join(__dirname, '../.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...values] = trimmed.split('=');
            if (key && values.length > 0) {
                process.env[key.trim()] = values.join('=').trim();
            }
        }
    }
}

async function setupDatabase() {
    console.log('==================================');
    console.log('Photography Portfolio Setup');
    console.log('==================================\n');

    try {
        // Load environment variables from .env.local
        loadEnvLocal();
        
        if (!process.env.POSTGRES_URL) {
            throw new Error('POSTGRES_URL not found in .env.local');
        }
        
        console.log('✓ Environment variables loaded\n');
        
        // Import the SQL connection
        const { default: sql } = await import('../api/db/connection.js');
        
        console.log('✓ Database connection established\n');
        console.log('Creating photography tables...\n');

        // Create photography_projects table
        try {
            await sql`
                CREATE TABLE IF NOT EXISTS photography_projects (
                    id SERIAL PRIMARY KEY,
                    project_name VARCHAR(255) NOT NULL UNIQUE,
                    description TEXT,
                    cover_photo_url TEXT,
                    display_order INTEGER DEFAULT 0,
                    is_featured BOOLEAN DEFAULT false,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            console.log('✓ Created photography_projects table');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('✓ photography_projects table already exists');
            } else {
                throw error;
            }
        }

        // Create photography_photos table
        try {
            await sql`
                CREATE TABLE IF NOT EXISTS photography_photos (
                    id SERIAL PRIMARY KEY,
                    project_id INTEGER REFERENCES photography_projects(id) ON DELETE CASCADE,
                    photo_url TEXT NOT NULL,
                    thumbnail_url TEXT,
                    caption TEXT,
                    display_order INTEGER DEFAULT 0,
                    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            console.log('✓ Created photography_photos table');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('✓ photography_photos table already exists');
            } else {
                throw error;
            }
        }

        // Create indexes
        try {
            await sql`CREATE INDEX IF NOT EXISTS idx_photography_projects_display_order ON photography_projects(display_order)`;
            await sql`CREATE INDEX IF NOT EXISTS idx_photography_photos_project_id ON photography_photos(project_id)`;
            await sql`CREATE INDEX IF NOT EXISTS idx_photography_photos_display_order ON photography_photos(display_order)`;
            console.log('✓ Created indexes');
        } catch (error) {
            if (!error.message.includes('already exists')) {
                console.warn('Warning creating indexes:', error.message);
            }
        }

        // Create update trigger function
        try {
            await sql`
                CREATE OR REPLACE FUNCTION update_photography_projects_updated_at()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql
            `;
            console.log('✓ Created update trigger function');
        } catch (error) {
            console.warn('Warning creating function:', error.message);
        }

        // Create trigger
        try {
            await sql`DROP TRIGGER IF EXISTS update_photography_projects_timestamp ON photography_projects`;
            await sql`
                CREATE TRIGGER update_photography_projects_timestamp
                BEFORE UPDATE ON photography_projects
                FOR EACH ROW
                EXECUTE FUNCTION update_photography_projects_updated_at()
            `;
            console.log('✓ Created update trigger');
        } catch (error) {
            console.warn('Warning creating trigger:', error.message);
        }

        console.log('✓ Photography tables created successfully!\n');
        console.log('==================================');
        console.log('✅ Setup Complete!');
        console.log('==================================\n');
        console.log('Next steps:');
        console.log('1. Start your dev server: pnpm dev');
        console.log('2. Go to: http://localhost:3000/admin');
        console.log('3. Click the 📸 Photography tab');
        console.log('4. Create your first project and upload photos!\n');

        process.exit(0);
    } catch (error) {
        console.error('\n==================================');
        console.error('❌ Setup Failed');
        console.error('==================================\n');
        console.error('Error:', error.message);
        console.error('\nPlease check your database connection in .env.local\n');
        process.exit(1);
    }
}

setupDatabase();
