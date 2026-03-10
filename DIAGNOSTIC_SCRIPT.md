# Quick Diagnostic Script

Copy and paste this into your browser console on the production site after the changes are deployed:

```javascript
// Run this AFTER logging in at https://qurbani-admin.netlify.app

console.clear();
console.log('🔍 Starting Diagnostic...\n');

// 1. Check cookies in browser
const cookies = document.cookie;
console.log('1️⃣ Browser Cookies:', cookies || 'NONE FOUND');

// 2. Check server configuration
fetch('https://hajjapi.mypaperlessoffice.org/api/config-check')
  .then(r => r.json())
  .then(d => {
    console.log('\n2️⃣ Server Config:', d);
    if (d.nodeEnv !== 'production') {
      console.error('❌ CRITICAL: NODE_ENV is not "production"!');
      console.error('   Server will not set cross-domain cookies properly!');
    } else {
      console.log('✅ NODE_ENV is correctly set to production');
    }
  })
  .catch(e => console.error('❌ Config check failed:', e));

// 3. Check session
fetch('https://hajjapi.mypaperlessoffice.org/api/session-debug', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(d => {
    console.log('\n3️⃣ Session Debug:', d);
    if (!d.hasSession) {
      console.error('❌ No session found on server');
    } else if (!d.hasAdminId) {
      console.error('❌ Session exists but no admin ID');
    } else {
      console.log('✅ Session is valid');
    }
    
    if (d.headers.cookie === 'missing') {
      console.error('❌ CRITICAL: Cookie header not being sent!');
      console.error('   This means browser is blocking or not sending cookies');
    } else {
      console.log('✅ Cookie header is present in request');
    }
  })
  .catch(e => console.error('❌ Session check failed:', e));

// 4. Check auth
fetch('https://hajjapi.mypaperlessoffice.org/api/auth/check', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(d => {
    console.log('\n4️⃣ Auth Check:', d);
    if (!d.authenticated) {
      console.error('❌ Not authenticated according to /api/auth/check');
    } else {
      console.log('✅ Authentication is valid');
    }
  })
  .catch(e => console.error('❌ Auth check failed:', e));

// 5. Check protected endpoint
fetch('https://hajjapi.mypaperlessoffice.org/api/qurbani/stats', {
  credentials: 'include'
})
  .then(r => {
    console.log('\n5️⃣ Protected Endpoint Status:', r.status);
    if (r.status === 401) {
      console.error('❌ Still getting 401 on protected endpoint');
      console.error('   Session is not persisting across requests');
    } else if (r.status === 200) {
      console.log('✅ Protected endpoint accessible!');
    }
    return r.json();
  })
  .then(d => console.log('   Data:', d))
  .catch(e => console.error('❌ Stats request failed:', e));

console.log('\n⏳ Running diagnostics... (results will appear above)');
```

## What to Look For:

### If you see:
```
❌ CRITICAL: NODE_ENV is not "production"!
```
**Fix:** On your production server:
```bash
echo "NODE_ENV=production" >> .env
pm2 restart all
```

### If you see:
```
❌ CRITICAL: Cookie header not being sent!
```
**Possible causes:**
1. Server's `NODE_ENV` is not set to `production`
2. Backend not using HTTPS
3. Cookie has wrong `SameSite` attribute
4. Browser blocking third-party cookies

### If you see:
```
✅ Everything passes but still 401 on protected endpoint
```
**Fix:** There's a timing issue or session store problem. Check MongoDB connection.

## Alternative: Test Directly

Or test the endpoints directly:

1. **Login:**
   ```
   POST https://hajjapi.mypaperlessoffice.org/api/auth/login
   Body: {"username": "admin", "password": "admin123"}
   ```

2. **Check Config (should show nodeEnv: "production"):**
   ```
   GET https://hajjapi.mypaperlessoffice.org/api/config-check
   ```

3. **Check Session (should show hasAdminId: true):**
   ```
   GET https://hajjapi.mypaperlessoffice.org/api/session-debug
   ```

4. **Check Stats (should work, not 401):**
   ```
   GET https://hajjapi.mypaperlessoffice.org/api/qurbani/stats
   ```

Use Postman or similar, and make sure to:
- Enable "Send cookies" option
- Use same tool for all requests in sequence
