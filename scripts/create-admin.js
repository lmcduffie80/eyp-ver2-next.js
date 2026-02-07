#!/usr/bin/env node

/**
 * Script to create an admin user for the CRM system
 * Run with: node scripts/create-admin.js
 */

const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  console.log('\n🔐 Create CRM Admin User\n');
  console.log('='.repeat(50) + '\n');

  try {
    // Get user input
    const username = await question('Username: ');
    const email = await question('Email: ');
    const password = await question('Password: ');
    const firstName = await question('First Name (optional): ');
    const lastName = await question('Last Name (optional): ');

    if (!username || !email || !password) {
      console.error('\n❌ Username, email, and password are required!');
      rl.close();
      process.exit(1);
    }

    // Hash the password
    console.log('\n⏳ Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Connect to database
    console.log('⏳ Connecting to database...');
    const client = new Client({
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL
    });

    await client.connect();

    // Insert admin user
    console.log('⏳ Creating admin user...');
    const result = await client.query(
      `INSERT INTO users (username, email, password, first_name, last_name, user_type, is_super_user)
       VALUES ($1, $2, $3, $4, $5, 'admin', true)
       RETURNING id, username, email, user_type`,
      [username, email, hashedPassword, firstName || null, lastName || null]
    );

    await client.end();

    const user = result.rows[0];
    console.log('\n✅ Admin user created successfully!\n');
    console.log('📋 User Details:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Type: ${user.user_type}`);
    console.log('\n🚀 You can now login at: http://localhost:3000/crm-admin/login\n');

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    if (error.code === '23505') {
      console.error('   This username or email already exists.');
    }
  } finally {
    rl.close();
  }
}

createAdmin();
