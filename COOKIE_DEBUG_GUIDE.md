# Cookie Debugging Guide

## The Problem

Your logs show:
```
✅ Session saved successfully (sessionID: 'abc123')
❌ Next request: cookieHeader: 'MISSING' (sessionID: 'xyz789' - DIFFERENT!)
```

The browser is **NOT sending the cookie back** with subsequent requests.

## Test Process

### Step 1: Deploy Latest Code

```bash
cd "g:\Qurbani App"
git add .
git commit -m "Add cookie debugging endpoints and logging"
git push
```

On production server:
```bash
cd /var/www/hajjapi/backend
git pull
pm2 restart hajjapi
```

### Step 2: Test Cookie Manually

Open your browser and go to:
```
https://hajjapi.mypaperlessoffice.org/api/test-cookie
```

You should see:
```json
{
  "message": "Session value set",
  "sessionID": "xxx",
  "testValue": "cookie-test-12345",
  "cookieConfig": {
    "secure": true,
    "sameSite": "none",
    "httpOnly": true
  }
}
```

**Check Browser DevTools → Application → Cookies → `hajjapi.mypaperlessoffice.org`**

You should see a cookie named `connect.sid` with:
- ✅ Value: (some string)
- ✅ SameSite: None
- ✅ Secure: ✓
- ✅ HttpOnly: ✓

### Step 3: Verify Cookie Persists

Now visit (in the SAME browser tab):
```
https://hajjapi.mypaperlessoffice.org/api/verify-cookie
```

You should see:
```json
{
  "hasCookieHeader": true,
  "sessionID": "xxx", // SAME as step 2
  "testValue": "cookie-test-12345", // SAME value
  "message": "Cookie is working!"
}
```

### Step 4: Test from Frontend

Open browser console on https://qurbani-admin.netlify.app and run:

```javascript
// Step 1: Set a cookie
fetch('https://hajjapi.mypaperlessoffice.org/api/test-cookie', {
  credentials: 'include'
})
.then(r => r.json())
.then(d => {
  console.log('1️⃣ Set cookie:', d);
  
  // Step 2: Verify it was sent back
  return fetch('https://hajjapi.mypaperlessoffice.org/api/verify-cookie', {
    credentials: 'include'
  });
})
.then(r => r.json())
.then(d => console.log('2️⃣ Verify cookie:', d));
```

**Expected Result:**
```
1️⃣ Set cookie: { sessionID: "ABC123", testValue: "cookie-test-..." }
2️⃣ Verify cookie: { 
  sessionID: "ABC123",  ← SAME sessionID
  testValue: "cookie-test-...",  ← SAME value
  message: "Cookie is working!"
}
```

**If you see DIFFERENT sessionIDs** → Browser is blocking cookies!

## Common Causes

### 1. Browser Blocking Third-Party Cookies

**Safari:** Blocks by default (Intelligent Tracking Prevention)
**Firefox:** Blocks in strict mode
**Chrome/Edge:** Usually allows with `SameSite=None; Secure`

**Test:** Try in Chrome with third-party cookies enabled:
```
chrome://settings/cookies
→ Allow all cookies
```

### 2. HTTPS Not Properly Configured

Verify your backend is truly HTTPS:
```bash
curl -I https://hajjapi.mypaperlessoffice.org/api/health
```

Should show `HTTP/2 200` or `HTTP/1.1 200` (NOT HTTP/1.1 301 redirect)

### 3. Set-Cookie Header Format

Check server logs - you should see:
```
📤 Response for /api/auth/login: {
  setCookie: [ 'connect.sid=...; Path=/; HttpOnly; Secure; SameSite=None' ]
}
```

If `setCookie: 'NONE'` → Session middleware isn't setting cookies!

### 4. Reverse Proxy Stripping Headers

If using nginx/Apache, ensure it's not stripping Set-Cookie headers:

**Nginx:**
```nginx
proxy_set_header Cookie $http_cookie;
proxy_pass_header Set-Cookie;
```

**Apache:**
```apache
ProxyPassReverseCookiePath / /
```

## Solutions

### Solution 1: Use Same Domain (Recommended)

Instead of:
- Frontend: `qurbani-admin.netlify.app`
- Backend: `hajjapi.mypaperlessoffice.org`

Use:
- Frontend: `admin.mypaperlessoffice.org` (point to Netlify)
- Backend: `api.mypaperlessoffice.org` (your server)

Both share `.mypaperlessoffice.org` domain, cookies work with `SameSite=Lax`

### Solution 2: Use JWT Instead of Sessions

For cross-domain, JWT in localStorage is more reliable than cookies:

1. Login returns JWT token
2. Frontend stores in localStorage
3. Frontend sends as `Authorization: Bearer <token>` header
4. No cookies needed

### Solution 3: Partitioned Cookies (New)

Add CHIPS (Cookies Having Independent Partitioned State):

```javascript
cookie: {
  secure: true,
  sameSite: 'none',
  partitioned: true  // NEW - Chrome 114+
}
```

## Next Steps

1. Run the test scripts above
2. Report what you see in Step 4
3. Check browser DevTools → Application → Cookies
4. Check server logs for `📤 Response for /api/auth/login`

If cookies still don't work, we'll need to switch to JWT authentication for cross-domain.
