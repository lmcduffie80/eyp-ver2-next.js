import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const fullImageBase64 = formData.get('fullImage') as string;
    const thumbnailBase64 = formData.get('thumbnail') as string;
    const project_id = formData.get('project_id') as string;
    const filename = formData.get('filename') as string;
    
    if (!fullImageBase64 || !thumbnailBase64 || !project_id || !filename) {
      return NextResponse.json({ 
        success: false, 
        error: 'Full image, thumbnail, project_id, and filename are required' 
      }, { status: 400 });
    }
    
    // Check AWS credentials
    if (!process.env.AWS_S3_BUCKET || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json({ 
        success: false,
        error: 'S3 not configured. Please set AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in .env.local' 
      }, { status: 500 });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^.]+$/, '.webp');
    
    // Convert base64 to buffers
    const fullImageBuffer = Buffer.from(fullImageBase64, 'base64');
    const thumbnailBuffer = Buffer.from(thumbnailBase64, 'base64');
    
    // Initialize S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    
    const region = process.env.AWS_REGION || 'us-east-1';
    const bucket = process.env.AWS_S3_BUCKET;
    
    // Upload full-size image
    const fullKey = `photography/${project_id}/${timestamp}-${safeFilename}`;
    await s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: fullKey,
      Body: fullImageBuffer,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable'
    }));
    
    // Upload thumbnail
    const thumbKey = `photography/${project_id}/thumbs/${timestamp}-${safeFilename}`;
    await s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: thumbKey,
      Body: thumbnailBuffer,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable'
    }));
    
    // Construct public URLs
    const photoURL = `https://${bucket}.s3.${region}.amazonaws.com/${fullKey}`;
    const thumbnailURL = `https://${bucket}.s3.${region}.amazonaws.com/${thumbKey}`;
    
    return NextResponse.json({ 
      success: true,
      photoURL,
      thumbnailURL,
      fullKey,
      thumbKey
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error uploading to S3:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false, 
      error: `S3 upload failed: ${errorMessage}`,
      details: error instanceof Error ? error.stack : 'Unknown error'
    }, { status: 500 });
  }
}
