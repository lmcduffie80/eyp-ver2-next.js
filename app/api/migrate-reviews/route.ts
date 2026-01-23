import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/api-old/db/connection';
import parseDJName from '@/api-old/utils/parse-dj-name';

/**
 * Migration endpoint to assign existing reviews to DJs
 * POST /api/migrate-reviews
 * 
 * Processes all reviews without a dj_username and attempts to auto-assign
 * them based on DJ names mentioned in the comment text.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
export async function POST(_request: NextRequest) {
  let client;
  
  try {
    client = await getConnection();
    
    console.log('[Review Migration] Starting migration process...');
    
    // 1. Get all reviews without dj_username for DJ Entertainment service
    const reviewsQuery = await client.query(`
      SELECT id, comment, client_name, service_type, event_name, event_date 
      FROM reviews 
      WHERE (dj_username IS NULL OR dj_username = '') 
      AND service_type = 'DJ Entertainment'
      ORDER BY created_at DESC
    `);
    
    const reviews = reviewsQuery.rows;
    console.log(`[Review Migration] Found ${reviews.length} reviews to process`);
    
    // 2. Process each review
    const results = {
      total: reviews.length,
      assigned: 0,
      unassigned: 0,
      assignedList: [] as any[],
      unassignedList: [] as any[]
    };
    
    for (const review of reviews) {
      console.log(`\n[Review Migration] Processing review ID ${review.id} from ${review.client_name}`);
      console.log(`[Review Migration] Comment: "${review.comment?.substring(0, 100)}..."`);
      
      try {
        // Attempt to parse DJ name from comment
        const djUsername = await parseDJName(review.comment);
        
        if (djUsername) {
          // Update review with matched DJ
          await client.query(`
            UPDATE reviews 
            SET dj_username = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2
          `, [djUsername, review.id]);
          
          results.assigned++;
          results.assignedList.push({
            id: review.id,
            client_name: review.client_name,
            event_name: review.event_name,
            assigned_to: djUsername,
            comment_preview: review.comment?.substring(0, 100)
          });
          
          console.log(`[Review Migration] ✅ Assigned to: ${djUsername}`);
        } else {
          // No DJ name found in comment
          results.unassigned++;
          results.unassignedList.push({
            id: review.id,
            client_name: review.client_name,
            event_name: review.event_name,
            event_date: review.event_date,
            comment_preview: review.comment?.substring(0, 150)
          });
          
          console.log(`[Review Migration] ❌ No DJ name found`);
        }
      } catch (parseError) {
        console.error(`[Review Migration] Error processing review ${review.id}:`, parseError);
        results.unassigned++;
        results.unassignedList.push({
          id: review.id,
          client_name: review.client_name,
          error: 'Processing error',
          comment_preview: review.comment?.substring(0, 150)
        });
      }
    }
    
    console.log('\n[Review Migration] ========== MIGRATION COMPLETE ==========');
    console.log(`[Review Migration] Total processed: ${results.total}`);
    console.log(`[Review Migration] Successfully assigned: ${results.assigned}`);
    console.log(`[Review Migration] Unable to assign: ${results.unassigned}`);
    console.log('[Review Migration] ========================================\n');
    
    return NextResponse.json({
      success: true,
      message: 'Review migration completed',
      results: results
    });
    
  } catch (error) {
    console.error('[Review Migration] Fatal error:', error);
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * GET endpoint to check migration status
 * Returns count of reviews with/without dj_username
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
export async function GET(_request: NextRequest) {
  let client;
  
  try {
    client = await getConnection();
    
    // Count reviews by assignment status
    const statsQuery = await client.query(`
      SELECT 
        COUNT(*) FILTER (WHERE service_type = 'DJ Entertainment' AND (dj_username IS NULL OR dj_username = '')) as unassigned,
        COUNT(*) FILTER (WHERE service_type = 'DJ Entertainment' AND dj_username IS NOT NULL AND dj_username != '') as assigned,
        COUNT(*) FILTER (WHERE service_type = 'DJ Entertainment') as total_dj_reviews,
        COUNT(*) as total_reviews
      FROM reviews
    `);
    
    const stats = statsQuery.rows[0];
    
    return NextResponse.json({
      success: true,
      stats: {
        total_reviews: parseInt(stats.total_reviews),
        total_dj_reviews: parseInt(stats.total_dj_reviews),
        assigned: parseInt(stats.assigned),
        unassigned: parseInt(stats.unassigned)
      }
    });
    
  } catch (error) {
    console.error('[Review Migration] Error fetching stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch migration stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
