import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
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

    // Process full-size image (max 2400px width, 90% quality)
    const fullImage = await sharp(buffer)
      .resize(2400, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 90 })
      .toBuffer();

    // Generate thumbnail (400px width, 85% quality)
    const thumbnail = await sharp(buffer)
      .resize(400, 400, { 
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
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
