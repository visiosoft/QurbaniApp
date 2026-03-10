# Backend Deployment Guide

## Production Environment Setup

### 1. Environment Variables

Create a `.env` file on your production server with these variables:

```env
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
DB_NAME=QurbaniDb
PORT=5000
SESSION_SECRET=your-strong-random-secret-key
FRONTEND_URL=https://hajjmanagement.netlify.app
JWT_SECRET=your-jwt-secret-key
```

**Important:** 
- `NODE_ENV=production` is **required** for proper session cookie configuration
- Change `SESSION_SECRET` to a strong random string
- The backend is deployed at: `https://hajjapi.mypaperlessoffice.org`

### 2. Session Configuration

The backend uses session-based authentication with the following settings:

- **Development**: 
  - `sameSite: 'lax'`
  - `secure: false`
  
- **Production** (when `NODE_ENV=production`):
  - `sameSite: 'none'` (required for cross-domain cookies)
  - `secure: true` (required for HTTPS and `sameSite: 'none'`)
  - `trust proxy: 1` (for reverse proxy support)

### 3. CORS Configuration

The backend allows requests from:
- `http://localhost:3000` (local development)
- `https://hajjmanagement.netlify.app` (production frontend)
- `FRONTEND_URL` from environment variables

### 4. Deployment Checklist

- [ ] Set `NODE_ENV=production` in environment variables
- [ ] Update `SESSION_SECRET` to a strong random value
- [ ] Update `FRONTEND_URL` to match your Netlify deployment
- [ ] Ensure MongoDB connection string is correct
- [ ] Backend is accessible via HTTPS (required for secure cookies)
- [ ] Test login flow from production frontend

### 5. Testing

After deployment, test the authentication:

1. Open browser DevTools → Network tab
2. Login from `https://hajjmanagement.netlify.app`
3. Check the response headers for `Set-Cookie`
4. Verify cookie has attributes: `SameSite=None; Secure; HttpOnly`

### 6. Common Issues

**401 Unauthorized on API calls:**
- Check `NODE_ENV=production` is set on server
- Verify backend is running on HTTPS
- Check browser console for CORS errors
- Verify session cookie is being sent with requests

**Session not persisting:**
- Ensure MongoDB connection is stable
- Check MongoStore is configured correctly
- Verify cookie settings (SameSite=None, Secure)

### 7. Server Requirements

- Node.js 18+
- HTTPS enabled (required for `SameSite=None` cookies)
- MongoDB database
- Reverse proxy support (nginx, etc.)
