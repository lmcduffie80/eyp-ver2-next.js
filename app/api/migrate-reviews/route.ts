import { NextResponse } from 'next/server';
import { getConnection } from '@/api-old/db/connection';

export async function POST() {
  let client;
  
  try {
    client = await getConnection();
    
    // Define the 6 reviews to migrate from homepage
    const reviews = [
      {
        client_name: "Sarah M.",
        service_type: "Photography Services",
        dj_username: null,
        rating: 5,
        comment: "The photography team captured our wedding day perfectly! Every moment was beautifully documented, and we now have stunning photos that we'll treasure forever. Their attention to detail and creative eye made our special day even more memorable.",
        event_name: "Wedding",
        event_date: "2025-06-15",
        status: "approved"
      },
      {
        client_name: "Emily & James",
        service_type: "Videography Services",
        dj_username: null,
        rating: 5,
        comment: "Our wedding video exceeded all expectations! The team created a cinematic masterpiece that perfectly captured the emotion and joy of our celebration. Every time we watch it, we're transported back to that magical day. Absolutely incredible work!",
        event_name: "Wedding Celebration",
        event_date: "2025-08-20",
        status: "approved"
      },
      {
        client_name: "Jessica & Tom",
        service_type: "DJ Entertainment",
        dj_username: "lee",
        rating: 5,
        comment: "The DJ brought incredible energy to our wedding reception! The dance floor was packed all night, and the music selection was perfect. They kept the party going and made sure everyone had an amazing time. Highly professional and super fun!",
        event_name: "Wedding Reception",
        event_date: "2025-09-12",
        status: "approved"
      },
      {
        client_name: "Amanda K.",
        service_type: "Photography Services",
        dj_username: null,
        rating: 5,
        comment: "Professional, talented, and so easy to work with! The photographers made us feel comfortable throughout the entire session and delivered breathtaking photos. We couldn't be happier with the results and would definitely book them again.",
        event_name: "Engagement Session",
        event_date: "2024-05-10",
        status: "approved"
      },
      {
        client_name: "Rachel & David",
        service_type: "Videography Services",
        dj_username: null,
        rating: 5,
        comment: "The highlight film they created was absolutely stunning! It beautifully told our story and captured all the special moments. The quality is outstanding, and we love sharing it with family and friends. Worth every penny!",
        event_name: "Wedding",
        event_date: "2024-07-22",
        status: "approved"
      },
      {
        client_name: "Lisa & Mark",
        service_type: "DJ Entertainment",
        dj_username: null,
        rating: 5,
        comment: "Best DJ we've ever worked with! They understood exactly what we wanted and kept the energy high all night. The sound quality was perfect, the music selection was spot-on, and they made our event unforgettable. Our guests are still talking about how great the music was!",
        event_name: "Wedding Reception",
        event_date: "2024-10-05",
        status: "approved"
      }
    ];
    
    // Check if reviews already exist to prevent duplicates
    const existingReviews = await client.query(`
      SELECT COUNT(*) as count FROM reviews 
      WHERE client_name IN ('Sarah M.', 'Emily & James', 'Jessica & Tom', 'Amanda K.', 'Rachel & David', 'Lisa & Mark')
    `);
    
    if (parseInt(existingReviews.rows[0].count) > 0) {
      return NextResponse.json({
        success: false,
        message: 'Reviews already migrated',
        count: existingReviews.rows[0].count
      }, { status: 400 });
    }
    
    // Insert all reviews
    const insertedReviews = [];
    for (const review of reviews) {
      const result = await client.query(`
        INSERT INTO reviews (
          client_name, service_type, dj_username, rating, 
          comment, event_name, event_date, status, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
        RETURNING id, client_name, service_type, dj_username, rating, status
      `, [
        review.client_name,
        review.service_type,
        review.dj_username,
        review.rating,
        review.comment,
        review.event_name,
        review.event_date,
        review.status
      ]);
      
      insertedReviews.push(result.rows[0]);
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${insertedReviews.length} reviews from homepage`,
      data: insertedReviews
    });
    
  } catch (error) {
    console.error('Error migrating reviews:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to migrate reviews',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

// GET endpoint to check migration status
export async function GET() {
  let client;
  
  try {
    client = await getConnection();
    
    const result = await client.query(`
      SELECT COUNT(*) as count FROM reviews 
      WHERE client_name IN ('Sarah M.', 'Emily & James', 'Jessica & Tom', 'Amanda K.', 'Rachel & David', 'Lisa & Mark')
      AND status = 'approved'
    `);
    
    const count = parseInt(result.rows[0].count);
    
    return NextResponse.json({
      success: true,
      migrated: count === 6,
      count: count,
      message: count === 6 ? 'All reviews migrated' : `${count}/6 reviews found`
    });
    
  } catch (error) {
    console.error('Error checking migration status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check migration status'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
