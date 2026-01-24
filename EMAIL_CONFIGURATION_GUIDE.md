# Email Configuration Guide for Vercel

## Overview
The fallback contact form requires email environment variables to be set in Vercel. Follow these steps to configure Gmail SMTP for the contact form.

## Step 1: Generate Gmail App Password

Before adding environment variables, you need to create a Gmail App Password:

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (you must enable this first if not already enabled)
3. Scroll down and click **App passwords** (or go directly to https://myaccount.google.com/apppasswords)
4. Click **Select app** and choose "Mail" or create a custom app named "EYP Contact Form"
5. Click **Generate**
6. Copy the 16-character password (remove any spaces)
7. **Save this password securely** - you'll need it in Step 2

## Step 2: Add Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your **EYP project**
3. Click **Settings** in the top navigation
4. Click **Environment Variables** in the left sidebar
5. Add the following three variables (one at a time):

### Variable 1: GMAIL_USER
- **Name**: `GMAIL_USER`
- **Value**: Your Gmail address (e.g., `lee@externallyyoursproductions.com`)
- **Environment**: Select **Production** (and optionally Preview & Development)
- Click **Save**

### Variable 2: GMAIL_APP_PASSWORD
- **Name**: `GMAIL_APP_PASSWORD`
- **Value**: The 16-character app password from Step 1 (no spaces)
- **Environment**: Select **Production** (and optionally Preview & Development)
- Click **Save**

### Variable 3: EMAIL_FROM
- **Name**: `EMAIL_FROM`
- **Value**: Same as GMAIL_USER (e.g., `lee@externallyyoursproductions.com`)
- **Environment**: Select **Production** (and optionally Preview & Development)
- Click **Save**

## Step 3: Redeploy Your Application

After adding all environment variables, you must redeploy for changes to take effect:

1. Go to the **Deployments** tab in your Vercel dashboard
2. Find the latest deployment
3. Click the **three dots (•••)** on the right side
4. Click **Redeploy**
5. Click **Redeploy** again to confirm

## Step 4: Test the Contact Form

After redeployment completes:

1. Visit your website
2. Navigate to the Contact section
3. Wait for either HoneyBook to load or the fallback form to appear (after 10 seconds)
4. Fill out and submit the fallback form
5. Check the email inbox for `lee@externallyyoursproductions.com` to confirm receipt

## Troubleshooting

### If emails are not sending:

1. **Check Vercel Logs**:
   - Go to your project in Vercel
   - Click **Deployments**
   - Click on the latest deployment
   - Click **View Function Logs**
   - Look for errors in the `/api/contact` endpoint

2. **Verify Gmail App Password**:
   - Make sure 2-Step Verification is enabled on your Google account
   - Regenerate the app password if needed
   - Ensure there are no spaces in the password when adding to Vercel

3. **Check Environment Variables**:
   - Go to Settings → Environment Variables
   - Verify all three variables are set correctly
   - Make sure they're applied to the Production environment

4. **Common Issues**:
   - App password expired or revoked → Generate a new one
   - 2-Step Verification disabled → Re-enable it
   - Wrong Gmail address → Double-check the email address
   - Variables not applied → Make sure you redeployed after adding variables

## Security Notes

- **Never commit** Gmail passwords or app passwords to your Git repository
- Keep app passwords secure and only store them in Vercel environment variables
- Rotate app passwords periodically for better security
- Only grant app password access to trusted applications

## Additional Resources

- [Gmail App Passwords Help](https://support.google.com/accounts/answer/185833)
- [Vercel Environment Variables Documentation](https://vercel.com/docs/projects/environment-variables)
- [Contact API Implementation](./app/api/contact/route.ts)
