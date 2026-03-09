# Postman Testing Guide for Qurbani API

## 📋 Overview
This guide explains how to test your Qurbani Management API using the provided Postman collection and environment files.

## 📂 Files Included

1. **Qurbani_API.postman_collection.json** - Complete API collection with all endpoints
2. **Qurbani_API.postman_environment.json** - Local development environment (localhost:5000)
3. **Qurbani_API_ngrok.postman_environment.json** - ngrok environment for remote testing

## 🚀 Getting Started

### Step 1: Import to Postman
1. Open Postman
2. Click **Import** button (top left)
3. Drag and drop all three files:
   - `Qurbani_API.postman_collection.json`
   - `Qurbani_API.postman_environment.json`
   - `Qurbani_API_ngrok.postman_environment.json`

### Step 2: Select Environment
- **For local testing**: Select "Qurbani API - Local" environment (top right dropdown)
- **For ngrok testing**: Select "Qurbani API - ngrok" environment

### Step 3: Start Backend Server
```powershell
cd "G:\Qurbani App\backend"
npm start
```

Server should be running on port 5000.

## 🔐 Authentication Flow

### Testing Mobile Login (Recommended First Step)

1. **Open**: Authentication → Mobile Login (Authenticate)
2. **Body** should have:
   ```json
   {
       "phoneNumber": "123123",
       "passportNumber": "123123"
   }
   ```
3. **Click Send**
4. **Result**: If successful, the auth token is automatically saved to environment variable `{{authToken}}`

### Testing Web Login

1. **Open**: Authentication → Admin/User Login
2. **Body**:
   ```json
   {
       "username": "123123",
       "password": "123123"
   }
   ```

## 📱 Testing Mobile App Endpoints

### 1. Get User Profile (Mobile Refresh)
**Purpose**: Refresh cached user data (important for group functionality)

- **Endpoint**: GET `/api/auth/user/profile`
- **Headers**: Authorization: Bearer {{authToken}}
- **Returns**: Fresh user data from database including accountType and groupId

### 2. Get Qurbani Status
**Purpose**: Check current qurbani status and countdown timer

- **Endpoint**: GET `/api/qurbani/status`
- **Returns**: 
  - status: 'pending', 'ready', 'completed'
  - readyAt: timestamp when marked ready (for 6-hour countdown)
  - completedAt: timestamp when completed

### 3. Mark Qurbani Ready
**Purpose**: Mark qurbani as ready and start countdown timer

- **Endpoint**: POST `/api/qurbani/mark-ready`
- **Body**:
  ```json
  {
      "notes": "Ready for Qurbani"
  }
  ```
- **Effect**: Sets readyAt timestamp and status to 'ready'

## 👥 Testing Group Functionality

### 1. Get Group Members
**Purpose**: View all members in your group

- **Endpoint**: GET `/api/group/members`
- **Required**: User must be in a group (accountType: 'group')
- **Returns**: Array of group members with their qurbani status

### 2. Mark Group Member Ready
**Purpose**: Group representative marks a member as ready

- **Endpoint**: POST `/api/group/member/mark-ready`
- **Body**:
  ```json
  {
      "memberId": "USER_ID_HERE"
  }
  ```
- **Note**: Only group representative can mark members ready

### 3. Validate Group
**Purpose**: Check if group is complete and ready

- **Endpoint**: GET `/api/group/validate`
- **Returns**: Validation status and any issues

## 🧪 Test Scenarios

### Scenario 1: Individual User Flow
1. Mobile Login with phone: "123456", passport: "123456"
2. Get Qurbani Status
3. Mark Qurbani Ready
4. Wait and check status to see countdown timer (readyAt timestamp)

### Scenario 2: Group User Flow (Zulfiqar Khan)
1. Mobile Login with phone: "123123", passport: "123123"
2. **Refresh User Profile** (Important! Gets latest group data)
3. Get Group Members - should see 3 members
4. Mark Group Member Ready (for each member)
5. Get Qurbani Status - check group status

### Scenario 3: Testing User Data Refresh
1. Login as any user
2. Get User Profile (Mobile Refresh)
3. Compare accountType - should be 'group' or 'individual'
4. If 'group', check groupId is populated
5. Get Group Members to verify group association

## 🌐 Testing with ngrok

### Setup
1. Switch to "Qurbani API - ngrok" environment
2. Verify baseUrl is: `https://ingrained-unserved-irmgard.ngrok-free.dev`
3. Make sure backend server is running locally

### ngrok Warning Page
When testing through ngrok, you may see a warning page:
- **In browser**: Click "Visit Site" button
- **In Postman**: Add header `ngrok-skip-browser-warning: true` to skip warning

### Example Request with ngrok
```
GET https://ingrained-unserved-irmgard.ngrok-free.dev/api/group/members
Authorization: Bearer <your-token>
ngrok-skip-browser-warning: true
```

## 🔧 Troubleshooting

### "Unauthorized" Error
- **Cause**: No auth token or expired token
- **Fix**: Run Mobile Login request first to get fresh token

### "Cannot read property 'groupId' of null"
- **Cause**: User not in a group
- **Fix**: Verify user accountType is 'group' using Get User Profile

### "Port 5000 in use"
```powershell
# Kill all node processes
Stop-Process -Name node -Force

# Restart server
cd "G:\Qurbani App\backend"
npm start
```

### Empty Members Array
- **Cause**: Cached user data showing accountType: 'individual'
- **Fix**: Call "Get User Profile (Mobile Refresh)" endpoint first

## 📊 Environment Variables Reference

| Variable | Description | Auto-Set |
|----------|-------------|----------|
| baseUrl | API server URL | ❌ Manual |
| authToken | JWT authentication token | ✅ After login |
| userId | Current user ID | ✅ After login |
| phoneNumber | Test phone number | ❌ Manual |
| passportNumber | Test passport number | ❌ Manual |

## 💡 Tips

1. **Always login first** - The authToken is required for most endpoints
2. **Use test scripts** - Collection includes automatic tests that run after each request
3. **Check Console** - Postman console shows test results and any errors
4. **Save tokens** - authToken is automatically saved after successful login
5. **Test sequences** - Follow the test scenarios to verify complete user flows
6. **Refresh user data** - Call the user profile refresh endpoint after backend changes

## 🎯 Key Endpoints Summary

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| /api/auth/authenticate | POST | Mobile login | ❌ |
| /api/auth/user/profile | GET | Refresh cached user data | ✅ |
| /api/qurbani/status | GET | Get qurbani status & timer | ✅ |
| /api/qurbani/mark-ready | POST | Start 6-hour countdown | ✅ |
| /api/group/members | GET | View group members | ✅ |
| /api/group/member/mark-ready | POST | Mark member ready | ✅ |

## 📞 Support

If you encounter issues:
1. Check backend server is running
2. Verify environment is selected
3. Ensure auth token is valid
4. Check backend logs for error details
