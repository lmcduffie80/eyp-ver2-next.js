#!/usr/bin/env node

/**
 * Script to create Lee admin user
 */

const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local file
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  } catch (error) {
    // Ignore if file doesn't exist
  }
}

loadEnvFile();

async function createLeeAdmin() {
  console.log('\n🔐 Creating CRM Admin User: Lee\n');
  console.log('='.repeat(50) + '\n');

  try {
    // Connect to database
    console.log('⏳ Connecting to database...');
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!connectionString || connectionString.includes('placeholder')) {
      console.error('❌ No database connection string found!');
      console.error('   Please set DATABASE_URL or POSTGRES_URL in your .env.local file');
      process.exit(1);
    }
    
    const client = new Client({
      connectionString: connectionString
    });

    await client.connect();
    console.log('✓ Connected to database');

    // Hash the password
    console.log('⏳ Hashing password...');
    const hashedPassword = await bcrypt.hash('Troy2010@1123198036', 10);
    console.log('✓ Password hashed');

    // Insert admin user
    console.log('⏳ Creating admin user...');
    const result = await client.query(
      `INSERT INTO users (username, email, password, first_name, last_name, user_type, is_super_user)
       VALUES ($1, $2, $3, $4, $5, 'admin', true)
       RETURNING id, username, email, user_type`,
      ['lee', 'lee@externallyyoursproductions.com', hashedPassword, 'Lee', null]
    );

    await client.end();

    const user = result.rows[0];
    console.log('\n✅ Admin user created successfully!\n');
    console.log('📋 User Details:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Type: ${user.user_type}`);
    console.log('\n🔐 Login Credentials:');
    console.log('   Email: lee@externallyyoursproductions.com');
    console.log('   Password: Troy2010@1123198036');
    console.log('\n🚀 You can now login at: http://localhost:3000/crm-admin/login\n');

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    if (error.code === '23505') {
      console.error('   This username or email already exists.');
    } else {
      console.error('   Full error:', error);
    }
    process.exit(1);
  }
}

createLeeAdmin();
