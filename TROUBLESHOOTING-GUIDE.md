# Bexo BD - Troubleshooting & Diagnostic Guide

## Quick Diagnosis Flowchart

```
Is something broken?
│
├─→ User can't log in? ─→ [See: Login Issues]
├─→ Profile not syncing? ─→ [See: Sync Issues]
├─→ Product upload failing? ─→ [See: Product Issues]
├─→ App is slow? ─→ [See: Performance Issues]
├─→ Database error? ─→ [See: Database Issues]
├─→ Admin panel broken? ─→ [See: Admin Issues]
└─→ Other error? ─→ [See: General Errors]
```

---

## Section 1: Login Issues

### Symptom: "Cannot log in - Authentication error"

**Step 1: Verify user exists**
```bash
# In Supabase SQL Editor
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'user@example.com';
```

**Step 2: Check email confirmation status**
```
If email_confirmed_at IS NULL:
  → User hasn't confirmed email yet
  → Solution: Send confirmation email again
  
If email_confirmed_at IS NOT NULL:
  → Email is confirmed
  → Problem is elsewhere, continue to Step 3
```

**Step 3: Check password is correct**
```
- Ask user to try again carefully
- Common mistake: CAPS LOCK on
- Check for spaces before/after password
```

**Step 4: Check if account is locked**
```bash
# In Supabase SQL Editor
SELECT * FROM failed_login_attempts 
WHERE email = 'user@example.com' 
  AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

**Solutions by Cause:**

| Cause | Error Message | Fix |
|-------|---------------|-----|
| Email not confirmed | "ইমেইল নিশ্চিত করতে হবে" | Send confirmation email |
| Wrong password | "পাসওয়ার্ড ভুল" | User reset password |
| Email not found | "অ্যাকাউন্ট পাওয়া যায়নি" | User register account |
| Account locked | "খুব বেশি চেষ্টা" | Wait 30 min or reset password |
| Supabase down | "সংযোগ ব্যর্থ" | Check status.supabase.com |

### Symptom: "Logged in but can't see profile"

**Diagnosis:**

```
1. Open browser console (F12)
2. Check for errors (red text)
3. If error contains:
   - "PGRST116" → permission denied
   - "relations do not exist" → database schema issue
   - "no rows returned" → profile row missing
```

**Fix for "PGRST116" (Permission Denied):**

```bash
# Check RLS policy
SELECT * FROM pg_policies WHERE tablename = 'bexo_users';

# Verify user ID matches
SELECT id FROM auth.users WHERE email = 'user@example.com';
SELECT id FROM bexo_users WHERE email = 'user@example.com';

# If IDs don't match:
# Run the backfill migration:
node migrations/backfill-legacy-auth-accounts.mjs
```

**Fix for Missing Profile:**

```bash
# Create profile row for existing auth user
INSERT INTO bexo_users (
  id, email, fullName, shopName, role, created_at
) VALUES (
  'user_uuid_here',
  'user@example.com',
  'User Name',
  'Shop Name',
  'user',
  NOW()
);
```

---

## Section 2: Profile Sync Issues

### Symptom: "Edit profile on laptop, change doesn't appear on phone"

**Diagnosis Checklist:**

```
☐ Both devices logged into same account?
☐ Both devices connected to internet?
☐ Phone page refreshed within last 2 seconds?
☐ Realtime enabled in Supabase?
☐ Browser console showing errors?
```

**Step 1: Check Realtime Subscription**

```javascript
// Open browser console on phone and run:
console.log('Checking realtime subscription...');

// Should see:
// "Profile subscription established" or similar
// If error: check browser console for red text
```

**Step 2: Force Sync**

```
On Phone:
1. Press F5 (or Ctrl+R on mobile)
2. Wait 2-3 seconds
3. Page should show latest profile
```

**Step 3: Check Network Connection**

```
On Phone:
1. Check WiFi/mobile is connected
2. Try downloading a file
3. If still offline, resync won't work
4. Edits will sync when connection restored
```

**Step 4: Check Supabase Realtime**

```bash
# In Supabase Dashboard → Logs → Edge Functions
# Look for subscription errors

# In SQL Editor:
SELECT * FROM postgres_subscriptions 
WHERE user_id = 'user_uuid_here';
```

### Symptom: "Realtime errors in console"

**Error: "connect ECONNREFUSED"**

```
Cause: Realtime server unreachable
Solution:
  1. Check internet connection
  2. Check Supabase status page
  3. Restart browser
  4. Wait 5-10 minutes (might be maintenance)
```

**Error: "permission denied on schema"**

```
Cause: RLS policy blocking
Solution:
  1. Check RLS policies in Supabase
  2. Run backfill if user ID mismatch:
     node migrations/backfill-legacy-auth-accounts.mjs
  3. Verify auth user ID = profile user ID
```

**Error: "table does not exist"**

```
Cause: Database schema issue
Solution:
  1. Check if bexo_users table exists:
     SELECT * FROM information_schema.tables
     WHERE table_name = 'bexo_users';
  2. If missing, restore from backup
  3. Re-run migration script
```

---

## Section 3: Product Issues

### Symptom: "Cannot upload product"

**Possible Causes & Fixes:**

| Symptom | Cause | Fix |
|---------|-------|-----|
| "File too large" | > 10MB | Compress image before uploading |
| "Invalid file type" | Not jpg/png/webp | Convert to JPG/PNG |
| "Permission denied" | User role issue | Check role in admin panel |
| "Database error" | Schema issue | Check bexo_products table exists |
| "Storage full" | Out of space | Archive old products |

**Detailed Fix: File Upload Failing**

```javascript
// In browser console, check:
console.log('File size:', file.size / 1024 / 1024, 'MB');
console.log('File type:', file.type);
console.log('Auth token exists:', !!localStorage.getItem('sb-access-token'));
```

**If file size > 10MB:**
```bash
# Resize image locally before upload
# Using ImageMagick:
convert input.jpg -resize 800x800 output.jpg
```

**If permission denied:**
```bash
# Check user role
SELECT role FROM bexo_users WHERE id = 'user_uuid_here';

# Must be 'user' or 'admin'
# If 'collector', contact admin to change role
```

### Symptom: "Products not showing in list"

**Diagnosis:**

```
1. Open browser console
2. Check for network errors
3. Run this in console:

fetch('/api/products', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('sb-access-token')}` }
})
.then(r => r.json())
.then(d => console.log(d));
```

**If empty results:**

```
Causes:
- No products created yet
- All products archived
- Filter is too restrictive
- Permission issue

Solution:
1. Try removing all filters
2. Check filter settings
3. Create test product
```

**If error response:**

```
See "Error Responses" section in API-REFERENCE.md
Most common: 401 (auth) or 403 (permissions)
```

---

## Section 4: Performance Issues

### Symptom: "App is very slow"

**Quick Diagnosis (60 seconds):**

```
1. Open DevTools: F12
2. Go to Network tab
3. Reload page (Ctrl+R)
4. Check:
   - How many requests? (should be < 50)
   - Largest file? (should be < 2MB)
   - Load time? (should be < 5 seconds)
5. Go to Performance tab
6. Record for 5 seconds
7. Look for long tasks (red bars)
```

**Specific Issues:**

**Issue 1: Page loads slowly (> 5 seconds)**

```
Likely cause: Large product list

Solution:
1. Add filters/search to reduce items
2. Don't load all products at once
3. Use pagination (currently: 20 per page)
4. On server: add database index

CREATE INDEX idx_products_user_id 
ON bexo_products(user_id);
```

**Issue 2: Typing in search/input is slow**

```
Likely cause: Too many DOM updates

Solution:
1. Browser: Close other tabs
2. Server: Reduce dataset size
3. Mobile: Performance is expected slower
```

**Issue 3: Image loading takes forever**

```
Likely causes:
- Image file too large (> 5MB)
- Slow internet connection
- CDN is slow

Solutions:
- Compress images: convert img.jpg -quality 80 img-small.jpg
- Use WebP format (smaller files)
- Test on different network
- Check CDN status
```

**Performance Targets (Should Achieve):**

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 2.5s | ✅ ~2s |
| Largest Contentful Paint | < 2.5s | ✅ ~2s |
| Cumulative Layout Shift | < 0.1 | ✅ ~0.05 |
| Total Bundle Size | < 2MB | ✅ 1.8MB |
| Page Load Time | < 5s | ✅ ~3s |

---

## Section 5: Database Issues

### Symptom: "Database connection error"

**Diagnosis:**

```
Error Message Analysis:

"Connection refused"
  → Supabase server down
  → Check: status.supabase.com

"Too many connections"
  → Connection pool exhausted
  → Solution: Increase pool size

"Query timeout"
  → Slow database query
  → Solution: Add index or optimize query

"Permission denied"
  → RLS policy blocking
  → Solution: Check RLS rules
```

**Quick Fixes:**

**Fix 1: Increase Connection Pool**

```
Supabase Dashboard → Project Settings → Database
→ Connection Pooling → Increase "Max Connections" to 30
```

**Fix 2: Kill Idle Connections**

```bash
# In SQL Editor:
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
  AND query_start < NOW() - INTERVAL '5 minutes';
```

**Fix 3: Check Database Status**

```bash
# In SQL Editor, run:
SELECT version();
→ If returns version: database is working

SELECT COUNT(*) FROM bexo_users;
→ If returns number: users table exists

SELECT COUNT(*) FROM bexo_products;
→ If returns number: products table exists
```

### Symptom: "Storage space full"

**Check Usage:**

```bash
# In SQL Editor:
SELECT pg_size_pretty(pg_database_size(current_database())) 
AS size;
```

**Cleanup:**

```bash
# Archive old data (6+ months):
UPDATE bexo_products 
SET status = 'archived'
WHERE updated_at < NOW() - INTERVAL '6 months'
  AND status != 'archived';

# Delete very old data (1+ years):
DELETE FROM bexo_products
WHERE updated_at < NOW() - INTERVAL '1 year'
  AND status = 'archived';
```

---

## Section 6: Email Issues

### Symptom: "User didn't receive confirmation email"

**Possible Causes:**

1. **Email is in spam folder**
   - Solution: Check spam/junk folder

2. **Email was never sent**
   - Check Supabase logs: Dashboard → Logs → Edge Functions
   - Verify email is configured: Settings → Authentication → Email

3. **Email address was typo**
   - Solution: User re-register with correct email

4. **Email service is down**
   - Check status page of your email provider
   - Temporary: Ask admin to manually confirm user in Supabase

**Resend Confirmation Email:**

```bash
# Admin can resend via Supabase Auth settings
# Or via SQL (if you have a function for it):

-- Note: Manual confirm without email
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'user@example.com';
```

### Symptom: "Password reset email not received"

**Same steps as confirmation email above**

---

## Section 7: Admin Panel Issues

### Symptom: "Can't access admin panel"

**Check 1: Are you logged in?**
```
- Log out and log back in
- Check localStorage cleared after logout
- Try incognito/private window
```

**Check 2: Are you an admin?**
```bash
# In Supabase SQL Editor:
SELECT role FROM bexo_users 
WHERE id = 'your_user_id_here';

# Must show: admin
# If shows: user or collector
# Solution: Ask super-admin to change role
```

**Check 3: Is admin panel enabled?**
```bash
# Check environment variable:
echo $VITE_ENABLE_ADMIN

# Should be: true
# If not, redeploy with: VITE_ENABLE_ADMIN=true
```

---

## Section 8: Browser-Specific Issues

### Chrome/Edge Issues

```
Problem: Console shows errors but app works
Solution:
  1. Clear cache: Ctrl+Shift+Delete
  2. Hard refresh: Ctrl+Shift+R
  3. Try incognito window
  4. Update Chrome to latest version

Problem: "localStorage not available"
Solution:
  1. Check if in private/incognito mode
  2. Check if site is https
  3. Check browser storage settings
```

### Safari Issues

```
Problem: Can't log in
Solution:
  1. Check if "Prevent cross-site tracking" is ON
  2. Disable for this site
  3. Try private window

Problem: "File upload fails"
Solution:
  1. Try Chrome instead (known Safari limitation)
  2. Update to latest Safari
```

### Mobile (iOS/Android) Issues

```
Problem: "App very slow on mobile"
Solution:
  1. Mobile networks are slower
  2. Use WiFi instead of cellular
  3. Close other apps (free RAM)

Problem: "Zoom not working"
Solution:
  1. Some inputs have `user-select: none`
  2. Try double-tap zoom instead
  3. Pinch zoom should still work
```

---

## Section 9: Common Error Codes

### Auth Errors (400-403)

```
400: VALIDATION_ERROR
  → Invalid input format
  → Check: email format, password strength

401: INVALID_CREDENTIALS
  → Wrong email or password
  → Check: email exists, password is correct

401: EMAIL_NOT_CONFIRMED
  → User hasn't confirmed email
  → Solution: Click link in confirmation email

403: PERMISSION_DENIED
  → User doesn't have access
  → Check: user role and RLS policies

409: EMAIL_ALREADY_EXISTS
  → Email is already registered
  → Solution: Use different email or reset password
```

### Database Errors (500)

```
500: DATABASE_ERROR
  → Database connection failed
  → Check: Supabase status, network connection

500: TABLE_NOT_FOUND
  → Schema is missing tables
  → Solution: Restore from backup

500: QUERY_TIMEOUT
  → Database query too slow
  → Solution: Add index, optimize query
```

### Rate Limit Errors (429)

```
429: TOO_MANY_REQUESTS
  → Hit rate limit
  → Solution: Wait (seconds specified in response)
  → Implement exponential backoff in client

Example:
{
  "error": "Too many requests",
  "retryAfter": 60
}
→ Wait 60 seconds before retrying
```

---

## Section 10: Emergency Procedures

### If Database is Corrupted

```
Step 1: Stop accepting new data
  → Go to Vercel → Settings → Production Deployment Guard
  → Or take site into maintenance mode

Step 2: Notify users
  → Post status on social media
  → Send email to affected users

Step 3: Restore from backup
  → Go to Supabase → Backups
  → Restore to most recent working backup
  → This will take 5-10 minutes

Step 4: Verify data
  → Run: SELECT COUNT(*) FROM bexo_users;
  → Should return reasonable number

Step 5: Resume normal operations
  → Bring site back online
  → Monitor error logs for 1 hour
```

### If Supabase is Down

```
Step 1: Check status
  → Go to https://status.supabase.com
  → If yellow/red: wait for fix

Step 2: Users can't login
  → This is normal during outage
  → Don't tell users to reset password

Step 3: Estimated time to recovery
  → Usually 5-30 minutes
  → Check status page updates

Step 4: Communicate with users
  → Tweet/post on social: "We're experiencing issues..."
  → Provide ETA if available

Step 5: Post-outage
  → Check app works fully
  → Monitor for residual issues
  → Send email: "Service restored"
```

### If You're Hacked

```
Step 1: Immediate actions (next 5 minutes)
  ☐ Change admin password
  ☐ Change Supabase service role key
  ☐ Change Vercel environment variables
  ☐ Enable 2FA if available

Step 2: Investigation (next 30 minutes)
  ☐ Check Supabase audit logs
  ☐ Check unusual user accounts (use admin panel)
  ☐ Check for unauthorized database changes
  ☐ Review GitHub commit history

Step 3: Remediation (next 1-2 hours)
  ☐ Delete unauthorized accounts
  ☐ Rollback code if needed
  ☐ Rotate all API keys
  ☐ Run antivirus on development machine

Step 4: Communication
  ☐ Notify users of breach (required by law)
  ☐ Tell users to change passwords
  ☐ Enable password reset for all users
  ☐ Monitor for account takeovers
```

---

## Debug Checklist

Use this for any issue:

```
☐ Checked browser console for errors (F12)
☐ Tried hard refresh (Ctrl+Shift+R)
☐ Tried different browser
☐ Tried incognito/private window
☐ Checked internet connection
☐ Looked up error code in this guide
☐ Checked Supabase status page
☐ Checked error logs (Supabase Dashboard → Logs)
☐ Restarted browser
☐ Restarted device
☐ Checked if issue is widespread or just one user
☐ Checked if issue is new or was there yesterday
```

---

## Still Stuck?

**If problem isn't in this guide:**

1. **Gather Information:**
   - Screenshot of error
   - Browser console errors (copy-paste)
   - Steps to reproduce
   - When it started happening

2. **Check These Places:**
   - Browser console (F12 → Console)
   - Supabase logs (Dashboard → Logs)
   - Vercel logs (Dashboard → Deployments → Logs)
   - Your monitoring (if set up)

3. **Try This:**
   - Clear browser cache completely
   - Try on different device
   - Try on different network
   - Restore from backup if data corruption
   - Redeploy app if config issue

4. **Get Help:**
   - Post error in #engineering channel
   - Create GitHub issue
   - Contact Supabase support (if database issue)
   - Contact Vercel support (if deployment issue)

---

**Last Updated:** August 30, 2026  
**Coverage:** Common issues for small-medium scale  
**Maintenance:** Add issues as they're discovered
