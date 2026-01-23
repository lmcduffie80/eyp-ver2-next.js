# 🚀 Complete Neon PostgreSQL Setup Guide

Follow these steps in order. Each step is quick and straightforward!

---

## ✅ Prerequisites Completed
- [x] macOS Full Disk Access granted to Cursor
- [x] Neon PostgreSQL account created

---

## 📝 Step 1: Get Neon Connection String (2 minutes)

### 1.1 Access Neon Console
1. Open browser: **https://console.neon.tech**
2. Log in to your account
3. You should see your project

### 1.2 Copy Connection String
1. Click on your project name
2. Look for **"Connection Details"** or **"Connect"** section
3. You'll see a dropdown - select **"Pooled connection"** (recommended)
4. Click the **Copy** button next to the connection string

**What it looks like:**
```
postgres://user:pass@ep-something-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

✅ **Connection string copied?** Proceed to Step 2!

---

## 📝 Step 2: Update .env.local (1 minute)

### 2.1 Open .env.local in Cursor
1. In Cursor file explorer, find: `.env.local` (project root)
2. Double-click to open it

### 2.2 Replace Placeholder
Find this line:
```bash
POSTGRES_URL=PLACEHOLDER_REPLACE_WITH_ACTUAL_POSTGRES_URL_FROM_VERCEL_DASHBOARD
```

Replace the ENTIRE line with:
```bash
POSTGRES_URL=paste-your-neon-connection-string-here
```

**Paste your actual Neon connection string after the `=` sign**

### 2.3 Save
- Press **Cmd+S** (Mac) or **Ctrl+S** (Windows)
- The file should now have your real Neon connection string

**Example final result:**
```bash
# Vercel Postgres Connection (for local development)
POSTGRES_URL=postgres://myuser:mypass@ep-cool-123.us-east-2.aws.neon.tech/neondb?sslmode=require

# Next.js Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

✅ **.env.local updated and saved?** Proceed to Step 3!

---

## 📝 Step 3: Initialize Database Schema (2 minutes)

Your Neon database is empty. We need to create the tables.

### 3.1 Open Neon SQL Editor
1. In Neon Console: https://console.neon.tech
2. Click on your project
3. Click **"SQL Editor"** tab (or "Query" tab)

### 3.2 Copy Schema SQL
1. In Cursor, open file: `api/db/schema.sql`
2. Select ALL content (Cmd+A or Ctrl+A)
3. Copy it (Cmd+C or Ctrl+C)

### 3.3 Run Schema in Neon
1. Back in Neon SQL Editor
2. Paste the SQL (Cmd+V or Ctrl+V)
3. Click **"Run"** or **"Execute"** button
4. Wait a few seconds

**You should see:**
- ✅ Success messages for each table created
- ✅ "CREATE TABLE", "CREATE INDEX" messages

**Tables created:**
- users
- bookings
- reviews
- blocked_dates
- analytics_visits
- chatbot_messages

✅ **Schema executed successfully?** Proceed to Step 4!

---

## 📝 Step 4: Start Dev Server (1 minute)

### 4.1 Open Terminal in Cursor
- Click **Terminal** → **New Terminal** (or press Ctrl+`)

### 4.2 Stop Any Existing Server
If you have a dev server running:
- Press **Ctrl+C** to stop it

### 4.3 Start Dev Server
Run this command:
```bash
cd /Users/donaldmcduffie/Documents/GitHub/eyp-ver2-next.js./eyp-ver2-next.js && pnpm dev --hostname localhost
```

### 4.4 Wait for Server to Start
You should see (after 10-15 seconds):
```
▲ Next.js 16.1.3 (Turbopack)
- Local:        http://localhost:3000
- Network:      http://localhost:3000

✓ Starting...
✓ Ready in 2.5s
```

**✅ Good signs:**
- No EPERM errors (thanks to Full Disk Access!)
- Server says "Ready"

**❌ If you see errors:**
- Make sure you saved `.env.local` with the real Neon connection string
- Make sure you quit Cursor completely after granting Full Disk Access

✅ **Server running without EPERM errors?** Proceed to Step 5!

---

## 📝 Step 5: Test CSV Import (2 minutes)

### 5.1 Open Admin Dashboard
1. Open browser
2. Go to: **http://localhost:3000/admin**
3. The dashboard should load

### 5.2 Import Test CSV
1. Click the **"Import CSV"** button
2. File picker should appear immediately
3. Navigate to project root
4. Select file: **`test-import.csv`**
5. Import happens automatically

### 5.3 Verify Success
**In the browser:**
- ✅ Should see: "Successfully imported X bookings"
- ✅ No error messages

**In the terminal:**
- ✅ Should see: INSERT/UPDATE query messages
- ✅ NO "OIDC token missing" errors
- ✅ NO 500 errors

✅ **CSV imported successfully?** Proceed to Step 6!

---

## 📝 Step 6: Verify Dashboard Data (1 minute)

### 6.1 Check Bookings Appear
1. In admin dashboard, check the **"Bookings"** tab
2. You should see the imported bookings listed
3. Check **"Total Projects"** count increased

### 6.2 Check Other Tabs
1. Click through **"DJs"**, **"Bookings"**, **"Analytics"** tabs
2. All should load without errors
3. Data should persist if you refresh the page

### 6.3 Verify in Neon
1. Go back to Neon Console
2. Open SQL Editor
3. Run: `SELECT * FROM bookings LIMIT 10;`
4. You should see your imported bookings!

✅ **All data showing correctly?** You're done!

---

## 🎉 Success! Everything Should Now Work

### ✅ What's Working Now
- Dev server starts without permission errors
- Database connection via Neon PostgreSQL
- CSV import works on one click
- Data persists in the database
- Admin dashboard displays real data
- No more OIDC token errors
- No more 500 errors

### 🎯 Next Steps
- Try importing more bookings
- Add new DJs through the dashboard
- Everything will now be stored in your Neon database
- Data survives server restarts
- Ready for production deployment

---

## 🆘 Troubleshooting

### "Cannot connect to database"
- Verify `.env.local` has the correct Neon connection string
- Make sure there are no line breaks in the connection string
- Check the string ends with `?sslmode=require`

### "relation does not exist" error
- You need to run the database schema (Step 3)
- Go back to Neon SQL Editor and run the schema

### "EPERM: operation not permitted"
- Quit Cursor completely (Cmd+Q)
- Wait 5 seconds
- Reopen Cursor
- Verify Full Disk Access is enabled in System Settings

### "Still seeing OIDC token errors"
- Check `.env.local` has the Neon string, not the placeholder
- Make sure you saved the file
- Restart the dev server

### "Connection timeout on first request"
- Neon databases auto-pause when idle (free tier)
- First connection takes 5-10 seconds to wake up
- This is normal - subsequent requests are fast

---

## 📊 Progress Checklist

Use this to track your progress:

- [ ] Step 1: Got Neon connection string
- [ ] Step 2: Updated .env.local with connection string
- [ ] Step 3: Ran database schema in Neon SQL Editor
- [ ] Step 4: Dev server started successfully
- [ ] Step 5: CSV import worked
- [ ] Step 6: Data appears in dashboard

---

## ✉️ Ready to Continue?

Once you've completed all 6 steps above and everything is working, **let me know** and I can:
- Help with any errors you encountered
- Verify everything is configured correctly
- Assist with next steps for your application

**Or if you hit a blocker at any step, let me know which step and what error you're seeing!**
