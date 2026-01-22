import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET /api/chatbot-messages - Get all messages/conversations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const conversation_id = searchParams.get('conversation_id');
    const status = searchParams.get('status');

    let query;
    try {
      if (conversation_id) {
        // Get messages for a specific conversation
        query = await sql`
          SELECT * FROM chatbot_messages 
          WHERE conversation_id = ${conversation_id} 
          ORDER BY created_at ASC
        `;
      } else if (status) {
        query = await sql`
          SELECT * FROM chatbot_messages 
          WHERE status = ${status}
          ORDER BY created_at DESC
        `;
      } else {
        query = await sql`
          SELECT * FROM chatbot_messages 
          ORDER BY created_at DESC
        `;
      }

      const mappedData = query.rows.map(row => ({
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
      }));

      return NextResponse.json({
        success: true,
        data: mappedData
      });
    } catch (dbError: any) {
      // Check if it's a "table doesn't exist" error
      if (dbError.message && (dbError.message.includes('does not exist') || dbError.message.includes('relation') || dbError.message.includes('chatbot_messages'))) {
        console.error('Database table chatbot_messages does not exist.');
        return NextResponse.json(
          {
            success: false,
            error: 'Database table chatbot_messages does not exist. Please run the migration script.'
          },
          { status: 500 }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error in chatbot-messages GET:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/chatbot-messages - Create new message from chatbot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      conversationId,
      senderName,
      senderEmail,
      senderPhone,
      message
    } = body;

    // Validation
    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: message' },
        { status: 400 }
      );
    }

    // Create or get conversation ID
    let finalConversationId = conversationId;
    if (!finalConversationId || finalConversationId === 'new' || finalConversationId === '') {
      finalConversationId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Insert message
    const result = await sql`
      INSERT INTO chatbot_messages (
        conversation_id, sender_name, sender_email, sender_phone, 
        message, is_admin_reply, status
      ) VALUES (
        ${finalConversationId},
        ${senderName || null},
        ${senderEmail || null},
        ${senderPhone || null},
        ${message},
        false,
        'pending'
      )
      RETURNING *
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
    console.error('Error in chatbot-messages POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
