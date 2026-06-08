# Frontend-Backend Connection Setup Guide

## Overview

This guide explains how the Campus Lost & Found frontend connects to the backend, especially when running on separate ports (Frontend: 5500, Backend: 5000).

---

## Port Configuration

| Component | Port | URL | Description |
|-----------|------|-----|-------------|
| Backend Server | 5000 | `http://localhost:5000` | Express.js API server |
| Frontend Server | 5500 | `http://localhost:5500` | Static file server (live-server, http-server, or similar) |
| API Base URL | 5000 | `http://localhost:5000/api` | API endpoint base path |

---

## How It Works

### Frontend (`http://localhost:5500`)
- Serves HTML, CSS, and JavaScript files
- Makes HTTP requests to backend API
- Uses `Config.API_URL` to build API endpoint URLs
- Stores JWT token in localStorage

### Backend (`http://localhost:5000`)
- Runs Express.js server
- Provides REST API endpoints
- Handles authentication with JWT tokens
- Manages database operations
- Implements CORS to allow frontend requests

### CORS (Cross-Origin Resource Sharing)
```
Frontend Origin: http://localhost:5500
Backend Origin: http://localhost:5000
CORS Enabled: ✓ YES (see backend/server.js)
```

---

## Configuration File: `frontend/js/config.js`

This is the central configuration file for all frontend API communication:

```javascript
const Config = {
    // Automatically detects backend URL
    API_URL: 'http://localhost:5000/api',
    
    // Backend configuration
    BACKEND: {
        HOST: 'localhost',
        PORT: 5000,
        PROTOCOL: 'http'
    },
    
    // Frontend configuration
    FRONTEND: {
        HOST: 'localhost',
        PORT: 5500,
        PROTOCOL: 'http'
    },
    
    // All API endpoints defined here
    ENDPOINTS: {
        AUTH: { LOGIN: '/auth/login', ... },
        LOST: { GET_ALL: '/lost', ... },
        // ... more endpoints
    }
};
```

---

## How Frontend Makes API Requests

### Step 1: Include Config in HTML
Every HTML file that needs API access must include:
```html
<script src="js/config.js"></script>
```

### Step 2: Use Config in JavaScript
In your JavaScript files, use `Config.API_URL`:
```javascript
// ❌ OLD (hardcoded URL)
const response = await fetch('http://localhost:5000/api/auth/login', {...});

// ✅ NEW (using Config)
const response = await fetch(`${Config.API_URL}/auth/login`, {...});
```

### Step 3: Example - Login Request
```javascript
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(
            `${Config.API_URL}/auth/login`,  // Uses Config
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            }
        );
        
        const data = await response.json();
        
        if (data.token) {
            // Store token for future requests
            localStorage.setItem('authToken', data.token);
            window.location.href = 'dashboard.html';
        } else {
            alert('Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}
```

---

## Backend CORS Configuration

The backend has CORS enabled to allow frontend requests:

**File: `backend/server.js`**
```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());
```

This allows the frontend (running on port 5500) to make requests to the backend (running on port 5000).

---

## Authentication Flow

### 1. Login
```
Frontend (5500)
    ↓ POST /api/auth/login
Backend (5000)
    ↓ Verify credentials
    ↓ Generate JWT token
    ↑ Return token
Frontend (5500)
    ↓ Store token in localStorage
```

### 2. Authenticated Request
```
Frontend (5500)
    ↓ GET /api/lost (with Authorization header)
Backend (5000)
    ↓ Check Authorization header
    ↓ Verify JWT token
    ↓ Query database
    ↑ Return data
Frontend (5500)
    ↓ Display data to user
```

---

## Running Frontend and Backend

### Terminal 1: Start Backend
```bash
cd backend
npm install
node server.js
# Backend running at http://localhost:5000
```

### Terminal 2: Start Frontend
```bash
cd frontend

# Option A: Using live-server
npm install -g live-server
live-server --port=5500

# Option B: Using http-server
npm install -g http-server
http-server -p 5500

# Option C: Using Python
python -m http.server 5500

# Option D: Using Node.js http-server
npx http-server -p 5500
```

### Verify Connection
Open browser and visit:
- Frontend: `http://localhost:5500`
- Backend: `http://localhost:5000` (should show API running message)
- Try login: Should connect to backend successfully

---

## Updated Files for Frontend-Backend Connection

### Files Modified:
1. ✅ `frontend/js/config.js` - **NEW** - Centralized configuration
2. ✅ `frontend/js/auth.js` - Updated to use `Config.API_URL`
3. ✅ `frontend/js/dashboard.js` - Updated to use `Config.API_URL`
4. ✅ `frontend/js/lost.js` - Updated to use `Config.API_URL`
5. ✅ `frontend/js/found.js` - Updated to use `Config.API_URL`
6. ✅ `frontend/js/notifications.js` - Updated to use `Config.API_URL`

### HTML Files Updated:
1. ✅ `frontend/login.html` - Added config.js import
2. ✅ `frontend/register.html` - Added config.js import
3. ✅ `frontend/dashboard.html` - Added config.js import
4. ✅ `frontend/report-lost.html` - Added config.js import
5. ✅ `frontend/report-found.html` - Added config.js import
6. ✅ `frontend/notifications.html` - Added config.js import
7. ✅ `frontend/about.html` - **NEW** - About Us page with team info

---

## Troubleshooting Connection Issues

### Issue 1: "Failed to fetch" Error

**Symptoms:**
```
Uncaught TypeError: Failed to fetch
```

**Causes:**
- Backend not running on port 5000
- CORS not enabled on backend
- Firewall blocking connection
- Incorrect API URL in config

**Solutions:**
```bash
# Check if backend is running
curl http://localhost:5000

# Should see: {"message":"Campus Lost & Found API Running"}

# If not, restart backend:
cd backend
node server.js
```

### Issue 2: CORS Error

**Symptoms:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Causes:**
- CORS not enabled in backend
- Wrong backend origin in config

**Solutions:**
1. Verify CORS enabled in `backend/server.js`
2. Check config URL matches backend port
3. Restart backend after changes

### Issue 3: Invalid Token Error

**Symptoms:**
```
{"error":"Unauthorized"}
```

**Causes:**
- Token expired
- Token not properly stored
- Token not sent in header

**Solutions:**
```javascript
// Verify token is stored
console.log(localStorage.getItem('authToken'));

// Verify token is sent in requests
headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
}
```

### Issue 4: Cannot Find Module Errors

**Symptoms:**
```
Cannot find module 'express'
```

**Causes:**
- Dependencies not installed

**Solutions:**
```bash
cd backend
npm install
# Should install all packages from package.json
```

---

## Network Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User's Computer                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Frontend        │         │  Backend         │          │
│  │  (Port 5500)     │         │  (Port 5000)     │          │
│  ├──────────────────┤         ├──────────────────┤          │
│  │ • HTML/CSS/JS    │         │ • Express.js API │          │
│  │ • Config.js      │         │ • Controllers    │          │
│  │ • UI Components  │◄────────┤ • Database Logic │          │
│  │ • Auth Storage   │  HTTP   │ • Models         │          │
│  │ • State Mgmt     │  Calls  │ • Middleware     │          │
│  └──────────────────┘         └──────────────────┘          │
│           ▲                              │                   │
│           │                              ▼                   │
│           │                     ┌──────────────────┐         │
│           │                     │  MySQL Database  │         │
│           └─────────────────────┤  (Database)      │         │
│                     API Calls    └──────────────────┘         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Common API Request Patterns

### Pattern 1: GET Request (No Authentication)
```javascript
// Public endpoint
const response = await fetch(`${Config.API_URL}/test-db`);
const data = await response.json();
```

### Pattern 2: POST Request (Login)
```javascript
const response = await fetch(`${Config.API_URL}/auth/login`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
});
```

### Pattern 3: Authenticated Request (With Token)
```javascript
const token = localStorage.getItem('authToken');
const response = await fetch(`${Config.API_URL}/lost`, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

### Pattern 4: POST with Authentication
```javascript
const token = localStorage.getItem('authToken');
const response = await fetch(`${Config.API_URL}/lost`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        category: 'Phone',
        item_name: 'iPhone 12',
        // ... more fields
    })
});
```

### Pattern 5: Error Handling
```javascript
try {
    const response = await fetch(`${Config.API_URL}/endpoint`);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
} catch (error) {
    console.error('API Error:', error);
    // Show user-friendly error message
}
```

---

## Development vs Production

### Development Configuration
```javascript
// frontend/js/config.js
const Config = {
    API_URL: 'http://localhost:5000/api',
    BACKEND: { HOST: 'localhost', PORT: 5000 }
};
```

**Running:**
```bash
# Terminal 1: Backend
cd backend && node server.js

# Terminal 2: Frontend
cd frontend && live-server --port=5500
```

---

## Switching Ports (If Needed)

If you need to change ports:

### Option 1: Change Frontend Port
```bash
# Change from 5500 to 8080
live-server --port=8080
# Update: http://localhost:8080
```

### Option 2: Change Backend Port
```bash
# In backend/.env or hardcoded
PORT=3000

# Update config.js
const Config = {
    API_URL: 'http://localhost:3000/api'
};
```

### Option 3: Change Both
Update `frontend/js/config.js`:
```javascript
const Config = {
    API_URL: 'http://localhost:NEW_PORT/api',
    BACKEND: { HOST: 'localhost', PORT: NEW_PORT }
};
```

---

## Environment Variables

### Backend Environment (`.env`)
```env
# Optional - if backend port is configurable
PORT=5000
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=campus_lost_found
```

### Frontend Configuration (Already in `config.js`)
```javascript
// No environment variables needed - uses config.js
// Change as needed for different environments
```

---

## Testing the Connection

### Test 1: Backend is Running
```bash
curl http://localhost:5000
# Expected: {"message":"Campus Lost & Found API Running"}
```

### Test 2: Frontend Can Reach Backend
Open browser console (F12) and run:
```javascript
fetch('http://localhost:5000/api/test-db')
    .then(r => r.json())
    .then(d => console.log(d));
```

### Test 3: CORS is Enabled
If CORS error appears, check backend server.js has:
```javascript
const cors = require('cors');
app.use(cors());
```

---

## Next Steps

1. **Verify Setup:**
   - [ ] Backend running on port 5000
   - [ ] Frontend running on port 5500
   - [ ] Config.js properly configured
   - [ ] All HTML files include config.js script

2. **Test Connection:**
   - [ ] Try accessing http://localhost:5500
   - [ ] Try login with test credentials
   - [ ] Check browser console for errors

3. **Troubleshoot If Needed:**
   - [ ] Check backend console for errors
   - [ ] Check frontend console for errors
   - [ ] Verify CORS is enabled
   - [ ] Verify ports are not in use

4. **Deploy (Future):**
   - [ ] Update config.js with production URLs
   - [ ] Configure backend domain
   - [ ] Test all endpoints
   - [ ] Set up SSL certificates

---

## Summary

The Campus Lost & Found system is now configured to:

✅ Run backend on port 5000  
✅ Run frontend on port 5500  
✅ Use centralized configuration in `config.js`  
✅ Support easy switching between environments  
✅ Handle CORS properly  
✅ Maintain JWT authentication  
✅ Make proper API calls from frontend  

The frontend-backend connection is now complete and ready for development!

---

## Support & Questions

For issues or questions about the setup, refer to:
- [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)
- [API_REFERENCE.md](API_REFERENCE.md)
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
- [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

Contact: support@campuslostfound.com
