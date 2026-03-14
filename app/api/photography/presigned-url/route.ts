import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check for admin authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('admin_user_id')?.value;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Admin access required'
      }, { status: 401 });
    }

    const { filename, fileType, projectId, isThumb } = await request.json();

    if (!filename || !fileType || !projectId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Check AWS credentials
    if (!process.env.AWS_S3_BUCKET || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json({ 
        success: false,
        error: 'S3 not configured. Please set AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY' 
      }, { status: 500 });
    }

    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    const timestamp = Date.now();
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^.]+$/, '.webp');
    const folder = isThumb ? `photography/${projectId}/thumbs` : `photography/${projectId}`;
    const key = `${folder}/${timestamp}-${safeFilename}`;

    // Generate presigned URL for PUT operation (expires in 5 minutes)
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: fileType,
      CacheControl: 'public, max-age=31536000, immutable'
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 300 // 5 minutes
    });

    const region = process.env.AWS_REGION || 'us-east-1';
    const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${region}.amazonaws.com/${key}`;

    return NextResponse.json({ 
      success: true,
      presignedUrl,
      publicUrl,
      key
    });

  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
