# Database Environment Variables Setup

## Instructions

1. Create a file named `.env.local` in the root of your project
2. Copy the template below into that file
3. Fill in your AWS RDS PostgreSQL credentials
4. Restart your dev server (`pnpm dev`)

## Template for `.env.local`

```bash
# ============================================
# DATABASE CONFIGURATION (AWS RDS PostgreSQL)
# ============================================

# PostgreSQL Host (your RDS endpoint)
# Example: your-db-instance.123456789.us-east-1.rds.amazonaws.com
PGHOST=your-rds-endpoint-here

# PostgreSQL Database Name
# Example: eyp_production
PGDATABASE=your-database-name-here

# PostgreSQL User
# Example: postgres or your custom username
PGUSER=your-database-username-here

# PostgreSQL Password
# Your database password (keep this secure!)
PGPASSWORD=your-database-password-here

# PostgreSQL Port (default is 5432)
PGPORT=5432

# AWS Region (default is us-east-1)
AWS_REGION=us-east-1

# AWS Role ARN (OPTIONAL - only if using IAM authentication)
# Example: arn:aws:iam::123456789012:role/YourRoleName
# Leave empty if not using IAM authentication
AWS_ROLE_ARN=

# ============================================
# RESEND (DJ blackout date email notifications)
# ============================================
# Get API key from https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxx
# From address (use onboarding@resend.dev for testing; use verified domain for production)
RESEND_FROM_EMAIL=onboarding@resend.dev
# Email to receive blackout date notifications (optional; defaults to lee@... in code)
ADMIN_NOTIFICATION_EMAIL=lee@externallyyoursproductions.com

# ============================================
# OTHER ENVIRONMENT VARIABLES
# ============================================

# Next.js Environment
NODE_ENV=development

# Application URL (for CORS and redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## How to Get Your AWS RDS Credentials

1. **PGHOST**: Go to AWS RDS Console → Your Database → Connectivity & security → Endpoint
2. **PGDATABASE**: The database name you created (default is often `postgres`)
3. **PGUSER**: The master username you set when creating the RDS instance
4. **PGPASSWORD**: The master password you set when creating the RDS instance
5. **PGPORT**: Usually `5432` for PostgreSQL
6. **AWS_REGION**: The AWS region where your RDS is hosted (e.g., `us-east-1`, `us-west-2`)

## After Setup

Once you've created `.env.local` with your credentials:

1. Stop your dev server (Ctrl+C)
2. Restart it: `pnpm dev`
3. Try the CSV import again - it should work!

## Security Notes

- ⚠️ **NEVER commit `.env.local` to git** (it's already in `.gitignore`)
- ⚠️ Keep your database password secure
- ⚠️ Don't share your `.env.local` file with anyone

## Testing the Connection

You can test if your database connection works by running:

```bash
node api/test-db.js
```

This will verify your credentials are correct before trying the CSV import.
