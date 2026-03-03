# User Authentication API

## Endpoint
```
POST /api/auth/authenticate
```

## Description
Authenticate a user using their **phone number** and **passport number**. This endpoint creates a user session upon successful authentication.

---

## Request

### Headers
```
Content-Type: application/json
```

### Body Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| phoneNumber | string | Yes | User's phone number (e.g., "+966 123 456 789") |
| passportNumber | string | Yes | User's passport number (e.g., "ABC123456") |

### Example Request
```json
{
  "phoneNumber": "+966 123 456 789",
  "passportNumber": "ABC123456"
}
```

---

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Authentication successful",
  "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "name": "Ahmed Mohammed",
    "passportNumber": "ABC123456",
    "phoneNumber": "+966 123 456 789",
    "qurbaniType": "Sheep",
    "accountType": "individual",
    "status": "pending",
    "groupId": null,
    "createdAt": "2026-03-01T10:30:00.000Z"
  },
  "qurbani": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j2",
    "qurbaniType": "Sheep",
    "accountType": "individual",
    "status": "pending",
    "createdAt": "2026-03-01T10:30:00.000Z",
    "completedAt": null,
    "notes": ""
  }
}
```

**Note:** The `qurbani` field contains the user's qurbani record with the qurbani ID needed for status updates.

### Error Responses

#### 400 - Validation Error
```json
{
  "error": "Validation failed",
  "message": "Phone number and passport number are required"
}
```

#### 401 - Invalid Phone Number
```json
{
  "error": "Invalid credentials",
  "message": "Phone number not found"
}
```

#### 401 - Invalid Passport Number
```json
{
  "error": "Invalid credentials",
  "message": "Passport number does not match"
}
```

#### 500 - Server Error
```json
{
  "error": "Server error",
  "message": "Error details..."
}
```

---

## Session Management

Upon successful authentication, the API automatically:
- Creates a server-side session
- Sets a session cookie in the response
- Stores: `userId`, `userType`, `phoneNumber`, `passportNumber`

The session cookie will be included in subsequent requests automatically by the browser.

---

## Usage Examples

### cURL
```bash
curl -X POST http://192.168.1.11:5000/api/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+966 123 456 789",
    "passportNumber": "ABC123456"
  }' \
  -c cookies.txt
```

### JavaScript (Fetch API)
```javascript
async function authenticateUser(phoneNumber, passportNumber) {
  try {
    const response = await fetch('http://192.168.1.11:5000/api/auth/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Important: include session cookie
      body: JSON.stringify({
        phoneNumber,
        passportNumber
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Authentication successful:', data.user);
      return data.user;
    } else {
      console.error('Authentication failed:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Usage
authenticateUser('+966 123 456 789', 'ABC123456')
  .then(user => {
    console.log('Logged in user:', user);
  })
  .catch(error => {
    console.error('Login failed:', error);
  });
```

### Axios
```javascript
const axios = require('axios');

async function authenticateUser(phoneNumber, passportNumber) {
  try {
    const response = await axios.post(
      'http://192.168.1.11:5000/api/auth/authenticate',
      {
        phoneNumber,
        passportNumber
      },
      {
        withCredentials: true // Important: include session cookie
      }
    );

    console.log('Authentication successful:', response.data.user);
    return response.data.user;
  } catch (error) {
    if (error.response) {
      console.error('Authentication failed:', error.response.data.message);
      throw new Error(error.response.data.message);
    } else {
      console.error('Error:', error.message);
      throw error;
    }
  }
}

// Usage
authenticateUser('+966 123 456 789', 'ABC123456');
```

### React Example
```javascript
import { useState } from 'react';

function LoginForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://192.168.1.11:5000/api/auth/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          phoneNumber,
          passportNumber
        })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        console.log('Login successful!');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="tel"
        placeholder="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Passport Number"
        value={passportNumber}
        onChange={(e) => setPassportNumber(e.target.value)}
        required
      />
      <button type="submit">Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {user && <p>Welcome, {user.name}!</p>}
    </form>
  );
}
```

---

## Testing

### Test with valid credentials
```bash
curl -X POST http://192.168.1.11:5000/api/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+966 123 456 789",
    "passportNumber": "ABC123456"
  }'
```

### Test with missing fields
```bash
curl -X POST http://192.168.1.11:5000/api/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+966 123 456 789"
  }'
```

### Test with invalid phone number
```bash
curl -X POST http://192.168.1.11:5000/api/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+966 999 999 999",
    "passportNumber": "ABC123456"
  }'
```

### Test with invalid passport
```bash
curl -X POST http://192.168.1.11:5000/api/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+966 123 456 789",
    "passportNumber": "WRONG123"
  }'
```

---

## Additional Endpoints

### Get Current User's Qurbani

**URL:** `GET /api/auth/user/qurbani`

**Description:** Get the authenticated user's qurbani record

**Authentication:** Session-based (requires login)

**Success Response (200 OK):**
```json
{
  "success": true,
  "qurbani": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j2",
    "qurbaniType": "Sheep",
    "accountType": "individual",
    "status": "pending",
    "userId": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Ahmed Mohammed",
      "passportNumber": "ABC123456",
      "phoneNumber": "+966 123 456 789"
    },
    "groupId": null,
    "createdAt": "2026-03-01T10:30:00.000Z",
    "completedAt": null,
    "notes": ""
  }
}
```

**Alternative Endpoint:** `GET /api/qurbani/my`

Both endpoints return the same data

---

## Update Qurbani Status

**URL:** `PUT /api/qurbani/:id`

**Description:** Update the status of a qurbani record

**Request Body:**
```json
{
  "status": "ready",
  "notes": "Optional notes"
}
```

**Status Values:**
- `pending` - Initial status
- `ready` - Ready for qurbani
- `done` - Completed

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Qurbani status updated to ready",
  "qurbani": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j2",
    "qurbaniType": "Sheep",
    "accountType": "individual", 
    "status": "ready",
    "notes": "Optional notes"
  },
  "notificationSent": false
}
```

**Example cURL:**
```bash
curl -X PUT http://192.168.1.11:5000/api/qurbani/65f1a2b3c4d5e6f7g8h9i0j2 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ready"
  }' \
  -b cookies.txt
```

---

## Notes

1. **Passport Number Format**: Automatically converted to uppercase and trimmed
2. **Phone Number Format**: Trimmed of whitespace, must match exactly as stored in database
3. **Session Duration**: Default session expiration is 24 hours (configurable in server settings)
4. **Security**: 
   - Session cookies are HTTP-only
   - Credentials are validated against the database
   - No password hashing needed (passport used as identifier)
5. **CORS**: Ensure CORS is configured to allow credentials from your frontend domain

---

## Comparison with Other Endpoints

| Endpoint | Field Names | Use Case |
|----------|-------------|----------|
| `/api/auth/authenticate` | `phoneNumber`, `passportNumber` | **Recommended** - Clear, explicit field names |
| `/api/auth/login` | `username` (phone), `password` (passport) | Admin + User combined login |
| `/api/auth/user/login` | `passportNumber`, `phoneNumber` | Alternative user login |

**Recommendation**: Use `/api/auth/authenticate` for the clearest and most maintainable code.
