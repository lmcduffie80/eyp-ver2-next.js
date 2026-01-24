# Email Configuration Guide for Vercel

## IMPORTANT: The contact form email is currently not working because Gmail environment variables are not configured in Vercel.

## Overview
The fallback contact form requires Gmail SMTP environment variables to be set in Vercel. Follow these steps to configure it.

## Step 1: Generate Gmail App Password

**IMPORTANT**: You must have 2-Step Verification enabled on your Google account first!

1. Go to https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", click **2-Step Verification**
   - If not enabled, follow the prompts to enable it
4. Once enabled, go back to Security page
5. Scroll down and click **App passwords** (or go directly to https://myaccount.google.com/apppasswords)
6. Under "Select app", choose **Mail** or **Other (Custom name)**
7. If choosing "Other", enter: `EYP Contact Form`
8. Click **Generate**
9. Google will display a 16-character password like: `abcd efgh ijkl mnop`
10. **COPY THIS PASSWORD** (remove spaces: `abcdefghijklmnop`)
11. **SAVE IT SECURELY** - you cannot view it again

## Step 2: Add Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Find and click on your **EYP project**
3. Click **Settings** tab at the top
4. Click **Environment Variables** in the left sidebar
5. Add these THREE variables:

### Variable 1: GMAIL_USER
- Click **Add New** button
- **Key**: `GMAIL_USER`
- **Value**: Your Gmail address (example: `lee@externallyyoursproductions.com`)
- **Environments**: Check **Production**, **Preview**, and **Development**
- Click **Save**

### Variable 2: GMAIL_APP_PASSWORD
- Click **Add New** button again
- **Key**: `GMAIL_APP_PASSWORD`
- **Value**: The 16-character password from Step 1 (NO SPACES)
- **Environments**: Check **Production**, **Preview**, and **Development**
- Click **Save**

### Variable 3: EMAIL_FROM
- Click **Add New** button again
- **Key**: `EMAIL_FROM`
- **Value**: Same as GMAIL_USER (example: `lee@externallyyoursproductions.com`)
- **Environments**: Check **Production**, **Preview**, and **Development**
- Click **Save**

## Step 3: CRITICAL - Redeploy Your Application

**Environment variables only take effect after redeployment!**

1. Go to the **Deployments** tab in Vercel
2. Find the LATEST deployment (top of the list)
3. Click the **three dots menu (•••)** on the right
4. Click **Redeploy**
5. In the popup, click **Redeploy** again to confirm
6. Wait for deployment to complete (usually 1-2 minutes)
7. Look for "Ready" status

## Step 4: Test the Contact Form

After redeployment shows "Ready":

1. Visit your live website (not localhost)
2. Navigate to any page with the Contact section
3. Wait up to 10 seconds for HoneyBook OR fallback form
4. Fill out and submit the fallback form with test data
5. Check the email inbox for `lee@externallyyoursproductions.com`
6. You should receive an email within 1-2 minutes

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
