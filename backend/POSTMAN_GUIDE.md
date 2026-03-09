# Postman API Testing Guide

## Quick Start

### 1. Import Collection & Environment

**Import these files into Postman:**
- `Qurbani_API.postman_collection.json` - All API endpoints
- `Qurbani_API.postman_environment.json` - Environment variables

**How to Import:**
1. Open Postman
2. Click **Import** button (top left)
3. Drag and drop both JSON files
4. Click **Import**

---

### 2. Select Environment

1. Click the environment dropdown (top right)
2. Select **"Qurbani API - Local"**
3. Verify `baseUrl` is set to `http://localhost:5000`

---

### 3. Start Backend Server

```bash
cd "g:\Qurbani App\backend"
npm start
```

Server should be running on `http://localhost:5000`

---

## Testing Workflow

### Step 1: Health Check
**Endpoint:** `GET /api/health`

Tests if server is running.

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Qurbani Management API is running"
}
```

---

### Step 2: Login (Mobile Authentication)
**Endpoint:** `POST /api/auth/authenticate`

**Body:**
```json
{
  "phoneNumber": "123456",
  "passportNumber": "123456"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "authToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "69a36026cbdd0d7174986745",
    "name": "alkhaleej",
    "phoneNumber": "123456",
    "passportNumber": "123456",
    "qurbaniType": "Cow",
    "accountType": "group",
    "status": "ready"
  },
  "qurbani": { ... }
}
```

✅ **Auto-saves**: The `authToken` is automatically saved to environment variables for subsequent requests.

---

### Step 3: Get Qurbani Status
**Endpoint:** `GET /api/qurbani/status`

**Headers:** 
- `Authorization: Bearer {{authToken}}` (auto-filled)

**Expected Response:**
```json
{
  "success": true,
  "qurbani": {
    "id": "...",
    "qurbaniType": "Sheep",
    "status": "pending",
    ...
  }
}
```

---

### Step 4: Get Group Members
**Endpoint:** `GET /api/group/members`

**Headers:** 
- `Authorization: Bearer {{authToken}}`

**Expected Response:**
```json
{
  "success": true,
  "members": [
    {
      "id": "...",
      "name": "Member 1",
      "status": "ready",
      ...
    }
  ]
}
```

---

### Step 5: Mark Qurbani Ready
**Endpoint:** `POST /api/qurbani/mark-ready`

**Headers:**
- `Authorization: Bearer {{authToken}`
- `Content-Type: application/json`

**Body:**
```json
{
  "notes": "Ready for Qurbani"
}
```

---

## Available Endpoints

### 🔐 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/authenticate` | Mobile login (phone + passport) |
| POST | `/api/auth/login` | Web login (username + password) |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/check` | Check auth status |

### 🐑 Qurbani Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/qurbani/status` | Get user's qurbani status |
| POST | `/api/qurbani/mark-ready` | Mark qurbani as ready |
| GET | `/api/qurbani/details` | Get qurbani details |

### 👥 Group Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/group/members` | Get group members |
| POST | `/api/group/member/mark-ready` | Mark member ready |
| GET | `/api/group/validate` | Validate group status |

### 👤 User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update user profile |

### ⚕️ Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

---

## Test Credentials

### User Account
- **Phone Number:** `123456`
- **Passport Number:** `123456`
- **Expected Name:** `alkhaleej`

---

## Environment Variables

The collection uses these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `baseUrl` | `http://localhost:5000` | API base URL |
| `authToken` | (auto-set) | JWT token from login |
| `userId` | (auto-set) | User ID from login |
| `phoneNumber` | `123456` | Test phone number |
| `passportNumber` | `123456` | Test passport number |

---

## Automated Tests

Each request includes automated tests:

### Login Request Tests:
✅ Status code is 200  
✅ Response has authToken  
✅ Response has user data  
✅ Auth token auto-saved to environment  

### Qurbani Status Tests:
✅ Status code is 200  
✅ Response has qurbani data  

### Group Members Tests:
✅ Status code is 200  
✅ Response has members array  

**View Test Results:** Click "Test Results" tab after running a request

---

## Troubleshooting

### "Could not get any response"
**Cause:** Backend server not running

**Solution:**
```bash
cd "g:\Qurbani App\backend"
npm start
```

---

### "401 Unauthorized"
**Cause:** No auth token or expired token

**Solution:**
1. Run the **"Mobile Login (Authenticate)"** request first
2. Token will be auto-saved
3. Retry the failed request

---

### "Network error"
**Cause:** Wrong baseUrl

**Solution:**
1. Click environment dropdown (top right)
2. Click eye icon to view variables
3. Verify `baseUrl` = `http://localhost:5000`
4. If server is on different port, update it

---

## Running Collection Tests

### Run All Tests at Once

1. Click **Collections** (left sidebar)
2. Click **"Qurbani Management API"** collection
3. Click **"Run"** button
4. Select all requests
5. Click **"Run Qurbani Management API"**

This will run all tests sequentially and show pass/fail summary.

---

## Export Test Results

1. After running collection
2. Click **"Export Results"** button
3. Save as JSON or HTML
4. Share with team

---

## Tips

### 1. Use Collection Runner for Regression Testing
Run entire collection with one click to verify all endpoints work.

### 2. Check Console for Debug Info
View → Show Postman Console (or Ctrl+Alt+C)

### 3. Save Responses as Examples
Right-click request → Save Response → Save as Example

### 4. Use Pre-request Scripts
Auto-generate timestamps, UUIDs, or other dynamic data.

### 5. Create Multiple Environments
- Local Development: `http://localhost:5000`
- Production: `https://api.yourdomain.com`

---

## Next Steps

1. ✅ Import collection and environment
2. ✅ Start backend server
3. ✅ Run health check
4. ✅ Login and verify token is saved
5. ✅ Test qurbani endpoints
6. ✅ Test group endpoints
7. ✅ Run full collection test

---

## Files Included

- `Qurbani_API.postman_collection.json` - Complete API collection
- `Qurbani_API.postman_environment.json` - Local environment setup
- `POSTMAN_GUIDE.md` - This guide

---

**Happy Testing! 🚀**
