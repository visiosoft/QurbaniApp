# 🚨 CRITICAL FIX NEEDED - Production Server Configuration

## The Problem (Confirmed)

Your logs show:
```
✅ Login response: {success: true...}
🔍 Verifying session...
✅ Session verified: {authenticated: false}   ← THIS IS THE PROBLEM!
```

**Login succeeds but session is NOT authenticated** - this proves cookies are not working between requests.

## Root Cause

Cross-domain cookies between:
- **Frontend:** https://qurbani-admin.netlify.app (Netlify)
- **Backend:** https://hajjapi.mypaperlessoffice.org (Your server)

Require these cookie attributes:
- `SameSite=None`
- `Secure=true`

**BUT** your server only sets these when `NODE_ENV=production`.

Currently your server's `NODE_ENV` is **NOT** set to production, so cookies use `SameSite=Lax` which browsers block for cross-domain requests.

## The Fix (5 Minutes)

### Step 1: SSH/Connect to Your Production Server

```bash
ssh user@hajjapi.mypaperlessoffice.org
```

### Step 2: Navigate to Your Backend Folder

```bash
cd /path/to/your/backend
# (wherever server.js is located)
```

### Step 3: Edit Your .env File

```bash
nano .env   # or vim .env
```

Add this line at the top:
```
NODE_ENV=production
```

Make sure these are also present:
```
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
PORT=5000
CORS_ORIGIN=https://qurbani-admin.netlify.app
```

Save and exit (Ctrl+X, Y, Enter for nano)

### Step 4: Restart Your Backend Server

If using PM2:
```bash
pm2 restart all
pm2 logs
```

If using systemd:
```bash
sudo systemctl restart your-backend-service
sudo systemctl status your-backend-service
```

If using node directly:
```bash
# Kill the existing process
pkill node

# Start again
node server.js &
```

## Step 5: Verify the Fix

Visit in browser:
```
https://hajjapi.mypaperlessoffice.org/api/config-check
```

You should see:
```json
{
  "nodeEnv": "production",        ← MUST be "production"
  "corsOrigin": "https://qurbani-admin.netlify.app",
  "sessionSecure": true,
  "sessionSameSite": "none",      ← MUST be "none"
  "trustProxy": true
}
```

## Step 6: Test Login Again

1. Go to https://qurbani-admin.netlify.app/login
2. Clear browser cache/cookies
3. Login with your credentials
4. You should now stay logged in!

## If Still Not Working

Run the diagnostic script from your browser console:
(See DIAGNOSTIC_SCRIPT.md)

## Why This Happens

The code in `server.js` has:

```javascript
cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24
}
```

Without `NODE_ENV=production`:
- ❌ `secure: false` - cookies only sent over HTTP
- ❌ `sameSite: 'lax'` - cookies blocked on cross-domain requests

With `NODE_ENV=production`:
- ✅ `secure: true` - cookies sent over HTTPS
- ✅ `sameSite: 'none'` - cookies allowed cross-domain

## Expected Behavior After Fix

Console logs should show:
```
🔐 Attempting login...
✅ Login response: {success: true...}
✅ Login successful, setting auth state
✅ Admin info stored: super_admin
🔍 Verifying session...
Session check response: {authenticated: true, admin: {...}}   ← SHOULD BE TRUE!
✅ Session verified successfully
🚀 Navigating to dashboard...
```

Then you should see dashboard data without 401 errors.

## Quick Verification Checklist

After deploying the frontend changes (already done) and setting `NODE_ENV=production` on server:

- [ ] Visit `/api/config-check` - nodeEnv shows "production"
- [ ] Visit `/api/config-check` - sessionSameSite shows "none"
- [ ] Login - no error message appears
- [ ] Dashboard loads - no 401 errors
- [ ] Stats cards show numbers
- [ ] All pages work without login redirects

---

**Bottom Line:** Your server MUST have `NODE_ENV=production` in the .env file for the admin panel to work from Netlify.
