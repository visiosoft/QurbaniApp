# Production Setup Guide - CRITICAL

## 🚨 IMMEDIATE ACTION REQUIRED ON PRODUCTION SERVER

Your production backend server at `https://hajjapi.mypaperlessoffice.org` is getting 401 errors because the session cookies are not configured correctly.

## Step-by-Step Fix:

### 1. SSH into your production server
```bash
ssh your-server
cd /path/to/qurbani-backend
```

### 2. Create/Update `.env` file
```bash
nano .env
```

Add these lines (or update existing):
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://devxulfiqar:nSISUpLopruL7S8j@mypaperlessoffice.z5g84.mongodb.net/?retryWrites=true&w=majority&appName=mypaperlessoffice
DB_NAME=QurbaniDb
PORT=5000
SESSION_SECRET=change-this-to-something-random-and-secure-123456789
FRONTEND_URL=https://hajjmanagement.netlify.app
JWT_SECRET=qurbani-jwt-secret-2026
```

**CRITICAL:** The `NODE_ENV=production` line is ABSOLUTELY REQUIRED!

### 3. Restart the Node.js application
```bash
# If using PM2:
pm2 restart all

# If using systemd:
sudo systemctl restart qurbani-backend

# If running manually:
# Stop the current process (Ctrl+C) and run:
npm start
```

### 4. Verify Configuration
Open this URL in your browser:
```
https://hajjapi.mypaperlessoffice.org/api/config-check
```

You should see:
```json
{
  "nodeEnv": "production",
  "sessionConfigured": {
    "secure": true,
    "sameSite": "none",
    "httpOnly": true,
    "maxAge": "24 hours"
  },
  "trustProxy": 1,
  "frontendUrl": "https://hajjmanagement.netlify.app"
}
```

**If `nodeEnv` is NOT `"production"`, the .env file is not being loaded!**

### 5. Test Login
1. Clear browser cookies: DevTools → Application → Cookies → Clear all
2. Go to: `https://hajjmanagement.netlify.app/login`
3. Login with: `admin` / `admin123`
4. Open DevTools → Network tab
5. Check login response headers for:
   ```
   Set-Cookie: connect.sid=...; SameSite=None; Secure; HttpOnly
   ```

## Why This Is Required:

### Cross-Domain Cookies (Netlify → Your Backend):
- Frontend: `https://hajjmanagement.netlify.app` (Netlify domain)
- Backend: `https://hajjapi.mypaperlessoffice.org` (Your domain)

These are **different domains**, so cookies need special settings:

1. **`SameSite=None`** - Allows cross-domain cookies
2. **`Secure=true`** - Required when using `SameSite=None` (HTTPS only)
3. **Backend must be on HTTPS** - ✅ You have this
4. **`NODE_ENV=production`** - Triggers these settings in the code

## Troubleshooting:

### Still getting 401?

**Check 1: Is NODE_ENV set?**
```bash
# On your server:
echo $NODE_ENV
# Should return: production
```

**Check 2: Are cookies being set?**
- Open browser DevTools → Application → Cookies
- Check `hajjapi.mypaperlessoffice.org`
- Look for cookie named `connect.sid`
- Verify it has `SameSite=None` and `Secure` flags

**Check 3: Server logs**
```bash
# Check server logs for authentication messages:
pm2 logs
# or
journalctl -u qurbani-backend -f
```

Look for: `✅ Admin authenticated` or `❌ Auth failed`

**Check 4: CORS errors?**
- Open browser console
- Look for CORS-related error messages
- If present, verify FRONTEND_URL in .env matches exactly

## Common Mistakes:

❌ `.env` file not in the correct directory
❌ Forgot to restart the server after updating .env
❌ `NODE_ENV` has a typo or extra spaces
❌ Using HTTP instead of HTTPS for backend
❌ Firewall blocking cookie headers

## Need Help?

1. Visit: `https://hajjapi.mypaperlessoffice.org/api/config-check`
2. Send screenshot of the response
3. Check browser console for errors
4. Check server logs

The most common issue is simply forgetting to set `NODE_ENV=production` in the .env file!
