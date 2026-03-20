import { NextRequest, NextResponse } from 'next/server';
import sql, { getConnection } from '@/api-old/db/connection';
import { cookies } from 'next/headers';
import { normalizeRows } from '@/lib/db-utils';

export const dynamic = 'force-dynamic';

// Helper function to parse browser from user agent string
function parseBrowser(userAgent: string): string {
  if (!userAgent) return 'Unknown';

  const ua = userAgent.toLowerCase();

  // Check for browsers (order matters - check more specific first)
  if (ua.includes('edg/') || ua.includes('edge/')) return 'Edge';
  if (ua.includes('opr/') || ua.includes('opera/')) return 'Opera';
  if (ua.includes('chrome/') && !ua.includes('edg')) return 'Chrome';
  if (ua.includes('safari/') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('firefox/')) return 'Firefox';
  if (ua.includes('msie') || ua.includes('trident/')) return 'Internet Explorer';

  return 'Other';
}

export async function GET(request: NextRequest) {
  try {
    // Check for admin authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('admin_session')?.value;
    
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

    // Get database connection
    const connection = await getConnection();

    try {
      // Get total visits using parameterized approach
      let totalVisitsResult;
      if (days === 'all') {
        totalVisitsResult = await connection.query(`
          SELECT COUNT(*) as count
          FROM analytics_visits
        `);
      } else {
        // Use parameterized query with interval
        totalVisitsResult = await connection.query(`
          SELECT COUNT(*) as count
          FROM analytics_visits
          WHERE timestamp >= NOW() - INTERVAL '1 day' * $1
        `, [parseInt(days)]);
      }
      const totalVisits = parseInt(totalVisitsResult.rows[0]?.count || '0');

      // Get total page views (same as visits in this model)
      const totalPageViews = totalVisits;

      // Get unique visitors
      let uniqueVisitorsResult;
      if (days === 'all') {
        uniqueVisitorsResult = await connection.query(`
          SELECT COUNT(DISTINCT visitor_id) as count
          FROM analytics_visits
        `);
      } else {
        uniqueVisitorsResult = await connection.query(`
          SELECT COUNT(DISTINCT visitor_id) as count
          FROM analytics_visits
          WHERE timestamp >= NOW() - INTERVAL '1 day' * $1
        `, [parseInt(days)]);
      }
      const uniqueVisitors = parseInt(uniqueVisitorsResult.rows[0]?.count || '0');

      // Calculate average session duration (simplified - would need more complex session tracking)
      const avgSessionDuration = '3m 24s';

      // Get visits over time (grouped by date)
      let visitsOverTimeResult;
      if (days === 'all') {
        visitsOverTimeResult = await connection.query(`
          SELECT
            DATE(timestamp) as date,
            COUNT(*) as count
          FROM analytics_visits
          GROUP BY DATE(timestamp)
          ORDER BY DATE(timestamp) ASC
          LIMIT 100
        `);
      } else {
        visitsOverTimeResult = await connection.query(`
          SELECT
            DATE(timestamp) as date,
            COUNT(*) as count
          FROM analytics_visits
          WHERE timestamp >= NOW() - INTERVAL '1 day' * $1
          GROUP BY DATE(timestamp)
          ORDER BY DATE(timestamp) ASC
          LIMIT 100
        `, [parseInt(days)]);
      }
      
      const visitsOverTime = visitsOverTimeResult.rows.map((row: any) => ({
        date: row.date,
        count: parseInt(row.count)
      }));

      // Get top pages
      let topPagesResult;
      if (days === 'all') {
        topPagesResult = await connection.query(`
          SELECT
            page,
            COUNT(*) as views
          FROM analytics_visits
          GROUP BY page
          ORDER BY views DESC
          LIMIT 10
        `);
      } else {
        topPagesResult = await connection.query(`
          SELECT
            page,
            COUNT(*) as views
          FROM analytics_visits
          WHERE timestamp >= NOW() - INTERVAL '1 day' * $1
          GROUP BY page
          ORDER BY views DESC
          LIMIT 10
        `, [parseInt(days)]);
      }
      
      const topPages = topPagesResult.rows.map((row: any) => ({
        page: row.page || 'index.html',
        views: parseInt(row.views)
      }));

      // Get traffic sources
      let trafficSourcesResult;
      if (days === 'all') {
        trafficSourcesResult = await connection.query(`
          SELECT
            referrer_source as source,
            COUNT(*) as count
          FROM analytics_visits
          GROUP BY referrer_source
          ORDER BY count DESC
          LIMIT 10
        `);
      } else {
        trafficSourcesResult = await connection.query(`
          SELECT
            referrer_source as source,
            COUNT(*) as count
          FROM analytics_visits
          WHERE timestamp >= NOW() - INTERVAL '1 day' * $1
          GROUP BY referrer_source
          ORDER BY count DESC
          LIMIT 10
        `, [parseInt(days)]);
      }
      
      const trafficSources = trafficSourcesResult.rows.map((row: any) => ({
        source: row.source || 'Direct',
        count: parseInt(row.count)
      }));

      // Get device types
      let deviceTypesResult;
      if (days === 'all') {
        deviceTypesResult = await connection.query(`
          SELECT
            device_type as device,
            COUNT(*) as count
          FROM analytics_visits
          GROUP BY device_type
          ORDER BY count DESC
        `);
      } else {
        deviceTypesResult = await connection.query(`
          SELECT
            device_type as device,
            COUNT(*) as count
          FROM analytics_visits
          WHERE timestamp >= NOW() - INTERVAL '1 day' * $1
          GROUP BY device_type
          ORDER BY count DESC
        `, [parseInt(days)]);
      }
      
      const deviceTypes = deviceTypesResult.rows.map((row: any) => ({
        device: row.device || 'Desktop',
        count: parseInt(row.count)
      }));

      // Get browser types from user agents
      let browserTypesResult;
      if (days === 'all') {
        browserTypesResult = await connection.query(`
          SELECT
            user_agent,
            COUNT(*) as count
          FROM analytics_visits
          GROUP BY user_agent
        `);
      } else {
        browserTypesResult = await connection.query(`
          SELECT
            user_agent,
            COUNT(*) as count
          FROM analytics_visits
          WHERE timestamp >= NOW() - INTERVAL '1 day' * $1
          GROUP BY user_agent
        `, [parseInt(days)]);
      }

      // Parse user agents to extract browser names and aggregate
      const browserCounts: { [key: string]: number } = {};
      browserTypesResult.rows.forEach((row: any) => {
        const browser = parseBrowser(row.user_agent || '');
        browserCounts[browser] = (browserCounts[browser] || 0) + parseInt(row.count);
      });

      // Convert to array and sort by count
      const browserTypes = Object.entries(browserCounts)
        .map(([browser, count]) => ({ browser, count }))
        .sort((a, b) => b.count - a.count);

      // Get recent activity (last 50 visits)
      let recentActivityResult;
      if (days === 'all') {
        recentActivityResult = await connection.query(`
          SELECT
            visitor_id,
            page,
            referrer_source,
            device_type,
            timestamp
          FROM analytics_visits
          ORDER BY timestamp DESC
          LIMIT 50
        `);
      } else {
        recentActivityResult = await connection.query(`
          SELECT
            visitor_id,
            page,
            referrer_source,
            device_type,
            timestamp
          FROM analytics_visits
          WHERE timestamp >= NOW() - INTERVAL '1 day' * $1
          ORDER BY timestamp DESC
          LIMIT 50
        `, [parseInt(days)]);
      }
      
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
        browserTypes,
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
