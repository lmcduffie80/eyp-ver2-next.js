import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const project_id = formData.get('project_id') as string;
    
    if (!file || !project_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'File and project_id are required' 
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
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `photography/${project_id}/${timestamp}-${safeFilename}`;
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Initialize S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    
    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });
    
    await s3Client.send(command);
    
    // Construct public URL
    const region = process.env.AWS_REGION || 'us-east-1';
    const photoURL = `https://${process.env.AWS_S3_BUCKET}.s3.${region}.amazonaws.com/${key}`;
    
    return NextResponse.json({ 
      success: true,
      photoURL,
      key
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
