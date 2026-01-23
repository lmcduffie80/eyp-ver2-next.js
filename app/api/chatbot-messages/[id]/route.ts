import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET /api/chatbot-messages/[id] - Get specific message
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await sql`
      SELECT * FROM chatbot_messages WHERE id = ${id}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    const row = result.rows[0];
    return NextResponse.json({
      success: true,
      data: {
        id: row.id,
        conversationId: row.conversation_id,
        senderName: row.sender_name,
        senderEmail: row.sender_email,
        senderPhone: row.sender_phone,
        message: row.message,
        isAdminReply: row.is_admin_reply,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    });
  } catch (error) {
    console.error('Error in chatbot-messages GET [id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/chatbot-messages/[id] - Update message
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { message, status, adminReply } = body;

    // Validate that at least one field is provided
    if (message === undefined && status === undefined && adminReply === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one field must be provided for update (message, status, or adminReply)'
        },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status !== undefined && !['pending', 'read', 'replied', 'archived'].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid status is required: pending, read, replied, or archived'
        },
        { status: 400 }
      );
    }

    // Build dynamic UPDATE query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (message !== undefined) {
      updates.push(`message = $${paramIndex++}`);
      values.push(message);
    }
    if (adminReply !== undefined) {
      updates.push(`is_admin_reply = $${paramIndex++}`);
      values.push(adminReply);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    const query = `
      UPDATE chatbot_messages 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    values.push(id);

    const result = await sql.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    const row = result.rows[0];
    return NextResponse.json({
      success: true,
      data: {
        id: row.id,
        conversationId: row.conversation_id,
        senderName: row.sender_name,
        senderEmail: row.sender_email,
        senderPhone: row.sender_phone,
        message: row.message,
        isAdminReply: row.is_admin_reply,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    });
  } catch (error) {
    console.error('Error in chatbot-messages PUT [id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/chatbot-messages/[id] - Delete message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await sql`
      DELETE FROM chatbot_messages WHERE id = ${id} RETURNING *
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error in chatbot-messages DELETE [id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
