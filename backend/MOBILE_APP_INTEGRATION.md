# Qurbani Mobile App - Backend Integration Guide

## Overview
This guide explains how to integrate the mobile app with the backend API for qurbani management.

---

## Authentication Flow

### 1. User Login

**Endpoint:** `POST http://192.168.1.11:5000/api/auth/authenticate`

**Request:**
```json
{
  "phoneNumber": "123456",
  "passportNumber": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "69a36026cbdd0d7174986745",
    "name": "alkhaleej",
    "passportNumber": "123456",
    "phoneNumber": "123456",
    "qurbaniType": "Sheep",
    "accountType": "individual",
    "status": "pending",
    "groupId": null,
    "createdAt": "2026-02-28T21:37:42.513Z"
  },
  "qurbani": {
    "id": "69a36026cbdd0d7174986747",
    "qurbaniType": "Sheep",
    "accountType": "individual",
    "status": "pending",
    "createdAt": "2026-02-28T21:37:42.753Z",
    "completedAt": null,
    "notes": ""
  }
}
```

**What to Store:**
- `authToken` - For future API calls
- `user` object - User information
- `qurbani.id` - **Important:** This is the qurbani ID needed for updates
- `qurbani.status` - Current qurbani status

---

## Dashboard Display

### Use Login Data Directly

After successful login, you have **all the data you need** in the response:

```javascript
// From login response
const userData = response.user;
const qurbaniData = response.qurbani;

// Display on dashboard:
{
  name: userData.name,
  phoneNumber: userData.phoneNumber,
  passportNumber: userData.passportNumber,
  qurbaniType: qurbaniData.qurbaniType,
  status: qurbaniData.status,
  qurbaniId: qurbaniData.id  // Use this for status updates
}
```

**No additional API calls needed for dashboard display!**

---

## Update Qurbani Status

### Mark as Ready

**Endpoint:** `PUT http://192.168.1.11:5000/api/qurbani/{qurbaniId}`

**Use the `qurbani.id` from login response**

**Request:**
```json
{
  "status": "ready"
}
```

**Example:**
```javascript
// Get qurbaniId from login response
const qurbaniId = loginResponse.qurbani.id;

// Update status
PUT http://192.168.1.11:5000/api/qurbani/${qurbaniId}
Body: { "status": "ready" }
```

**Success Response:**
```json
{
  "success": true,
  "message": "Qurbani status updated to ready",
  "qurbani": {
    "id": "69a36026cbdd0d7174986747",
    "status": "ready",
    ...
  }
}
```

---

## Optional: Refresh Qurbani Data

If you need to refresh the qurbani data (e.g., after app restart):

**Endpoint:** `GET http://192.168.1.11:5000/api/qurbani/my`

Or

**Endpoint:** `GET http://192.168.1.11:5000/api/auth/user/qurbani`

**Response:**
```json
{
  "success": true,
  "qurbani": {
    "id": "69a36026cbdd0d7174986747",
    "qurbaniType": "Sheep",
    "accountType": "individual",
    "status": "ready",
    "createdAt": "2026-02-28T21:37:42.753Z",
    "completedAt": null,
    "notes": ""
  }
}
```

---

## Complete Integration Example

### React Native / Expo

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Login
async function login(phoneNumber, passportNumber) {
  try {
    const response = await fetch('http://192.168.1.11:5000/api/auth/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber,
        passportNumber
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Store auth token
      await AsyncStorage.setItem('authToken', data.authToken);
      
      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
      // Store qurbani data (including qurbani ID)
      await AsyncStorage.setItem('qurbani', JSON.stringify(data.qurbani));
      
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// 2. Display Dashboard
async function getDashboardData() {
  try {
    // Get data from storage (already fetched during login)
    const user = JSON.parse(await AsyncStorage.getItem('user'));
    const qurbani = JSON.parse(await AsyncStorage.getItem('qurbani'));
    
    return {
      name: user.name,
      phoneNumber: user.phoneNumber,
      passportNumber: user.passportNumber,
      qurbaniType: qurbani.qurbaniType,
      status: qurbani.status,
      qurbaniId: qurbani.id
    };
  } catch (error) {
    console.error('Get dashboard data error:', error);
    throw error;
  }
}

// 3. Update Status to Ready
async function markAsReady() {
  try {
    // Get qurbani ID from storage
    const qurbani = JSON.parse(await AsyncStorage.getItem('qurbani'));
    const authToken = await AsyncStorage.getItem('authToken');
    
    const response = await fetch(`http://192.168.1.11:5000/api/qurbani/${qurbani.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`  // If using JWT auth
      },
      credentials: 'include',  // If using session auth
      body: JSON.stringify({
        status: 'ready'
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Update stored qurbani data
      await AsyncStorage.setItem('qurbani', JSON.stringify(data.qurbani));
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Mark as ready error:', error);
    throw error;
  }
}

// 4. Refresh Qurbani Data (optional)
async function refreshQurbaniData() {
  try {
    const authToken = await AsyncStorage.getItem('authToken');
    
    const response = await fetch('http://192.168.1.11:5000/api/qurbani/my', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      credentials: 'include'
    });

    const data = await response.json();

    if (response.ok) {
      await AsyncStorage.setItem('qurbani', JSON.stringify(data.qurbani));
      return data.qurbani;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Refresh qurbani data error:', error);
    throw error;
  }
}
```

---

## Status Flow

```
pending → ready → done
```

- **pending**: Initial status when user is created
- **ready**: User marks themselves as ready for qurbani
- **done**: Admin marks as done after qurbani is completed (user will receive notification)

---

## Key Points

1. **Login Response Contains Everything**: The `POST /api/auth/authenticate` endpoint returns both user and qurbani data
2. **Store Qurbani ID**: Save `qurbani.id` from login response - you'll need it for updates
3. **No Separate Qurbani Fetch Needed**: Use the data from login for the dashboard
4. **Update Endpoint**: Use `PUT /api/qurbani/{qurbaniId}` to update status
5. **Session-Based Auth**: The API uses session cookies, so use `credentials: 'include'`

---

## Troubleshooting

### AsyncStorage Error: "Passing null/undefined as value"

**Problem:** Trying to store undefined `authToken`

**Solution:** The API now returns `authToken` in the response. Make sure you're using the updated endpoint:
```
POST http://192.168.1.11:5000/api/auth/authenticate
```

### Cannot Find Qurbani ID

**Problem:** Don't have qurbani ID for updates

**Solution:** The qurbani ID is in the login response at `response.qurbani.id`. Store it in AsyncStorage:
```javascript
await AsyncStorage.setItem('qurbaniId', data.qurbani.id);
```

### Status Update Fails

**Problem:** PUT request to update status fails

**Solution:** Make sure you're:
1. Using the correct qurbani ID from login response
2. Including credentials: `credentials: 'include'`
3. Using the full URL: `http://192.168.1.11:5000/api/qurbani/{id}`

---

## API Summary

| Endpoint | Method | Purpose | Response Includes |
|----------|--------|---------|-------------------|
| `/api/auth/authenticate` | POST | Login | ✅ authToken, user, qurbani |
| `/api/qurbani/my` | GET | Get user's qurbani | qurbani data |
| `/api/qurbani/:id` | PUT | Update status | Updated qurbani |
| `/api/qurbani/:id/mark-done` | POST | Mark as done (admin) | Updated qurbani |

**Recommended Flow:**
1. Login → Get authToken, user, and qurbani data
2. Display dashboard using stored data
3. Update status using stored qurbani.id
4. Refresh data if needed using `/api/qurbani/my`
