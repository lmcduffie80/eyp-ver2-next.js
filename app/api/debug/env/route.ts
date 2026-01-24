import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasAWSRegion: !!process.env.AWS_REGION,
    hasAWSAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
    hasAWSSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
    hasAWSBucket: !!process.env.AWS_S3_BUCKET,
    awsRegion: process.env.AWS_REGION || 'NOT SET',
    awsBucket: process.env.AWS_S3_BUCKET || 'NOT SET',
    // Don't expose actual credentials
    nodeEnv: process.env.NODE_ENV
  });
}
