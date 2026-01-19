import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Import the existing API handler
    const handler = await import('../../../api/users/index.js');
    
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const user_type = searchParams.get('user_type');
    
    // Create a mock request object compatible with the existing handler
    const req = {
      method: 'GET',
      query: user_type ? { user_type } : {},
      headers: {
        origin: request.headers.get('origin') || '',
        host: request.headers.get('host') || ''
      }
    };
    
    // Create a mock response object to capture the response
    let responseData: any = null;
    let statusCode = 200;
    
    const res = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (data: any) => {
            responseData = data;
            return res;
          },
          end: () => res
        };
      },
      setHeader: () => res,
      end: () => res
    };
    
    // Call the existing handler
    await handler.default(req, res);
    
    // Return the response
    if (responseData) {
      // If the response has success and data structure, return just the data array
      if (responseData.success && responseData.data) {
        return NextResponse.json(responseData.data, { status: statusCode });
      }
      return NextResponse.json(responseData, { status: statusCode });
    }
    
    return NextResponse.json({ error: 'No response from handler' }, { status: 500 });
    
  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
