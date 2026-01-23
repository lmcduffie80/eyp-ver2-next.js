# Photography Portfolio Manager - Setup Guide

## Overview
Your photography portfolio management system is now fully implemented! This system allows you to:
- Create and manage photography projects
- Upload multiple photos to each project
- Automatically display projects on the public photography page
- Organize photos by project with descriptions

## Step 1: Database Setup

### Run the SQL Schema
You need to create the photography tables in your PostgreSQL database:

```bash
# Option 1: Using psql command line
psql $POSTGRES_URL -f api/db/photography-schema.sql

# Option 2: Copy the SQL from api/db/photography-schema.sql and run it in your Neon Console
```

The schema creates two tables:
- `photography_projects` - Stores project information
- `photography_photos` - Stores individual photos with references to projects

### Verify Tables Were Created
```sql
-- Check if tables exist
SELECT * FROM photography_projects;
SELECT * FROM photography_photos;
```

## Step 2: Access the Photography Manager

1. Navigate to the Admin Dashboard: `http://localhost:3000/admin`
2. Click on the **📸 Photography** tab in the sidebar
3. You should see the Photography Portfolio Manager interface

## Step 3: Create Your First Project

1. Click **+ New Project** button
2. Enter a project name (e.g., "Smith Wedding 2025", "Johnson Family Photos")
3. Add an optional description
4. Click **Create Project**

## Step 4: Upload Photos

1. Select a project from the left panel
2. The right panel will show the upload area
3. Click the upload area or drag and drop photos
4. Multiple files can be uploaded at once
5. Wait for the upload progress bar to complete
6. Photos will appear in the grid below

## Step 5: View on Public Page

1. Navigate to `http://localhost:3000/photography`
2. Your new projects will appear in the "Recent Projects" section
3. Click on a project to view all photos in the lightbox
4. Each project has its own dedicated section below

## Features

### Admin Dashboard Features:
- ✅ Create/delete projects
- ✅ Batch upload multiple photos
- ✅ View photo count per project
- ✅ Delete individual photos
- ✅ Automatic cover photo selection (first uploaded photo)
- ✅ Upload progress indicator
- ✅ Responsive design

### Public Page Features:
- ✅ Project sections with titles and descriptions
- ✅ Responsive photo grid
- ✅ Lightbox for full-size viewing
- ✅ Optimized image loading
- ✅ Mobile-friendly layout
- ✅ Integration with existing galleries

## File Storage

### Development Mode (Current Setup)
The system is currently configured for development mode, which stores photos as data URLs in the database. This works great for testing but has limitations:
- **Pros**: No external setup required, works immediately
- **Cons**: Database can get large, slower performance with many photos

### Production Mode (AWS S3)
For production, you'll want to configure AWS S3:

1. **Install AWS SDK**:
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

2. **Add Environment Variables** (in `.env.local`):
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your-bucket-name
```

3. **Uncomment S3 Code** in `app/api/photography/upload/route.ts`:
   - The production S3 code is already written but commented out
   - Simply uncomment the S3 section and comment out the development section

4. **Configure S3 Bucket**:
   - Create an S3 bucket in AWS
   - Set appropriate CORS policies
   - Make bucket public for photo access
   - Update the environment variables

## API Endpoints

All photography endpoints are RESTful:

### Projects
- `GET /api/photography/projects` - List all projects
- `POST /api/photography/projects` - Create new project
- `PUT /api/photography/projects` - Update project
- `DELETE /api/photography/projects?id={id}` - Delete project

### Photos
- `GET /api/photography/photos?project_id={id}` - Get photos for project
- `POST /api/photography/photos` - Add photo to project
- `PUT /api/photography/photos` - Update photo metadata
- `DELETE /api/photography/photos?id={id}` - Delete photo

### Upload
- `POST /api/photography/upload` - Get upload URL (development/S3)

## Troubleshooting

### Photos Not Appearing on Public Page
1. Check that the project has photos uploaded
2. Verify the API is returning data: `http://localhost:3000/api/photography/projects`
3. Check browser console for errors

### Upload Not Working
1. Verify the project is selected in the admin panel
2. Check file size (recommended max 10MB per file)
3. Check browser console for errors
4. Ensure the API route is accessible

### Database Connection Issues
1. Verify `POSTGRES_URL` is set in `.env.local`
2. Test connection: `psql $POSTGRES_URL -c "SELECT 1"`
3. Ensure the schema has been run

## File Structure

```
api/db/
└── photography-schema.sql        # Database schema

app/api/photography/
├── projects/route.ts             # Projects API
├── photos/route.ts               # Photos API
└── upload/route.ts               # Upload handling

app/admin/
└── page.tsx                      # Admin dashboard with Photography tab

app/photography/
└── page.tsx                      # Public photography page

app/globals.css                   # Photography styles included
```

## Next Steps

### Recommended Enhancements:
1. **Image Optimization**: Add image compression before upload
2. **Thumbnails**: Generate thumbnail versions for faster loading
3. **Reordering**: Add drag-and-drop to reorder photos
4. **Captions**: Add UI to edit photo captions
5. **Featured Projects**: Mark projects as featured for homepage
6. **Search**: Add search/filter to find projects quickly
7. **Analytics**: Track which projects get the most views

### Production Checklist:
- [ ] Set up AWS S3 bucket
- [ ] Configure environment variables
- [ ] Switch to S3 upload mode
- [ ] Test upload flow
- [ ] Optimize image sizes
- [ ] Set up CDN (optional)
- [ ] Add image compression
- [ ] Test on mobile devices

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the terminal/server logs
3. Verify database connection
4. Ensure all environment variables are set

## Summary

Your photography portfolio system is complete and ready to use! The system:
- ✅ Full CRUD operations for projects and photos
- ✅ Modern, responsive UI
- ✅ Automatic integration with public page
- ✅ Ready for development testing
- ✅ Production-ready architecture (with S3 setup)

Start by creating your first project and uploading some photos to see it in action!
