# Fix CSV Import API Routes

## Problem

The CSV import is failing because it's trying to call:
- `GET /api/users` - Returns HTML instead of JSON
- `GET /api/bookings` - Returns HTML instead of JSON  
- `POST /api/bookings` - Returns HTML instead of JSON
- `DELETE /api/bookings/{id}` - Returns HTML instead of JSON

The issue: Next.js 16 with App Router requires `route.ts` files in `app/api/` directories, but these are empty. The old serverless functions exist in `/api/` but aren't being served properly.

## Solution

Create Next.js App Router API route handlers that proxy to or reimple the existing `/api` logic.

## Files to Create

### 1. `app/api/users/route.ts` - GET all users

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Import and use the existing API logic from /api/users/index.js
    const handler = await import('../../../api/users/index.js');
    
    // Create mock request/response for compatibility
    const req = { method: 'GET', query: {} };
    const res = {
      status: (code: number) => ({
        json: (data: any) => NextResponse.json(data, { status: code })
      })
    };
    
    return await handler.default(req, res);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
```

### 2. `app/api/bookings/route.ts` - GET all bookings, POST new booking

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const handler = await import('../../../api/bookings/index.js');
    const req = { method: 'GET', query: {} };
    const res = {
      status: (code: number) => ({
        json: (data: any) => NextResponse.json(data, { status: code })
      })
    };
    return await handler.default(req, res);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const handler = await import('../../../api/bookings/index.js');
    const req = { method: 'POST', body, query: {} };
    const res = {
      status: (code: number) => ({
        json: (data: any) => NextResponse.json(data, { status: code })
      })
    };
    return await handler.default(req, res);
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
```

### 3. `app/api/bookings/[id]/route.ts` - DELETE booking by ID

```typescript
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const handler = await import('../../../../api/bookings/[id].js');
    const req = { method: 'DELETE', query: { id: params.id } };
    const res = {
      status: (code: number) => ({
        json: (data: any) => NextResponse.json(data, { status: code })
      })
    };
    return await handler.default(req, res);
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
```

## Implementation Steps

1. Create `app/api/users/route.ts` for GET users
2. Create `app/api/bookings/route.ts` for GET/POST bookings
3. Create `app/api/bookings/[id]/route.ts` for DELETE booking
4. Test each endpoint with curl
5. Test CSV import functionality

## Additional Fix: Rate Limiting API Calls

The current CSV import makes too many simultaneous API calls, causing Next.js cache warnings:
```
Persisting failed: Another write batch or compaction is already active
```

**Update `app/hooks/useCSVImport.ts`** to batch API calls with delays:

```typescript
// Add delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In the import function, batch deletes:
for (let i = 0; i < existingBookings.length; i++) {
  if (booking.id) {
    await deleteBooking(booking.id);
    // Add small delay every 5 deletions
    if ((i + 1) % 5 === 0) {
      await delay(100); // 100ms delay
    }
  }
}

// Batch creates:
for (let i = 0; i < newBookings.length; i++) {
  try {
    await createBooking(newBookings[i]);
    successCount++;
    
    // Add small delay every 5 creates
    if ((i + 1) % 5 === 0) {
      await delay(100); // 100ms delay
    }
    
    // Update progress
    if ((i + 1) % 10 === 0 || i === newBookings.length - 1) {
      updateStatus(...);
    }
  } catch (error) {
    console.error(`Failed to create booking ${i + 1}:`, error);
  }
}
```

## Expected Result

- ✅ `/api/users` returns JSON array of users
- ✅ `/api/bookings` returns JSON array of bookings
- ✅ POST `/api/bookings` creates new booking
- ✅ DELETE `/api/bookings/{id}` deletes booking
- ✅ CSV import works without errors
- ✅ No Next.js cache warnings
- ✅ Smooth import with progress updates