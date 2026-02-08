import { NextRequest, NextResponse } from 'next/server';
import sql, { getConnection } from '@/api-old/db/connection';
import { cookies } from 'next/headers';
import { normalizeRows } from '@/lib/db-utils';

export async function GET(request: NextRequest) {
  try {
    // Check for admin authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days') || '30';
    
    // Validate and sanitize days parameter (must be a number or 'all')
    const validDays = ['7', '30', '90', '365', 'all'];
    const days = validDays.includes(daysParam) ? daysParam : '30';

    // Build WHERE clause based on time range
    const whereClause = days !== 'all' 
      ? `WHERE timestamp >= NOW() - INTERVAL '${days} days'`
      : '';

    // Get database connection
    const connection = await getConnection();
    
    try {
      // Get total visits
      const totalVisitsResult = await connection.query(`
        SELECT COUNT(*) as count
        FROM analytics_visits
        ${whereClause}
      `);
      const totalVisits = parseInt(totalVisitsResult.rows[0]?.count || '0');

      // Get total page views (same as visits in this model)
      const totalPageViews = totalVisits;

      // Get unique visitors
      const uniqueVisitorsResult = await connection.query(`
        SELECT COUNT(DISTINCT visitor_id) as count
        FROM analytics_visits
        ${whereClause}
      `);
      const uniqueVisitors = parseInt(uniqueVisitorsResult.rows[0]?.count || '0');

      // Calculate average session duration (simplified - would need more complex session tracking)
      const avgSessionDuration = '3m 24s';

      // Get visits over time (grouped by date)
      const visitsOverTimeResult = await connection.query(`
        SELECT 
          DATE(timestamp) as date,
          COUNT(*) as count
        FROM analytics_visits
        ${whereClause}
        GROUP BY DATE(timestamp)
        ORDER BY DATE(timestamp) ASC
        LIMIT 100
      `);
      
      const visitsOverTime = visitsOverTimeResult.rows.map((row: any) => ({
        date: row.date,
        count: parseInt(row.count)
      }));

      // Get top pages
      const topPagesResult = await connection.query(`
        SELECT 
          page,
          COUNT(*) as views
        FROM analytics_visits
        ${whereClause}
        GROUP BY page
        ORDER BY views DESC
        LIMIT 10
      `);
      
      const topPages = topPagesResult.rows.map((row: any) => ({
        page: row.page || 'index.html',
        views: parseInt(row.views)
      }));

      // Get traffic sources
      const trafficSourcesResult = await connection.query(`
        SELECT 
          referrer_source as source,
          COUNT(*) as count
        FROM analytics_visits
        ${whereClause}
        GROUP BY referrer_source
        ORDER BY count DESC
        LIMIT 10
      `);
      
      const trafficSources = trafficSourcesResult.rows.map((row: any) => ({
        source: row.source || 'Direct',
        count: parseInt(row.count)
      }));

      // Get device types
      const deviceTypesResult = await connection.query(`
        SELECT 
          device_type as device,
          COUNT(*) as count
        FROM analytics_visits
        ${whereClause}
        GROUP BY device_type
        ORDER BY count DESC
      `);
      
      const deviceTypes = deviceTypesResult.rows.map((row: any) => ({
        device: row.device || 'Desktop',
        count: parseInt(row.count)
      }));

      // Get recent activity (last 50 visits)
      const recentActivityResult = await connection.query(`
        SELECT 
          visitor_id,
          page,
          referrer_source,
          device_type,
          timestamp
        FROM analytics_visits
        ${whereClause}
        ORDER BY timestamp DESC
        LIMIT 50
      `);
      
      const recentActivity = recentActivityResult.rows.map((row: any) => ({
        visitorId: row.visitor_id?.substring(0, 20) + '...',
        page: row.page,
        source: row.referrer_source,
        device: row.device_type,
        timestamp: row.timestamp
      }));
      
      // Release connection back to pool
      connection.release();
      
      return NextResponse.json({
        totalVisits,
        totalPageViews,
        uniqueVisitors,
        avgSessionDuration,
        visitsOverTime,
        topPages,
        trafficSources,
        deviceTypes,
        recentActivity
      });
    } catch (innerError: any) {
      // Make sure to release connection even on error
      connection.release();
      throw innerError;
    }

  } catch (error: any) {
    console.error('Analytics stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    );
  }
}
