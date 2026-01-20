# Local Database Setup - Action Required

## ⚠️ Manual Step Required

Due to macOS security restrictions, the `.env.local` file must be updated manually.

## Step 1: Get POSTGRES_URL from Vercel Dashboard

1. Open your browser and go to: https://vercel.com/dashboard
2. Click on your project: **eyp-static**
3. Click **Settings** in the top navigation
4. Click **Environment Variables** in the left sidebar
5. Look for one of these variables:
   - `POSTGRES_URL` (preferred)
   - `POSTGRES_URL_NON_POOLING` (alternative)
6. Click the **eye icon** (👁️) to reveal the value
7. Click the **copy button** or select and copy the entire connection string
   - It should start with `postgres://` or `postgresql://`
   - It will be a long string with username, password, host, and database name

## Step 2: Update .env.local File

**Option A: Using Cursor IDE**
1. In the file explorer (left sidebar), find the file: `.env.local`
   - It's in the project root (same level as `package.json`)
   - If you don't see it, enable "Show Hidden Files" in Cursor
2. Open the file
3. **Delete all the current contents**
4. Paste this new content:

```bash
# Vercel Postgres Connection (for local development)
POSTGRES_URL=postgres://your-connection-string-here

# Next.js Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Replace `postgres://your-connection-string-here` with the actual connection string you copied from Vercel
6. Save the file (Cmd+S)

**Option B: Using Terminal**
1. Open Terminal
2. Run these commands:

```bash
cd /Users/donaldmcduffie/Documents/GitHub/eyp-ver2-next.js./eyp-ver2-next.js
open -e .env.local
```

3. This will open `.env.local` in TextEdit
4. **Delete all the current contents**
5. Paste the new content (same as Option A above)
6. Replace the placeholder with your actual POSTGRES_URL
7. Save and close TextEdit

## Step 3: Verify Your .env.local File

After editing, your `.env.local` should look like this (with your actual connection string):

```bash
# Vercel Postgres Connection (for local development)
POSTGRES_URL=postgres://default:AbCd1234EfGh5678@ep-example-123456.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require

# Next.js Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:** 
- The `POSTGRES_URL` line should have NO spaces around the `=` sign
- The connection string should be all on one line
- Make sure you removed all the old AWS credentials (AWS_ACCOUNT_ID, AWS_REGION, etc.)

## Step 4: Restart Dev Server

1. Go to the terminal where `pnpm dev` is running
2. Press `Ctrl+C` to stop the server
3. Wait for it to fully stop
4. Run this command:

```bash
pnpm dev --hostname localhost
```

5. Wait 10-15 seconds for the server to start

## Step 5: Test CSV Import

1. Open your browser to: http://localhost:3000/admin
2. Click the **Import CSV** button
3. Select the test file: `test-import.csv`
4. You should see: "Successfully imported X bookings"
5. Check the terminal - you should **NOT** see any OIDC token errors

## Troubleshooting

### "Cannot find POSTGRES_URL in Vercel"

If you don't see `POSTGRES_URL` in your Vercel Environment Variables, you may need to create a database:

1. In Vercel Dashboard, go to **Storage** tab
2. Click **Create Database** → **Postgres**
3. Name it: `eyp-database`
4. Select a region (closest to you)
5. Click **Create**
6. Wait 1-2 minutes
7. Return to **Settings** → **Environment Variables** and you should now see `POSTGRES_URL`

### Still seeing OIDC errors after restart?

- Double-check that `.env.local` has `POSTGRES_URL` (not the old AWS variables)
- Make sure you saved the file after editing
- Make sure you fully restarted the dev server (Ctrl+C, then `pnpm dev --hostname localhost`)
- Check that the POSTGRES_URL value has no extra spaces or line breaks

### "relation does not exist" error?

Good news! This means the connection is working. You just need to run the database schema:
1. Go to Vercel Dashboard → **Storage** → your database
2. Click **Query** tab
3. Copy contents from `api/db/schema.sql` in your project
4. Paste and execute the SQL

---

## Once Complete

After you've updated `.env.local` and restarted the server, let me know and I'll verify everything is working correctly!
