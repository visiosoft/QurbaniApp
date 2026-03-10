# Troubleshooting 401 Unauthorized Errors

## Current Issue
Getting `401 Unauthorized` on `/api/qurbani/stats` and other protected endpoints after login.

## Diagnosis Steps

### 1. Check Server Configuration
Visit: `https://hajjapi.mypaperlessoffice.org/api/config-check`

Expected response:
```json
{
  "nodeEnv": "production",
  "sessionConfigured": {
    "secure": true,
    "sameSite": "none",
    "httpOnly": true
  },
  "trustProxy": 1
}
```

**If `nodeEnv` is NOT "production", STOP and fix that first!**

### 2. Check Session After Login
After logging in, visit: `https://hajjapi.mypaperlessoffice.org/api/session-debug`

Expected response when logged in:
```json
{
  "hasSession": true,
  "hasAdminId": true,
  "adminRole": "super_admin",
  "cookie": {
    "secure": true,
    "httpOnly": true,
    "sameSite": "None"
  },
  "headers": {
    "cookie": "present (not shown for security)"
  }
}
```

**If `hasAdminId` is false, the session is not being created properly!**

### 3. Check Browser Cookies
1. Open DevTools → Application → Cookies
2. Look under `https://hajjapi.mypaperlessoffice.org`
3. Find cookie named `connect.sid`
4. Check attributes:
   - ✅ `SameSite: None`
   - ✅ `Secure: Yes`
   - ✅ `HttpOnly: Yes`

**If cookie is missing or has wrong attributes, server configuration is wrong!**

### 4. Check Network Requests
1. Open DevTools → Network tab
2. Login
3. Look at the login POST request response headers
4. Should see: `Set-Cookie: connect.sid=...; Path=/; HttpOnly; Secure; SameSite=None`

**If Set-Cookie header is missing, session is not being created!**

### 5. Check Subsequent Requests
1. After login, check any API request (like `/api/qurbani/stats`)
2. Look at Request Headers
3. Should see: `Cookie: connect.sid=...`

**If Cookie header is missing, browser is not sending the cookie!**

## Common Causes & Fixes

### Cause 1: NODE_ENV Not Set
**Symptom:** `/api/config-check` shows `nodeEnv: "not set"` or `"development"`

**Fix:**
```bash
# On production server
echo "NODE_ENV=production" >> .env
pm2 restart all
```

### Cause 2: Cookies Not Cross-Domain Compatible
**Symptom:** Cookie has `SameSite: Lax` instead of `SameSite: None`

**Fix:** Ensure `NODE_ENV=production` is set (see Cause 1)

### Cause 3: Backend Not on HTTPS
**Symptom:** Cookie has `Secure: No` or browser blocks it

**Fix:** Ensure your backend is served over HTTPS with valid SSL certificate

### Cause 4: Trust Proxy Not Set
**Symptom:** Session works locally but not in production

**Fix:** Already added in code: `app.set('trust proxy', 1)`

### Cause 5: CORS Issues
**Symptom:** Browser console shows CORS errors

**Fix:**
```bash
# On production server
echo "FRONTEND_URL=https://hajjmanagement.netlify.app" >> .env
pm2 restart all
```

### Cause 6: Session Store Connection Issues
**Symptom:** Login works but session doesn't persist

**Fix:** Check MongoDB connection and MongoStore logs

## Quick Test Script

Run these commands in browser console on `https://hajjmanagement.netlify.app`:

```javascript
// 1. Check config
fetch('https://hajjapi.mypaperlessoffice.org/api/config-check')
  .then(r => r.json())
  .then(d => console.log('Config:', d));

// 2. After login, check session
fetch('https://hajjapi.mypaperlessoffice.org/api/session-debug', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(d => console.log('Session:', d));

// 3. Check if cookies are being sent
fetch('https://hajjapi.mypaperlessoffice.org/api/qurbani/stats', {
  credentials: 'include'
})
  .then(r => console.log('Stats Response:', r.status))
  .catch(e => console.log('Stats Error:', e));
```

## Expected Production Server .env File

Your production server MUST have:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://devxulfiqar:nSISUpLopruL7S8j@mypaperlessoffice.z5g84.mongodb.net/?retryWrites=true&w=majority&appName=mypaperlessoffice
DB_NAME=QurbaniDb
PORT=5000
SESSION_SECRET=some-long-random-secure-string-here
FRONTEND_URL=https://hajjmanagement.netlify.app
JWT_SECRET=qurbani-jwt-secret-2026
```

## Still Not Working?

If after all these checks it still doesn't work:

1. Restart your production server
2. Clear all browser cookies and cache
3. Try in incognito/private window
4. Check server logs: `pm2 logs` or `journalctl -u qurbani-backend -f`
5. Look for these log messages:
   - `🔐 Auth check:` - Shows if session exists
   - `✅ Admin authenticated:` - Confirms auth worked
   - `❌ Auth failed` - Shows why auth failed

## The Root Cause

99% of the time, it's simply that `NODE_ENV=production` is not set on the production server!

Check it right now:
```bash
ssh your-server
cat .env | grep NODE_ENV
# Should output: NODE_ENV=production
```
