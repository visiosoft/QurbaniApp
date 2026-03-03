# User Login API Documentation

## Overview
This API allows users to login using their passport number and phone number (no password required).

---

## Endpoint: User Login

**URL:** `POST /api/auth/user/login`

**Description:** Authenticate a user using passport number and phone number

**Request Body:**
```json
{
  "passportNumber": "ABC123456",
  "phoneNumber": "+966 123 456 789"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "passportNumber": "ABC123456",
    "phoneNumber": "+966 123 456 789",
    "qurbaniType": "Sheep",
    "accountType": "individual",
    "status": "pending",
    "groupId": null,
    "createdAt": "2026-03-01T10:30:00.000Z"
  }
}
```

**Error Response (400 - Validation Error):**
```json
{
  "error": "Validation failed",
  "message": "Passport number and phone number are required"
}
```

**Error Response (401 - Invalid Credentials):**
```json
{
  "error": "Invalid credentials",
  "message": "Passport number not found"
}
```
OR
```json
{
  "error": "Invalid credentials",
  "message": "Phone number does not match"
}
```

**Error Response (500 - Server Error):**
```json
{
  "error": "Server error",
  "message": "Error details..."
}
```

---

## Endpoint: Check User Authentication

**URL:** `GET /api/auth/user/check`

**Description:** Check if a user is currently authenticated

**Success Response (200 - Authenticated):**
```json
{
  "authenticated": true,
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "passportNumber": "ABC123456",
    "phoneNumber": "+966 123 456 789",
    "qurbaniType": "Sheep",
    "accountType": "individual",
    "status": "pending",
    "groupId": null
  }
}
```

**Success Response (200 - Not Authenticated):**
```json
{
  "authenticated": false
}
```

---

## Testing Examples

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "passportNumber": "ABC123456",
    "phoneNumber": "+966 123 456 789"
  }' \
  -c cookies.txt
```

**Check Authentication:**
```bash
curl -X GET http://localhost:5000/api/auth/user/check \
  -b cookies.txt
```

### Using JavaScript (Fetch)

**Login:**
```javascript
const loginUser = async (passportNumber, phoneNumber) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Important for session cookies
      body: JSON.stringify({
        passportNumber,
        phoneNumber
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('Login successful:', data.user);
      return data.user;
    } else {
      console.error('Login failed:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Usage
loginUser('ABC123456', '+966 123 456 789');
```

**Check Authentication:**
```javascript
const checkUserAuth = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/user/check', {
      credentials: 'include' // Important for session cookies
    });

    const data = await response.json();
    
    if (data.authenticated) {
      console.log('User is authenticated:', data.user);
      return data.user;
    } else {
      console.log('User is not authenticated');
      return null;
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return null;
  }
};

// Usage
checkUserAuth();
```

### Using Postman

1. **Login Request:**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/user/login`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "passportNumber": "ABC123456",
       "phoneNumber": "+966 123 456 789"
     }
     ```

2. **Check Auth Request:**
   - Method: GET
   - URL: `http://localhost:5000/api/auth/user/check`
   - (Session cookie will be automatically included if you're using the same Postman session)

---

## Notes

1. **Session Management:**
   - The API uses session-based authentication
   - A session cookie is automatically created upon successful login
   - The session stores: `userId`, `userType`, and `passportNumber`
   - Sessions are managed by `express-session` with MongoDB store

2. **Security:**
   - Passport numbers are automatically converted to uppercase for consistency
   - Both passport number and phone number are trimmed of whitespace
   - Phone numbers must match exactly (including formatting)

3. **Data Returned:**
   - User data excludes the `passwordHash` field for security
   - Group information is populated if the user belongs to a group

4. **Authentication Flow:**
   - User provides passport number and phone number
   - System verifies both credentials match
   - Session is created with user information
   - Client receives session cookie automatically

5. **Logout:**
   - Users can logout using the same endpoint as admin: `POST /api/auth/logout`
   - This will destroy the session and clear the cookie
