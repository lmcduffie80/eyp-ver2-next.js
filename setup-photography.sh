#!/bin/bash

# Photography Portfolio Setup Script
# This script sets up the database tables for the photography management system

echo "=================================="
echo "Photography Portfolio Setup"
echo "=================================="
echo ""

# Check if POSTGRES_URL is set
if [ -z "$POSTGRES_URL" ]; then
    echo "❌ Error: POSTGRES_URL environment variable is not set"
    echo ""
    echo "Please set it in your .env.local file or export it:"
    echo "  export POSTGRES_URL='your_connection_string'"
    echo ""
    exit 1
fi

echo "✓ Found POSTGRES_URL"
echo ""

# Run the schema
echo "Creating photography tables..."
echo ""

psql "$POSTGRES_URL" -f api/db/photography-schema.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "=================================="
    echo "✅ Setup Complete!"
    echo "=================================="
    echo ""
    echo "Photography tables created successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Start your dev server: pnpm dev"
    echo "2. Go to: http://localhost:3000/admin"
    echo "3. Click the 📸 Photography tab"
    echo "4. Create your first project and upload photos!"
    echo ""
    echo "See PHOTOGRAPHY_SETUP_GUIDE.md for more details."
    echo ""
else
    echo ""
    echo "=================================="
    echo "❌ Setup Failed"
    echo "=================================="
    echo ""
    echo "There was an error creating the tables."
    echo "Please check your POSTGRES_URL and try again."
    echo ""
    exit 1
fi
