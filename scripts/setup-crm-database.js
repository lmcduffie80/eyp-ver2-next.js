#!/usr/bin/env node

/**
 * Script to set up CRM database tables
 * Run with: node scripts/setup-crm-database.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
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
    console.error('⚠️  Could not read .env.local file');
  }
}

loadEnvFile();

async function setupCRMDatabase() {
  console.log('\n🗄️  CRM Database Setup\n');
  console.log('='.repeat(60) + '\n');

  try {
    // Check for database connection
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!connectionString || connectionString.includes('placeholder')) {
      console.error('❌ No database connection string found!');
      console.error('   Please set DATABASE_URL or POSTGRES_URL in your .env.local file');
      process.exit(1);
    }

    console.log('⏳ Connecting to database...');
    const client = new Client({ connectionString });
    await client.connect();
    console.log('✓ Connected to database\n');

    // Read CRM schema file
    console.log('⏳ Reading CRM schema file...');
    const schemaPath = path.join(__dirname, '..', 'api-old', 'db', 'crm-schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error(`❌ Schema file not found at: ${schemaPath}`);
      await client.end();
      process.exit(1);
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('✓ Schema file loaded\n');

    // Execute schema
    console.log('⏳ Creating CRM tables...');
    console.log('   This may take a few moments...\n');
    
    await client.query(schema);
    
    console.log('✅ CRM database tables created successfully!\n');
    console.log('📋 Tables Created:');
    console.log('   • client_inquiries - Manage client inquiries');
    console.log('   • clients - Client records with portal access');
    console.log('   • projects - Project/event management');
    console.log('   • contracts - Contract builder and e-signatures');
    console.log('   • contract_templates - Reusable contract templates');
    console.log('   • meeting_notes - Client meeting notes');
    console.log('   • payments - Payment tracking');
    console.log('   • invoices - Invoice management\n');

    console.log('🔐 Login Credentials:');
    console.log('   Email: lee@externallyyoursproductions.com');
    console.log('   Password: Troy2010@1123198036\n');

    console.log('🚀 Access CRM at: http://localhost:3000/crm-admin/login\n');

    await client.end();

  } catch (error) {
    console.error('\n❌ Error setting up CRM database:', error.message);
    
    if (error.code === '42P07') {
      console.error('   Tables already exist. Use DROP TABLE if you want to recreate them.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Could not connect to database. Check your connection string.');
    } else {
      console.error('   Full error:', error);
    }
    
    process.exit(1);
  }
}

setupCRMDatabase();
