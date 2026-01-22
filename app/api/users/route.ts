import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/api/db/connection';
import bcrypt from 'bcryptjs';

// GET all users (with optional search and filter)
export async function GET(request: NextRequest) {
  let client;
  
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const userType = searchParams.get('type') || '';
    
    client = await getConnection();
    
    let query = `
      SELECT 
        id, username, email, first_name, last_name, phone, 
        user_type, is_super_user, profile_picture, 
        created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    // Add search filter
    if (search) {
      query += ` AND (
        LOWER(first_name) LIKE LOWER($${paramIndex}) OR 
        LOWER(last_name) LIKE LOWER($${paramIndex}) OR 
        LOWER(email) LIKE LOWER($${paramIndex}) OR 
        LOWER(username) LIKE LOWER($${paramIndex})
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    // Add user type filter
    if (userType) {
      query += ` AND user_type = $${paramIndex}`;
      params.push(userType);
      paramIndex++;
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const result = await client.query(query, params);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  let client;
  
  try {
    const body = await request.json();
    const { 
      username, email, password, first_name, last_name, 
      phone, user_type, is_super_user, profile_picture 
    } = body;
    
    // Validate required fields
    if (!username || !email || !password || !first_name || !last_name || !user_type) {
      return NextResponse.json({
        success: false,
        error: 'Username, email, password, first name, last name, and user type are required'
      }, { status: 400 });
    }
    
    // Validate user type
    const validUserTypes = ['dj', 'photographer', 'videographer', 'coordination', 'admin'];
    if (!validUserTypes.includes(user_type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid user type'
      }, { status: 400 });
    }
    
    client = await getConnection();
    
    // Check if username or email already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (existingUser.rows.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Username or email already exists'
      }, { status: 409 });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    const result = await client.query(`
      INSERT INTO users (
        username, email, password, first_name, last_name, 
        phone, user_type, is_super_user, profile_picture, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      RETURNING 
        id, username, email, first_name, last_name, phone, 
        user_type, is_super_user, profile_picture, created_at, updated_at
    `, [
      username,
      email,
      hashedPassword,
      first_name,
      last_name,
      phone || null,
      user_type,
      is_super_user || false,
      profile_picture || null
    ]);
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'User created successfully'
    });
    
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

// PUT update existing user
export async function PUT(request: NextRequest) {
  let client;
  
  try {
    const body = await request.json();
    const { 
      id, username, email, password, first_name, last_name, 
      phone, user_type, is_super_user, profile_picture 
    } = body;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }
    
    client = await getConnection();
    
    // Check if user exists
    const existingUser = await client.query(
      'SELECT id, username, email FROM users WHERE id = $1',
      [id]
    );
    
    if (existingUser.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }
    
    // Check if new username or email conflicts with other users
    if (username || email) {
      const conflictCheck = await client.query(
        'SELECT id FROM users WHERE (username = $1 OR email = $2) AND id != $3',
        [username || existingUser.rows[0].username, email || existingUser.rows[0].email, id]
      );
      
      if (conflictCheck.rows.length > 0) {
        return NextResponse.json({
          success: false,
          error: 'Username or email already exists'
        }, { status: 409 });
      }
    }
    
    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (username) {
      updates.push(`username = $${paramIndex++}`);
      values.push(username);
    }
    if (email) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = $${paramIndex++}`);
      values.push(hashedPassword);
    }
    if (first_name) {
      updates.push(`first_name = $${paramIndex++}`);
      values.push(first_name);
    }
    if (last_name) {
      updates.push(`last_name = $${paramIndex++}`);
      values.push(last_name);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(phone || null);
    }
    if (user_type) {
      updates.push(`user_type = $${paramIndex++}`);
      values.push(user_type);
    }
    if (is_super_user !== undefined) {
      updates.push(`is_super_user = $${paramIndex++}`);
      values.push(is_super_user);
    }
    if (profile_picture !== undefined) {
      updates.push(`profile_picture = $${paramIndex++}`);
      values.push(profile_picture || null);
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    
    if (updates.length === 1) {
      return NextResponse.json({
        success: false,
        error: 'No fields to update'
      }, { status: 400 });
    }
    
    values.push(id);
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id, username, email, first_name, last_name, phone, 
        user_type, is_super_user, profile_picture, created_at, updated_at
    `;
    
    const result = await client.query(query, values);
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'User updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

// DELETE remove user
export async function DELETE(request: NextRequest) {
  let client;
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }
    
    client = await getConnection();
    
    // Check if user exists and is not a super user
    const user = await client.query(
      'SELECT id, username, is_super_user FROM users WHERE id = $1',
      [id]
    );
    
    if (user.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }
    
    if (user.rows[0].is_super_user) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete super admin user'
      }, { status: 403 });
    }
    
    // Delete user
    await client.query('DELETE FROM users WHERE id = $1', [id]);
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
