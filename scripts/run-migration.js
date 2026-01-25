const sql = require('../api-old/db/connection.js').default;
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../api-old/db/add-photography-status.sql'),
      'utf8'
    );
    
    console.log('Running migration...');
    console.log(migrationSQL);
    
    // Split by semicolon and run each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      await sql([statement]);
      console.log('✅ Executed statement');
    }
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
