import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 16 requirement)
    const { id } = await params;
    
    // Import the existing API handler
    const handler = await import('../../../../api/bookings/[id].js');
    
    // Create a mock request object compatible with the existing handler
    const req = {
      method: 'DELETE',
      query: { id },
      body: {}
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
      return NextResponse.json(responseData, { status: statusCode });
    }
    
    return NextResponse.json({ error: 'No response from handler' }, { status: 500 });
    
  } catch (error) {
    console.error('Error in bookings DELETE API:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 16 requirement)
    const { id } = await params;
    
    const handler = await import('../../../../api/bookings/[id].js');
    
    const req = {
      method: 'GET',
      query: { id },
      body: {}
    };
    
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
    
    await handler.default(req, res);
    
    if (responseData) {
      return NextResponse.json(responseData, { status: statusCode });
    }
    
    return NextResponse.json({ error: 'No response from handler' }, { status: 500 });
    
  } catch (error) {
    console.error('Error in booking GET API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 16 requirement)
    const { id } = await params;
    
    const handler = await import('../../../../api/bookings/[id].js');
    const body = await request.json();
    
    const req = {
      method: 'PUT',
      query: { id },
      body: body
    };
    
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
    
    await handler.default(req, res);
    
    if (responseData) {
      return NextResponse.json(responseData, { status: statusCode });
    }
    
    return NextResponse.json({ error: 'No response from handler' }, { status: 500 });
    
  } catch (error) {
    console.error('Error in booking PUT API:', error);
    return NextResponse.json(
      { error: 'Failed to update booking', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
