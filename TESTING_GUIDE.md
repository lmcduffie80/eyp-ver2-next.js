# Testing Guide: Contact Form and Hydration Fixes

## Pre-Deployment Testing (Local)

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test Each Page
Visit these URLs and check the Contact section on each:
- http://localhost:3000/ (Home)
- http://localhost:3000/photography
- http://localhost:3000/videography
- http://localhost:3000/dj-entertainment
- http://localhost:3000/about
- http://localhost:3000/contact

### 3. Check Browser Console
For each page, open Developer Tools (F12 or Cmd+Option+I) and verify:
- ✅ No React hydration errors (#418, #423)
- ✅ No "Error: Hydration failed" messages
- ✅ No red error messages
- ⚠️ Yellow warnings about database connection are OK (expected in dev)

### 4. Observe Contact Form Loading
On each page, watch the Contact section:
1. **Initial State**: Should show loading indicator with spinner
2. **After ~1-10 seconds**: HoneyBook widget should load OR fallback form appears
3. **No errors**: Contact section should never break or disappear

### 5. Test HoneyBook Widget (if it loads)
- Try interacting with the HoneyBook iframe
- Verify it's clickable and functional
- Check that it doesn't cause any console errors

### 6. Test Fallback Form (if HoneyBook doesn't load)
If fallback form appears:
- Fill out all required fields
- Submit the form
- ⚠️ Email will likely fail in local dev (no env vars)
- Should show error message directing to email/phone

## Post-Deployment Testing (Production)

### Step 1: Configure Email in Vercel

**IMPORTANT**: Before testing in production, follow these steps:

1. Follow `EMAIL_CONFIGURATION_GUIDE.md` completely
2. Add all three environment variables to Vercel:
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `EMAIL_FROM`
3. Redeploy the application
4. Wait for deployment to complete

### Step 2: Test Production Site

Visit your production URL and test all pages:
- https://your-site.vercel.app/
- https://your-site.vercel.app/photography
- https://your-site.vercel.app/videography
- https://your-site.vercel.app/dj-entertainment
- https://your-site.vercel.app/about
- https://your-site.vercel.app/contact

### Step 3: Console Error Check

Open browser console (F12) and verify:
- ✅ No React errors (especially #418, #423)
- ✅ No hydration warnings
- ✅ No red error messages
- ℹ️ HoneyBook-related logs are OK

### Step 4: HoneyBook Widget Test

On each page with Contact section:

1. **Wait for widget to load** (up to 10 seconds)
2. **Verify widget appears**:
   - HoneyBook iframe should be visible
   - Form fields should be interactive
   - Can click and type in fields
3. **Try submitting** (optional):
   - Fill out a test form
   - Verify submission works through HoneyBook

### Step 5: Fallback Form Test

To test the fallback form, you need HoneyBook to fail. You can:

**Option A: Wait for timeout**
- Disable internet after page loads
- Wait 10 seconds for fallback to appear

**Option B: Block HoneyBook script**
1. Open Developer Tools → Network tab
2. Right-click on honeybook domain
3. Select "Block request domain"
4. Refresh page
5. Fallback should appear after 10 seconds

**Test the fallback form**:
1. **Verify form appears** with all fields
2. **Fill out form**:
   - Name: Test User
   - Email: your-email@example.com
   - Phone: 555-0100
   - Service: Photography
   - Message: This is a test submission
3. **Submit form**
4. **Verify success**:
   - Success message should appear
   - Form should clear or show confirmation
5. **Check email inbox**:
   - Check lee@externallyyoursproductions.com
   - Should receive email with form details
   - Verify all fields are present and correct

### Step 6: Error Boundary Test

Test that error boundary works (optional):

1. Temporarily break Contact component (dev only):
   - Add `throw new Error('test')` to Contact.tsx
   - Refresh page
   - Should see fallback UI (contact info only)
   - Rest of page should still work
2. Remove the error and redeploy

### Step 7: Cross-Browser Testing

Test on multiple browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (Mac/iOS)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

For each browser:
- Check console for errors
- Verify Contact section loads
- Test form submission (HoneyBook or fallback)

### Step 8: Mobile Testing

Test on mobile devices:
1. Visit site on actual mobile device or use DevTools device mode
2. Check Contact section on all pages
3. Verify form is usable on small screens
4. Test form submission
5. Check that loading states work properly

## Verification Checklist

### All Pages (Home, Photography, Videography, DJ Entertainment, About, Contact)

For each page, verify:

- [ ] No React hydration errors in console
- [ ] No errors #418 or #423
- [ ] Contact section appears
- [ ] Loading indicator shows initially
- [ ] Either HoneyBook loads OR fallback appears
- [ ] Contact information is visible
- [ ] No JavaScript errors
- [ ] Page layout is correct
- [ ] Smooth scrolling to contact section works
- [ ] Mobile responsive design works

### HoneyBook Widget (if loads)

- [ ] Widget appears within 10 seconds
- [ ] Iframe is visible and interactive
- [ ] Can click form fields
- [ ] Can type in form fields
- [ ] No console errors when interacting
- [ ] Widget is properly styled
- [ ] Widget is mobile responsive

### Fallback Form (if HoneyBook fails)

- [ ] Appears after 10-second timeout
- [ ] All fields are present (Name, Email, Phone, Service, Message)
- [ ] Required fields are marked
- [ ] Form validation works
- [ ] Can fill out form
- [ ] Submit button works
- [ ] Loading state shows during submission
- [ ] Success message appears
- [ ] Email is sent successfully
- [ ] Email contains all form data
- [ ] Email formatting is correct

### Error Handling

- [ ] Error boundary catches React errors
- [ ] Fallback UI shows contact info
- [ ] Page doesn't crash on errors
- [ ] Console logs errors for debugging
- [ ] User can still navigate site

### Performance

- [ ] Contact section loads quickly
- [ ] No significant delay before loading indicator
- [ ] Smooth transition to HoneyBook/fallback
- [ ] No layout shifts after hydration
- [ ] Images load efficiently

## Common Issues and Solutions

### Issue: React Hydration Errors Still Occurring

**Symptoms**: Console shows "Hydration failed" or errors #418/#423

**Solutions**:
1. Hard refresh the browser (Cmd+Shift+R / Ctrl+Shift+R)
2. Clear browser cache
3. Disable browser extensions
4. Verify ContactWrapper is imported (not Contact)
5. Check that build completed successfully

### Issue: HoneyBook Not Loading

**Symptoms**: Loading indicator doesn't disappear, no form appears

**Solutions**:
1. Wait full 10 seconds (fallback should appear)
2. Check browser console for network errors
3. Verify HoneyBook account is active
4. Check ad blockers aren't blocking HoneyBook
5. Verify internet connection

### Issue: Fallback Form Not Sending Email

**Symptoms**: Form submits but no email received

**Solutions**:
1. Check Vercel environment variables are set:
   - GMAIL_USER
   - GMAIL_APP_PASSWORD
   - EMAIL_FROM
2. Verify Gmail App Password is correct (16 characters)
3. Check Vercel function logs for errors:
   - Dashboard → Deployments → Latest → View Function Logs
4. Confirm 2-Step Verification enabled on Gmail
5. Try regenerating Gmail App Password

### Issue: Contact Section Not Appearing

**Symptoms**: Entire Contact section is missing

**Solutions**:
1. Check browser console for errors
2. Verify ContactWrapper exists
3. Check page imports ContactWrapper correctly
4. Clear Next.js cache: `rm -rf .next`
5. Rebuild: `npm run build`

### Issue: Mobile Display Problems

**Symptoms**: Contact form looks broken on mobile

**Solutions**:
1. Check viewport meta tag in layout
2. Verify responsive CSS is loading
3. Test on actual device (not just DevTools)
4. Check for CSS conflicts

## Debugging Tools

### Browser Console Commands

Check if HoneyBook is loaded:
```javascript
console.log('HoneyBook:', window._HB_);
```

Check for hydration errors:
```javascript
// Look for any React warnings
// Filter console for "hydration"
```

### Vercel Function Logs

View real-time logs:
1. Go to Vercel Dashboard
2. Select project
3. Click "Deployments"
4. Click latest deployment
5. Click "View Function Logs"
6. Filter for `/api/contact`

### Network Tab Inspection

Check what's loading:
1. Open DevTools → Network tab
2. Reload page
3. Look for:
   - HoneyBook script loads (placement-controller.min.js)
   - API calls to /api/contact
   - Any failed requests (red)

## Success Criteria

All tests pass when:

✅ Zero React hydration errors across all pages
✅ Contact section loads smoothly on all pages
✅ HoneyBook widget loads OR fallback appears
✅ Fallback form successfully sends emails
✅ Emails received contain correct information
✅ No JavaScript errors in console
✅ Works on all major browsers
✅ Works on mobile devices
✅ Error boundary catches errors gracefully
✅ User experience is smooth and professional

## Reporting Issues

If issues are found:

1. **Note the issue**:
   - Which page?
   - What browser/device?
   - What specific error?
   - Console error message?

2. **Gather evidence**:
   - Screenshot of error
   - Console logs
   - Network tab (if relevant)
   - Vercel function logs

3. **Check documentation**:
   - This guide
   - EMAIL_CONFIGURATION_GUIDE.md
   - IMPLEMENTATION_SUMMARY.md

4. **Report with details**:
   - Exact steps to reproduce
   - Expected vs actual behavior
   - Screenshots/logs
   - Environment details

## Next Actions After Testing

Once all tests pass:

1. ✅ Mark testing complete
2. ✅ Remove any test data
3. ✅ Monitor production for a few days
4. ✅ Check email inbox regularly
5. ✅ Gather user feedback
6. ✅ Document any edge cases found

## Maintenance

Regular checks:
- Weekly: Check Vercel logs for errors
- Monthly: Test form submission
- Quarterly: Verify Gmail App Password still works
- As needed: Update HoneyBook configuration
