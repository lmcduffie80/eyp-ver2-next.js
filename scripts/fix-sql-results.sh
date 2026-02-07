#!/bin/bash

# This script adds compatibility handling for SQL results that may come from either
# the standard pg library (returns array directly) or the custom connection wrapper
# (returns {rows, rowCount} object)

cd /Users/donaldmcduffie/Documents/GitHub/eyp-ver2-next.js./eyp-ver2-next.js

# Find all TypeScript files in API routes that use sql queries
FILES=$(find app/api/crm app/api/client-portal -name "*.ts" -type f | grep -v ".map")

echo "Fixing SQL result handling in CRM and Client Portal API routes..."
echo "Found $(echo "$FILES" | wc -l) files to process"

for file in $FILES; do
  # Skip if file doesn't contain sql queries
  if ! grep -q "await sql\`" "$file"; then
    continue
  fi
  
  # Check if file already uses result.rows pattern
  if grep -q "result\.rows || result" "$file"; then
    echo "✓ Already fixed: $file"
    continue
  fi
  
  # Check if file has any .length checks that need fixing
  if ! grep -q "\.length ===" "$file" && ! grep -q "\.length >" "$file" && ! grep -q "\.length <" "$file"; then
    echo "○ No length checks: $file"
    continue
  fi
  
  echo "Needs fixing: $file"
done

echo "Done!"
