# 🚀 Quick Reference - Deployment Checklist

## Pre-Deployment ✓

- [ ] Read `DELIVERY-SUMMARY.md` (5 min)
- [ ] Read `SECURITY-FIXES-README.md` (10 min)
- [ ] Extract `bexo-bd-fixed-production.zip`
- [ ] Backup your current app code to git
- [ ] Test on staging first if possible

## Deployment Phase 1: Deploy App Code

```bash
# Copy fixed files to your project
cp fixed/public/app.js YOUR_PROJECT/public/
cp fixed/index.html YOUR_PROJECT/

# Commit and push
git add .
git commit -m "Security: Fix auth vulnerabilities and profile sync"
git push

# Wait for Vercel to build (2-5 min)
# Monitor: https://vercel.com/your-project/deployments
```

**Status check:**
- [ ] Build completed without errors
- [ ] App loads in browser
- [ ] Console has no critical errors

---

## Deployment Phase 2: Backfill Legacy Auth Accounts (One-time)

### Setup
```bash
cd fixed/migrations
npm install @supabase/supabase-js
```

### Get Your Credentials
1. Go to: Supabase Dashboard → Project Settings → API
2. Copy the "Service Role" key (keep it SECRET)
3. Set environment variables:
```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your_key_here
```

### Test (Dry Run - No Changes)
```bash
node backfill-legacy-auth-accounts.mjs --dry-run
```

**Expected output:**
```
--- DRY RUN (no changes will be made) ---
Found 50 row(s) with a stored password to check.
SKIP (already has auth account): user1@example.com
created=30 skipped=20 failed=0
This was a dry run - nothing was written.
```

- [ ] Output shows reasonable numbers (not all failed)
- [ ] No critical errors

### Apply (Creates Auth Accounts)
```bash
node backfill-legacy-auth-accounts.mjs
```

**Expected output:**
```
--- LIVE RUN ---
Found 50 row(s) with a stored password to check.
creating auth account for user1@example.com (profileId BX-123456)
created=30 skipped=20 failed=0

Done. created=30 skipped=20 failed=0
```

- [ ] created > 0 (at least some accounts created)
- [ ] failed == 0 or very small
- [ ] Script completed without hanging

### Test Login After Backfill
```
1. Open app in browser
2. Log in with existing account
3. Should work with same password as before
```

- [ ] Existing user can log in
- [ ] No "account not found" errors

---

## Deployment Phase 3: Drop Password Columns (One-time)

### Run SQL Migration
1. Go to: Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Paste contents of: `migrations/2026-08-drop-password-columns.sql`
4. Review (should be 2 ALTER TABLE DROP statements)
5. Click "Run"

**Expected output:**
```
Query executed successfully. 0 rows affected.
```

- [ ] No errors
- [ ] Query completed instantly

---

## Post-Deployment Testing

### Test 1: Existing User Login (5 min)
```
Device: Laptop
1. Open app
2. Sign in with your existing email/password
3. Dashboard should load
```

- [ ] ✅ Login works
- [ ] ✅ Name/profile visible
- [ ] ✅ No console errors

### Test 2: New User Registration (5 min)
```
Device: Laptop
1. Click "Register" (if available)
2. Fill form with test user data
3. Should receive email confirmation
4. Click email link
5. Log in with new account
```

- [ ] ✅ Signup page works
- [ ] ✅ Email received within 2 min
- [ ] ✅ Can log in after confirmation

### Test 3: Cross-Device Profile Sync (5 min)
```
Device A: Laptop
1. Log in with existing account
2. Edit profile (change name to "Test123")
3. Save

Device B: Phone (same account)
1. Open app (don't refresh)
2. Wait 1-2 seconds
3. Name should change to "Test123" automatically
```

- [ ] ✅ Profile updates within 2 seconds
- [ ] ✅ No manual refresh needed
- [ ] ✅ Both devices in sync

### Test 4: Offline Security (5 min)
```
Device: Phone
1. Turn off WiFi/mobile data
2. Try to log in with WRONG password
3. Should show error
```

- [ ] ✅ Wrong password rejected (not accepted)
- [ ] ✅ Error message shows
- [ ] ✅ Not logged in

### Test 5: Admin Access (if applicable)
```
Device: Laptop
1. Log in as admin user
2. Navigate to admin panel
3. Should load without errors
```

- [ ] ✅ Admin can access panel
- [ ] ✅ No broken features
- [ ] ✅ All functions work

---

## Troubleshooting Quick Fixes

### Problem: "Build failed on Vercel"
**Solution:**
```bash
# Verify syntax locally
node --check public/app.js

# If error, restore from git and try again
git checkout public/app.js
```

### Problem: "Users can't log in after deploy"
**Solution:**
1. Did you run the backfill script? If no → run it now
2. Check Supabase error logs (Dashboard → Logs)
3. Restore previous app code and redeploy
4. Try backfill again

### Problem: "Profile not syncing between devices"
**Solution:**
1. Refresh page on both devices
2. Log out and log back in
3. Check browser console for errors (F12)
4. Verify Auth session exists: `auth.getSession()`

### Problem: "Backfill script hangs"
**Solution:**
1. Check internet connection
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct (30+ characters)
3. Kill script (Ctrl+C) and try again

### Problem: "SQL migration failed"
**Solution:**
1. Verify columns exist: Run `PRAGMA table_info(bexo_users);`
2. If columns already dropped, migration is done (safe to ignore)
3. If columns exist but can't drop, check Supabase status page

---

## Rollback Plan (If Something Critical Breaks)

### Option 1: Revert Code (Keep Old App)
```bash
git revert HEAD
git push
# Vercel automatically redeploys previous version
```

**Time:** 5 minutes  
**User Impact:** None (app still works)  
**Note:** Existing users can keep logging in normally

### Option 2: Restore from Backup
```bash
# If you backed up before deployment
git checkout <previous-commit-sha>
git push
```

**Time:** 10 minutes  
**User Impact:** Users need to log in again  
**Note:** Database changes (password columns) will remain until rolled back

### Option 3: Restore Database
```bash
# In Supabase Dashboard → Backups
# Restore to snapshot before SQL migration
```

**Time:** 15-30 minutes  
**User Impact:** May lose recent changes  
**Note:** Last resort only

---

## Monitoring After Deployment

### First Hour
- [ ] Watch error logs in Supabase (Dashboard → Logs)
- [ ] Test login 3-4 times from different browsers
- [ ] Check app performance (no slowdowns)

### First Day
- [ ] Monitor failed logins (check Supabase auth logs)
- [ ] A few users might reach out with questions
- [ ] Have `MIGRATION-NOTES.md` ready for FAQ

### First Week
- [ ] Monitor daily error patterns
- [ ] All users should be migrated by now
- [ ] Profile sync working normally
- [ ] No more password-related errors

---

## Files You'll Need

| File | Purpose | Location |
|------|---------|----------|
| `public/app.js` | Fixed auth code | Deploy to Vercel |
| `index.html` | Fixed login page | Deploy to Vercel |
| `backfill-legacy-auth-accounts.mjs` | Create Auth accounts | Run locally, once |
| `2026-08-drop-password-columns.sql` | Clean up DB | Run in Supabase SQL Editor |
| `MIGRATION-NOTES.md` | Detailed guide | Reference when needed |
| `CHANGELOG.md` | Technical details | Reference when needed |

---

## Success Criteria

✅ **Done when:**
- All tests above passed
- No "permission denied" or "auth" errors
- Existing users can log in
- New users can register and log in
- Profile edits sync across devices within 2 seconds
- No password data visible in browser/database
- Admin panel still works (if applicable)

---

## Emergency Contact (If Stuck)

1. **Syntax errors?** → Run `node --check public/app.js`
2. **Backfill errors?** → Check `SUPABASE_SERVICE_ROLE_KEY` is set
3. **Users can't log in?** → Run backfill migration if not done
4. **Profile not syncing?** → Refresh page, check console (F12)
5. **SQL error?** → Columns might already be dropped (safe to ignore)

---

**Estimated total time: 30-45 minutes**

**Good luck! 🚀**
