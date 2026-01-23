# 🚨 CRITICAL: macOS Permissions Blocking Dev Server

## Current Status

Your dev server **cannot start** due to macOS security restrictions preventing Node.js from reading files.

## The Error

```
Error: EPERM: operation not permitted, open '.env.local'
Error: EPERM: operation not permitted, open 'node_modules/...'
```

This is a **macOS Full Disk Access** issue that affects:
- Reading `.env.local` (your database credentials)
- Reading `node_modules` (required dependencies)
- Overall dev server functionality

## ⚡ Required Fix (Takes 2 Minutes)

### Step 1: Grant Full Disk Access to Cursor

1. Click the **Apple menu ()** → **System Settings**
2. Click **Privacy & Security** (in the left sidebar)
3. Scroll down and click **Full Disk Access**
4. Click the **(+)** button at the bottom
5. Navigate to **Applications**
6. Select **Cursor.app**
7. Click **Open**
8. Toggle the switch next to Cursor to **ON** (blue)

### Step 2: Grant Full Disk Access to Terminal (if using Terminal)

While you're still in **Full Disk Access**:
1. Click the **(+)** button again
2. Press **Cmd+Shift+G** (to go to folder)
3. Type: `/Applications/Utilities/`
4. Select **Terminal.app**
5. Click **Open**
6. Toggle the switch to **ON**

### Step 3: Restart Cursor Completely

1. **Quit Cursor** completely (Cmd+Q, don't just close windows)
2. Wait 5 seconds
3. **Reopen Cursor**
4. Navigate back to your project

### Step 4: Update .env.local with Real POSTGRES_URL

The `.env.local` file currently has a placeholder. You MUST replace it with your actual database URL:

1. In Cursor, open `.env.local` (in project root)
2. Go to https://vercel.com/dashboard
3. Click your project (**eyp-static**)
4. Go to **Settings** → **Environment Variables**
5. Find `POSTGRES_URL` (or `POSTGRES_URL_NON_POOLING`)
6. Click the eye icon to reveal the value
7. Copy the entire connection string
8. In `.env.local`, replace this line:
   ```bash
   POSTGRES_URL=PLACEHOLDER_REPLACE_WITH_ACTUAL_POSTGRES_URL_FROM_VERCEL_DASHBOARD
   ```
   With:
   ```bash
   POSTGRES_URL=postgres://your-actual-connection-string-here
   ```
9. Save the file (Cmd+S)

### Step 5: Start Dev Server

Open a new terminal in Cursor and run:

```bash
cd /Users/donaldmcduffie/Documents/GitHub/eyp-ver2-next.js./eyp-ver2-next.js
pnpm dev --hostname localhost
```

You should see:
```
✓ Starting...
✓ Ready in Xms
```

**No more EPERM errors!**

---

## What Happens After This?

Once the dev server starts successfully:

1. ✅ `.env.local` will load with your `POSTGRES_URL`
2. ✅ Database connection will work (no more OIDC errors)
3. ✅ CSV import will successfully create bookings
4. ✅ Admin dashboard will display data from the database

---

## Alternative: If You Don't Have POSTGRES_URL in Vercel

If you go to Vercel Dashboard → Settings → Environment Variables and don't see `POSTGRES_URL`:

### Create a Vercel Postgres Database

1. Go to https://vercel.com/dashboard
2. Click your project (**eyp-static**)
3. Click **Storage** tab (left sidebar)
4. Click **Create Database**
5. Select **Postgres**
6. Name it: `eyp-database`
7. Choose a region (closest to your location for better performance)
8. Click **Create**
9. Wait 1-2 minutes for provisioning

### Run Database Schema

Once the database is created:

1. In Vercel Dashboard, go to **Storage** → **eyp-database**
2. Click **Query** tab
3. In your Cursor project, open `api/db/schema.sql`
4. Copy ALL the SQL content
5. Paste it into the Vercel Query editor
6. Click **Run** or **Execute**
7. Verify tables are created successfully

### Get POSTGRES_URL

After creating the database:

1. Go to **Settings** → **Environment Variables**
2. You should now see `POSTGRES_URL` automatically created
3. Follow **Step 4** above to copy it to your `.env.local`

---

## Verification Checklist

After completing all steps, verify:

- [ ] Full Disk Access granted to Cursor (and Terminal if used)
- [ ] Cursor completely restarted (quit and reopen)
- [ ] `.env.local` has real `POSTGRES_URL` (not placeholder)
- [ ] Dev server starts without EPERM errors
- [ ] Go to http://localhost:3000/admin
- [ ] Import `test-import.csv`
- [ ] See "Successfully imported X bookings"
- [ ] Bookings appear in dashboard
- [ ] No 500 errors in browser console

---

## Why This Happened

macOS has strict security controls that prevent apps from accessing certain files without explicit permission. This affects:

- **New installations** of Cursor or Node.js
- **macOS updates** that reset permissions
- **Security software** (antivirus, etc.) that blocks file access

---

## Still Having Issues?

### If EPERM errors continue after granting Full Disk Access:
- Restart your Mac completely
- Check for antivirus software (Norton, McAfee, Kaspersky) and temporarily disable
- Check for Little Snitch or other network/file monitors

### If dev server starts but database errors persist:
- Verify `POSTGRES_URL` in `.env.local` is correct (no extra spaces/line breaks)
- Check terminal for specific error messages
- Try the connection string from Vercel Dashboard again

### If you see "relation does not exist":
- Good news! Connection is working
- You need to run the database schema (see "Run Database Schema" above)

---

## Next Steps

Once you've completed the steps above and the dev server is running:

**Let me know**, and I can:
- Verify the database connection is working
- Test the CSV import functionality
- Check that bookings are being stored and retrieved correctly
- Help with any remaining issues

---

**This is the critical blocker preventing further progress. Once resolved, everything else will work!**
