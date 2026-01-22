import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// POST /api/chatbot-messages/reply - Create admin reply to a conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      conversationId,
      message,
      adminName
    } = body;

    // Validation
    if (!conversationId || !message) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: conversationId, message'
        },
        { status: 400 }
      );
    }

    // Insert admin reply message
    const result = await sql`
      INSERT INTO chatbot_messages (
        conversation_id, sender_name, message, is_admin_reply, status
      ) VALUES (
        ${conversationId},
        ${adminName || 'Admin'},
        ${message},
        true,
        'replied'
      )
      RETURNING *
    `;

    // Update original message status to 'replied' if it exists
    await sql`
      UPDATE chatbot_messages 
      SET status = 'replied', updated_at = CURRENT_TIMESTAMP
      WHERE conversation_id = ${conversationId} 
      AND is_admin_reply = false 
      AND status != 'replied'
    `;

    return NextResponse.json(
      {
        success: true,
        data: {
          id: result.rows[0].id,
          conversationId: result.rows[0].conversation_id,
          senderName: result.rows[0].sender_name,
          senderEmail: result.rows[0].sender_email,
          senderPhone: result.rows[0].sender_phone,
          message: result.rows[0].message,
          isAdminReply: result.rows[0].is_admin_reply,
          status: result.rows[0].status,
          createdAt: result.rows[0].created_at,
          updatedAt: result.rows[0].updated_at
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in chatbot-messages reply:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
