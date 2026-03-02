import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import bcrypt from 'bcryptjs';

function validatePasswordStrength(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true, message: 'Password is valid' };
}

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// GET /api/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await sql`
      SELECT * FROM users WHERE id = ${id}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0];
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        userType: user.user_type,
        isSuperUser: user.is_super_user,
        profilePicture: user.profile_picture,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
  } catch (error) {
    console.error('User GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      profilePicture
    } = body;

    // If password is being updated, validate and hash it
    let hashedPassword = null;
    if (password) {
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        return NextResponse.json(
          { success: false, error: passwordValidation.message },
          { status: 400 }
        );
      }
      hashedPassword = await hashPassword(password);
    }

    // Update user - use COALESCE to only update provided fields
    const result = await sql`
      UPDATE users SET
        username = COALESCE(${username || null}, username),
        email = COALESCE(${email || null}, email),
        password = COALESCE(${hashedPassword || null}, password),
        first_name = COALESCE(${firstName !== undefined ? firstName : null}, first_name),
        last_name = COALESCE(${lastName !== undefined ? lastName : null}, last_name),
        phone = COALESCE(${phone !== undefined ? phone : null}, phone),
        profile_picture = COALESCE(${profilePicture !== undefined ? profilePicture : null}, profile_picture),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0];
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        userType: user.user_type,
        isSuperUser: user.is_super_user,
        profilePicture: user.profile_picture,
        updatedAt: user.updated_at
      }
    });
  } catch (error) {
    console.error('User PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // First check if user exists and is not a super user
    const existing = await sql`
      SELECT is_super_user FROM users WHERE id = ${id}
    `;

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (existing.rows[0].is_super_user) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete super user' },
        { status: 403 }
      );
    }

    await sql`DELETE FROM users WHERE id = ${id}`;

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('User DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
