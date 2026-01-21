import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Get content type from filename extension
function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  const types: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'heic': 'image/heic',
    'heif': 'image/heif'
  };
  return types[ext || ''] || 'image/jpeg';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, project_id, contentType } = body;
    
    if (!filename) {
      return NextResponse.json({ 
        success: false, 
        error: 'Filename is required' 
      }, { status: 400 });
    }
    
    // Check if AWS S3 is configured
    if (!process.env.AWS_S3_BUCKET || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json({ 
        success: false,
        error: 'S3 not configured. Please set AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in .env.local' 
      }, { status: 500 });
    }
    
    const timestamp = Date.now();
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `photography/${project_id}/${timestamp}-${safeFilename}`;
    
    // Determine correct content type
    const fileContentType = contentType || getContentType(filename);
    
    // Initialize S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    
    // Create presigned URL for upload (no compression, original quality)
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: fileContentType,
      // CacheControl: 'max-age=31536000', // Optional: Cache for 1 year
    });
    
    // Generate presigned URL (valid for 1 hour)
    const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    // Construct the public URL for the uploaded file
    const region = process.env.AWS_REGION || 'us-east-1';
    const photoURL = `https://${process.env.AWS_S3_BUCKET}.s3.${region}.amazonaws.com/${key}`;
    
    return NextResponse.json({ 
      success: true,
      uploadURL,
      photoURL,
      key,
      contentType: fileContentType
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error generating S3 upload URL:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate upload URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

