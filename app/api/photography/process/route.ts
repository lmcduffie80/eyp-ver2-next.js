import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { cookies } from 'next/headers';

export const maxDuration = 60;

// Configure route to accept larger payloads
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max execution time
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check for admin authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('admin_session')?.value;

    if (!userId) {
      return NextResponse.json({
        error: 'Unauthorized - Admin access required'
      }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate image
    const metadata = await sharp(buffer).metadata();
    
    if (!metadata.width || !metadata.height) {
      return NextResponse.json({ error: 'Invalid image' }, { status: 400 });
    }

    // Process full-size image (max 3840px width, 95% quality, with sharpening)
    const fullImage = await sharp(buffer)
      .resize(3840, null, { 
        withoutEnlargement: true,
        fit: 'inside',
        kernel: 'lanczos3'  // Higher quality resampling
      })
      .sharpen({
        sigma: 0.5,          // Mild sharpening
        m1: 1.0,             // Sharpen threshold
        m2: 0.2              // Linear sharpening amount
      })
      .webp({ 
        quality: 95,         // Higher quality
        effort: 6,           // More compression effort (0-6, higher = better quality)
        smartSubsample: false // Better color accuracy
      })
      .toBuffer();

    // Generate thumbnail (400px width, 90% quality)
    const thumbnail = await sharp(buffer)
      .resize(400, 400, { 
        fit: 'cover',
        position: 'center',
        kernel: 'lanczos3'  // Higher quality resampling
      })
      .sharpen({
        sigma: 0.3,          // Light sharpening for thumbnails
        m1: 1.0,
        m2: 0.15
      })
      .webp({ 
        quality: 90,         // Increased quality for thumbnails
        effort: 6
      })
      .toBuffer();

    return NextResponse.json({
      success: true,
      fullImage: fullImage.toString('base64'),
      thumbnail: thumbnail.toString('base64'),
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: buffer.length
      }
    });
  } catch (error) {
    console.error('Image processing error:', error);
    return NextResponse.json({ 
      error: 'Processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
