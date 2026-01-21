# AWS S3 Setup Guide for Photography Portfolio

## Overview
This guide will help you set up AWS S3 to store your photography images with maximum quality preservation.

## Prerequisites
- AWS Account (create one at https://aws.amazon.com if you don't have one)
- Credit card for AWS (they offer a generous free tier)

## Step 1: Create an S3 Bucket

1. **Go to AWS Console**
   - Visit https://console.aws.amazon.com
   - Sign in with your AWS account

2. **Navigate to S3**
   - Search for "S3" in the AWS services search bar
   - Click on "S3" to open the S3 console

3. **Create New Bucket**
   - Click the **"Create bucket"** button
   - Enter a bucket name (e.g., `your-company-photography`)
     - Must be globally unique
     - Use lowercase letters, numbers, and hyphens only
   - Choose a region closest to your users (e.g., `us-east-1` for US East Coast)

4. **Configure Bucket Settings**
   - **Object Ownership**: Keep default "ACLs disabled"
   - **Block Public Access**: 
     - **UNCHECK** "Block all public access"
     - Check the acknowledgment box
     - ⚠️ This is necessary for public image URLs
   - **Bucket Versioning**: Optional (recommended for backup)
   - **Encryption**: Optional (SSE-S3 is fine)
   - Click **"Create bucket"**

## Step 2: Configure CORS

1. **Open Your Bucket**
   - Click on your newly created bucket name

2. **Go to Permissions Tab**
   - Click on the "Permissions" tab

3. **Scroll to Cross-origin resource sharing (CORS)**
   - Click **"Edit"**

4. **Add CORS Configuration**
   - Paste this JSON:

```json
[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "HEAD"
    ],
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://yourdomain.com"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

   - Replace `https://externallyyoursproductions.com with your actual domain
   - Click **"Save changes"**

## Step 3: Create IAM User with S3 Access

1. **Navigate to IAM**
   - Search for "IAM" in AWS services
   - Click "Identity and Access Management (IAM)"

2. **Create New User**
   - Click "Users" in the left sidebar
   - Click **"Create user"**
   - Enter username: `photography-uploader`
   - Click **"Next"**

3. **Set Permissions**
   - Select **"Attach policies directly"**
   - Search for and select: **`AmazonS3FullAccess`**
     - (For production, you should create a custom policy with limited permissions to just your bucket)
   - Click **"Next"**
   - Click **"Create user"**

4. **Create Access Keys**
   - Click on the newly created user
   - Click the **"Security credentials"** tab
   - Scroll to "Access keys"
   - Click **"Create access key"**
   - Select **"Application running outside AWS"**
   - Click **"Next"**
   - Add description tag (optional): "Photography upload access"
   - Click **"Create access key"**
   - **⚠️ IMPORTANT**: Copy both:
     - Access key ID
     - Secret access key
     - ⚠️ Save these somewhere safe! You won't be able to see the secret key again.

## Step 4: Add Credentials to Your Project

1. **Open `.env.local` in your project**

2. **Add AWS credentials**:

```env
# AWS S3 Configuration for Photography
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID_HERE
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY_HERE
AWS_S3_BUCKET=your-bucket-name
```

3. **Replace the values**:
   - `AWS_REGION`: The region where you created your bucket (e.g., `us-east-1`)
   - `AWS_ACCESS_KEY_ID`: Paste the access key ID from Step 3
   - `AWS_SECRET_ACCESS_KEY`: Paste the secret access key from Step 3
   - `AWS_S3_BUCKET`: Your bucket name from Step 1

4. **Save the file**

## Step 5: Set Bucket Policy (Optional but Recommended)

For public read access to images:

1. **Go back to your S3 bucket**
2. **Click "Permissions" tab**
3. **Scroll to "Bucket policy"**
4. **Click "Edit"**
5. **Add this policy** (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

6. **Click "Save changes"**

## Step 6: Test the Setup

1. **Restart your dev server**:
   ```bash
   pkill -f "next dev"
   pnpm dev
   ```

2. **Go to Admin Dashboard**:
   - Visit http://localhost:3000/admin
   - Click the 📸 Photography tab

3. **Create a test project** and **upload a photo**

4. **Check S3**:
   - Go back to AWS S3 Console
   - Click on your bucket
   - You should see a `photography/` folder with your uploaded image

5. **Verify Quality**:
   - Visit http://localhost:3000/photography
   - Your photo should display with original quality
   - Right-click → "Open image in new tab" to see the full S3 URL

## Troubleshooting

### "Access Denied" Error
- Check that Block Public Access is disabled
- Verify CORS configuration includes your domain
- Confirm bucket policy allows public read

### "Invalid Credentials" Error
- Double-check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in `.env.local`
- Make sure there are no extra spaces
- Restart your dev server after changing `.env.local`

### Photos Not Uploading
- Check browser console for errors
- Verify IAM user has S3 permissions
- Make sure bucket name in `.env.local` matches exactly

### Photos Display Broken
- Check that bucket policy allows public read
- Verify the S3 URL is correct (should be: `https://YOUR-BUCKET.s3.REGION.amazonaws.com/...`)

## Cost Considerations

AWS S3 Pricing (as of 2024):
- **Storage**: ~$0.023 per GB/month
- **Requests**: $0.005 per 1,000 PUT requests
- **Data Transfer**: First 100 GB/month is free

**Example**: 1,000 high-quality photos (~5GB total)
- Storage: ~$0.12/month
- Upload: ~$0.005 one-time
- **Total: Very affordable!**

AWS Free Tier includes:
- 5 GB of standard storage
- 20,000 GET requests
- 2,000 PUT requests
- 100 GB data transfer out per month

## Production Recommendations

### 1. Use CloudFront CDN (Optional)
- Faster image delivery worldwide
- Reduces costs for high traffic
- Set up at https://console.aws.amazon.com/cloudfront

### 2. Enable Versioning
- Protects against accidental deletion
- Allows recovery of previous versions

### 3. Set Lifecycle Policies
- Automatically transition old images to cheaper storage classes
- Archive or delete old images after X days/months

### 4. Create Custom IAM Policy
Instead of `AmazonS3FullAccess`, use:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME"
    }
  ]
}
```

### 5. Enable Server Access Logging
- Track who accesses your images
- Monitor for unusual activity

## Security Best Practices

1. **Never commit `.env.local` to Git** (it's already in `.gitignore`)
2. **Rotate access keys regularly** (every 90 days)
3. **Use separate buckets** for development and production
4. **Enable MFA** for your AWS root account
5. **Set up AWS CloudTrail** for audit logging

## Next Steps

Once your S3 is set up:
1. ✅ Your photos will upload with original quality
2. ✅ Images are served fast from AWS infrastructure
3. ✅ Database stays small (only URLs stored)
4. ✅ Scalable to thousands of photos

For questions or issues, refer to:
- AWS S3 Documentation: https://docs.aws.amazon.com/s3/
- AWS Support: https://console.aws.amazon.com/support/

---

**All set! Your photography portfolio now has professional-grade image storage! 📸**
