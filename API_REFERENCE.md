# Campus Lost & Found - API Reference

## Base URL
```
http://localhost:5000
```

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register User
```
POST /api/auth/register
Content-Type: application/json

Body:
{
    "full_name": "John Doe",
    "student_id": "S123456",
    "email": "john@example.com",
    "password": "SecurePassword123"
}

Response (201):
{
    "success": true,
    "message": "User registered successfully",
    "token": "eyJhbGc...",
    "userId": 1,
    "userName": "John Doe"
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

Body:
{
    "email": "john@example.com",
    "password": "SecurePassword123"
}

Response (200):
{
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGc...",
    "userId": 1,
    "userName": "John Doe"
}
```

### Verify Token
```
POST /api/auth/verify
Authorization: Bearer <token>

Response (200):
{
    "success": true,
    "user": {
        "id": 1,
        "email": "john@example.com",
        "full_name": "John Doe"
    }
}
```

### Change Password
```
POST /api/auth/changePassword
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
    "oldPassword": "OldPassword123",
    "newPassword": "NewPassword456"
}

Response (200):
{
    "success": true,
    "message": "Password changed successfully"
}
```

---

## 📌 Lost Items Endpoints

### Create Lost Item
```
POST /api/lost/create
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
    "category": "Phone",
    "item_name": "Samsung Galaxy S21",
    "brand": "Samsung",
    "color": "Black",
    "description": "Black Samsung Galaxy S21 with glass back",
    "last_seen_location": "Library Building, 3rd Floor"
}

Response (201):
{
    "success": true,
    "message": "Lost item reported successfully",
    "itemId": 15
}
```

### Get User's Lost Items
```
GET /api/lost/myItems
Authorization: Bearer <token>

Response (200):
{
    "success": true,
    "items": [
        {
            "id": 15,
            "category": "Phone",
            "item_name": "Samsung Galaxy S21",
            "status": "searching",
            "created_at": "2024-01-15T10:30:00"
        }
    ]
}
```

### Get All Active Lost Items
```
GET /api/lost

Response (200):
{
    "success": true,
    "items": [
        {
            "id": 15,
            "category": "Phone",
            "item_name": "Samsung Galaxy S21",
            "brand": "Samsung",
            "color": "Black",
            "description": "Black Samsung Galaxy S21",
            "last_seen_location": "Library",
            "status": "searching",
            "user_id": 1
        }
    ]
}
```

### Get Specific Lost Item
```
GET /api/lost/:id

Response (200):
{
    "success": true,
    "item": {
        "id": 15,
        "category": "Phone",
        "item_name": "Samsung Galaxy S21",
        "brand": "Samsung",
        "color": "Black",
        "description": "Black Samsung Galaxy S21 with glass back",
        "last_seen_location": "Library Building, 3rd Floor",
        "status": "searching",
        "created_at": "2024-01-15T10:30:00",
        "images": []
    }
}
```

### Update Lost Item
```
PUT /api/lost/:id
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
    "description": "Updated description",
    "status": "found"
}

Response (200):
{
    "success": true,
    "message": "Lost item updated successfully"
}
```

### Delete Lost Item
```
DELETE /api/lost/:id
Authorization: Bearer <token>

Response (200):
{
    "success": true,
    "message": "Lost item deleted successfully"
}
```

### Search Lost Items
```
GET /api/lost/search?q=samsung

Response (200):
{
    "success": true,
    "items": [
        {
            "id": 15,
            "item_name": "Samsung Galaxy S21",
            "category": "Phone",
            "match_score": 95
        }
    ]
}
```

### Get Matches for Lost Item
```
GET /api/lost/:id/matches
Authorization: Bearer <token>

Response (200):
{
    "success": true,
    "matches": [
        {
            "id": 1,
            "lost_item_id": 15,
            "found_item_id": 8,
            "score": 92,
            "match_status": "pending",
            "found_item_name": "Samsung S21"
        }
    ]
}
```

### Get Lost Item Statistics
```
GET /api/lost/user/:userId/stats

Response (200):
{
    "success": true,
    "stats": {
        "searching": 5,
        "found": 2,
        "collected": 1
    }
}
```

---

## 📌 Found Items Endpoints

### Create Found Item
```
POST /api/found/create
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
    "category": "Phone",
    "item_name": "Samsung S21",
    "brand": "Samsung",
    "color": "Black",
    "description": "Found a black Samsung S21",
    "found_location": "Near Campus Gate"
}

Response (201):
{
    "success": true,
    "message": "Found item reported successfully",
    "itemId": 12
}
```

### Get User's Found Items
```
GET /api/found/myItems
Authorization: Bearer <token>

Response (200):
{
    "success": true,
    "items": [
        {
            "id": 12,
            "category": "Phone",
            "item_name": "Samsung S21",
            "status": "available"
        }
    ]
}
```

### Get All Available Found Items
```
GET /api/found

Response (200):
{
    "success": true,
    "items": [...]
}
```

### Other Found Item Operations
Same as Lost Items (Get, Update, Delete, Search)

---

## 🔗 Match Endpoints

### Get User's Matches
```
GET /api/match/myMatches
Authorization: Bearer <token>

Response (200):
{
    "success": true,
    "matches": [
        {
            "id": 1,
            "lost_item_id": 15,
            "found_item_id": 12,
            "score": 92,
            "match_status": "pending",
            "lostItem": {
                "item_name": "Samsung Galaxy S21",
                "color": "Black"
            },
            "foundItem": {
                "item_name": "Samsung S21",
                "color": "Black"
            }
        }
    ]
}
```

### Get Match Details
```
GET /api/match/:id
Authorization: Bearer <token>

Response (200):
{
    "success": true,
    "match": {
        "id": 1,
        "score": 92,
        "match_status": "pending",
        "lostItem": {...},
        "foundItem": {...}
    }
}
```

### Accept Match
```
POST /api/match/accept
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
    "matchId": 1
}

Response (200):
{
    "success": true,
    "message": "Match accepted successfully"
}
```

### Reject Match
```
POST /api/match/reject
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
    "matchId": 1
}

Response (200):
{
    "success": true,
    "message": "Match rejected"
}
```

---

## 🔔 Notification Endpoints

### Get User's Notifications
```
GET /api/notifications
Authorization: Bearer <token>

Response (200):
{
    "success": true,
    "notifications": [
        {
            "id": 5,
            "match_id": 1,
            "type": "match",
            "title": "Potential Match Found!",
            "message": "Someone found your item",
            "score": 92,
            "is_read": false,
            "created_at": "2024-01-15T10:30:00"
        }
    ]
}
```

### Mark Notification as Read
```
POST /api/notifications/read/:id
Authorization: Bearer <token>

Response (200):
{
    "success": true,
    "message": "Notification marked as read"
}
```

### Mark All as Read
```
POST /api/notifications/readAll
Authorization: Bearer <token>

Response (200):
{
    "success": true,
    "message": "All notifications marked as read"
}
```

---

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "student_id": "S123456",
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

### Create Lost Item (with token)
```bash
curl -X POST http://localhost:5000/api/lost/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "category": "Phone",
    "item_name": "Samsung Galaxy S21",
    "brand": "Samsung",
    "color": "Black",
    "description": "Black Samsung Galaxy S21",
    "last_seen_location": "Library"
  }'
```

### Get All Lost Items
```bash
curl http://localhost:5000/api/lost
```

---

## Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - No/invalid token |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate data |
| 500 | Server Error |

---

## Error Response Format

```json
{
    "success": false,
    "message": "Error description"
}
```

---

## Rate Limiting

Currently no rate limiting. Add in production:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## CORS Configuration

Current setup allows all origins. For production, update:

```javascript
app.use(cors({
    origin: 'https://your-domain.com',
    credentials: true
}));
```

---

## Pagination (Future Enhancement)

```
GET /api/lost?page=1&limit=10

Response:
{
    "success": true,
    "items": [...],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 45,
        "pages": 5
    }
}
```

---

## WebSocket Events (Future Enhancement)

```javascript
// Real-time notifications
socket.on('newMatch', (match) => {
    console.log('New match:', match);
});

// Real-time item updates
socket.on('itemUpdate', (item) => {
    console.log('Item updated:', item);
});
```

---

**API Documentation v1.0**
Last Updated: January 2024
