import { NextRequest, NextResponse } from 'next/server';

// Note: This is a simplified version that returns a direct upload URL
// For production S3 uploads, you would use AWS SDK to generate presigned URLs
// Install: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, project_id } = body;
    
    if (!filename) {
      return NextResponse.json({ 
        success: false, 
        error: 'Filename is required' 
      }, { status: 400 });
    }
    
    // For development: Use local public folder
    // For production: Generate AWS S3 presigned URL
    
    const timestamp = Date.now();
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `photography/${project_id}/${timestamp}-${safeFilename}`;
    
    // Development mode: Use public folder
    if (process.env.NODE_ENV === 'development' || !process.env.AWS_S3_BUCKET) {
      const publicURL = `/uploads/${key}`;
      
      return NextResponse.json({ 
        success: true,
        uploadURL: publicURL, // In development, frontend will handle file upload differently
        photoURL: publicURL,
        useDirect: true // Signal to frontend to use FormData upload
      }, { status: 200 });
    }
    
    // Production mode: AWS S3 (uncomment when AWS credentials are set up)
    /*
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
    
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    });
    
    const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const photoURL = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    
    return NextResponse.json({ 
      success: true,
      uploadURL,
      photoURL,
      useDirect: false
    }, { status: 200 });
    */
    
    // Fallback response
    return NextResponse.json({ 
      success: false,
      error: 'S3 upload not configured. Set AWS environment variables.' 
    }, { status: 500 });
    
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate upload URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Alternative endpoint for direct file upload (development/local storage)
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const project_id = formData.get('project_id') as string;
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 });
    }
    
    // In production, you would save this to S3
    // For now, we'll return a mock URL
    const timestamp = Date.now();
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const photoURL = `/uploads/photography/${project_id}/${timestamp}-${safeFilename}`;
    
    return NextResponse.json({ 
      success: true,
      photoURL
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
