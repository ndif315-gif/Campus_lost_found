
# Campus Lost & Found - Complete Setup & Usage Guide

## 🎯 Project Overview

Campus Lost & Found is a comprehensive web application designed to help students on campus reunite with their lost items and return found items to their owners. The system uses intelligent matching algorithms to automatically find potential matches between lost and found items.

### Key Features

✨ **Multi-Language Support** (English & French)
- Complete i18n implementation
- Language selector on all pages
- User language preference storage

🔍 **Intelligent Matching System**
- Fuzzy string matching (handles typos and spelling errors)
- Case-insensitive matching
- Smart algorithm that ignores stop words
- 0-100% match scoring
- Language-independent matching

📸 **Image Upload & Management**
- Drag-and-drop image upload
- Support for photos of items
- Image storage and retrieval

🔔 **Real-Time Notifications**
- Match notifications for both users
- Notification modal with match details
- Mark as read functionality
- Real-time refresh (30-second intervals)

👥 **User Management**
- Secure JWT authentication
- User profiles and statistics
- Password hashing with bcrypt
- Login/Register with email verification

📊 **Dashboard & Management**
- View lost and found items
- Track item status (searching, found, collected)
- View recent matches
- Monitor notifications

🎨 **Beautiful & Responsive UI**
- Modern gradient design
- Mobile-first approach
- Works on all devices (mobile, tablet, desktop)
- Smooth animations and transitions
- Customizable colors via CSS variables

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Create Database**
```bash
mysql -u root -p < database.sql
```

3. **Configure Environment**
Create `.env` file in backend directory:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=campus_lost_found8
JWT_SECRET=your-secret-key-here
PORT=5000
```

4. **Start Backend Server**
```bash
npm start
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. **No Installation Needed**
The frontend is a static HTML/CSS/JavaScript application. Simply serve the `frontend` directory with any web server.

2. **Local Testing**
You can open `frontend/login.html` directly in a browser, or use a simple HTTP server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server
```

3. **Update API Base URL (if needed)**
In `frontend/js/auth.js` and other JS files, ensure the API URL matches your backend:
```javascript
const API_URL = 'http://localhost:5000';
```

## 📋 Database Schema

### Tables

#### users
Stores user account information
- id, full_name, student_id, email, password
- phone, language, profile_image
- is_active, last_login, created_at, updated_at

#### lost_items
Lost items reported by users
- id, user_id, category, item_name, brand
- color, description, last_seen_location
- status (searching/found/collected)
- found_by_user_id, created_at, updated_at

#### found_items
Found items reported by users
- id, user_id, category, item_name, brand
- color, description, found_location
- status (available/claimed/returned)
- claimed_by_user_id, created_at, updated_at

#### item_images
Images associated with items
- id, lost_item_id, found_item_id
- image_url, image_path, file_size

#### matches
Potential matches between lost and found items
- id, lost_item_id, found_item_id
- score (0-100), is_active, match_status
- created_at, updated_at

#### notifications
User notifications about matches
- id, user_id, match_id, type
- title, message, score, is_read
- created_at, read_at

#### messages
User-to-user messaging
- id, sender_id, receiver_id
- match_id, message_text, is_read
- created_at

## 🎨 Customizing the UI

### Colors

Edit CSS variables in `frontend/css/style.css`:

```css
:root {
    /* PRIMARY COLORS - Change these for brand colors */
    --primary-color: #2563eb;        /* Main button color */
    --primary-dark: #1d4ed8;         /* Darker shade */
    --primary-light: #dbeafe;        /* Light background */
    
    /* SECONDARY COLORS */
    --secondary-color: #003366;      /* Secondary accent */
    
    /* STATUS COLORS */
    --success-color: #16a34a;        /* Found/Success */
    --danger-color: #dc2626;         /* Errors */
    --warning-color: #ea580c;        /* Warnings */
    --info-color: #0891b2;           /* Info */
    
    /* NEUTRAL COLORS */
    --text-dark: #1f2937;            /* Text color */
    --text-light: #6b7280;           /* Secondary text */
    --bg-light: #f9fafb;             /* Light background */
    --bg-white: #ffffff;             /* Main background */
    
    /* SPACING */
    --spacing-sm: 1rem;
    --spacing-md: 1.5rem;
    --spacing-lg: 2rem;
    
    /* BORDER RADIUS */
    --radius-lg: 0.75rem;            /* Corner roundness */
}
```

### Background Images

Replace images in `frontend/images/`:
- `login-bg.jpg` - Login page background
- `signup-bg.jpg` - Register page background
- `dashboard-bg.jpg` - Dashboard background

### Fonts

Change font family in body style:
```css
body {
    font-family: 'Your Font', sans-serif;
}
```

## 🔒 Security Best Practices

1. **Password Storage**
   - Passwords are hashed using bcrypt with 10 salt rounds
   - Never store plain text passwords

2. **Authentication**
   - Use JWT tokens for API authentication
   - Tokens expire after 7 days
   - Include token in Authorization header: `Bearer <token>`

3. **Authorization**
   - Users can only view/edit/delete their own items
   - Implement role-based access control for admins

4. **Input Validation**
   - All inputs are validated on both frontend and backend
   - Use parameterized queries to prevent SQL injection
   - Sanitize all user input

5. **CORS Configuration**
   - Currently allows all origins for development
   - Restrict to specific domains in production:
   ```javascript
   app.use(cors({
       origin: 'https://your-domain.com'
   }));
   ```

## 🧠 Smart Matching Algorithm

The matching system uses multiple factors:

### Matching Factors (Weights)
- **Category (25%)** - Item type must match
- **Item Name (25%)** - Main identifier
- **Brand (15%)** - Additional identifier
- **Color (15%)** - Visual identifier
- **Description (20%)** - Detailed matching

### Algorithm Features
1. **Fuzzy Matching** - Handles typos (e.g., "Samung" matches "Samsung")
2. **Levenshtein Distance** - Calculates minimum edits needed
3. **Stop Word Removal** - Ignores common words in descriptions
4. **Case Insensitive** - Handles upper/lowercase variations
5. **Partial Matches** - Recognizes substring matches

### Example
```
Lost: "Black Samsung Galaxy S21 with cracked screen"
Found: "Black Samung S21 with broken screen"
Score: 85% (Good match despite typo)
```

## 🌐 Multi-Language Support

### Supported Languages
- **English** (en)
- **French** (fr)

### Adding New Language

Edit `frontend/js/i18n.js`:

```javascript
translations: {
    es: {  // Spanish
        auth: {
            login: 'Iniciar sesión',
            register: 'Registrarse',
            // ... more translations
        }
    }
}
```

Update language selector in HTML:
```html
<select id="languageSelect">
    <option value="en">English</option>
    <option value="fr">Français</option>
    <option value="es">Español</option>
</select>
```

## 📱 Mobile Responsiveness

The application is fully responsive with breakpoints:

- **Mobile (320px - 480px)** - Single column, touch-optimized
- **Tablet (481px - 768px)** - Two columns
- **Desktop (769px+)** - Full layout with sidebar

Testing: Use browser DevTools (F12) to test different viewport sizes.

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify token
- `POST /api/auth/changePassword` - Change password

### Lost Items
- `POST /api/lost/create` - Create lost item
- `GET /api/lost` - Get all lost items
- `GET /api/lost/myItems` - Get user's lost items
- `GET /api/lost/:id` - Get specific item
- `PUT /api/lost/:id` - Update lost item
- `DELETE /api/lost/:id` - Delete lost item
- `GET /api/lost/search?q=keyword` - Search items
- `GET /api/lost/:id/matches` - Get matches

### Found Items
- `POST /api/found/create` - Create found item
- `GET /api/found` - Get all found items
- `GET /api/found/myItems` - Get user's found items
- `GET /api/found/:id` - Get specific item
- `PUT /api/found/:id` - Update found item
- `DELETE /api/found/:id` - Delete found item

### Matches
- `GET /api/match/myMatches` - Get user's matches
- `GET /api/match/:id` - Get match details
- `POST /api/match/accept` - Accept match
- `POST /api/match/reject` - Reject match

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/read/:id` - Mark as read
- `POST /api/notifications/readAll` - Mark all as read

## 🐛 Troubleshooting

### Frontend Issues

**Items not loading**
- Check browser console (F12) for errors
- Verify backend server is running
- Check API base URL matches server

**Images not uploading**
- Ensure backend has write permissions
- Check file size limits
- Verify mime types are correct

**Language not changing**
- Clear localStorage and refresh
- Check browser console for JS errors

### Backend Issues

**Database connection error**
- Verify MySQL is running
- Check .env credentials
- Ensure database is created

**API port already in use**
- Change PORT in .env
- Kill process using port: `lsof -i :5000`

**JWT token errors**
- Ensure JWT_SECRET is set
- Check token expiration
- Verify Authorization header format

## 📊 Performance Tips

1. **Database Optimization**
   - Add indexes to frequently searched columns
   - Use pagination for large result sets
   - Archive old matches/notifications

2. **Frontend**
   - Lazy load images
   - Minify CSS/JavaScript
   - Use service workers for caching

3. **Backend**
   - Implement caching (Redis)
   - Use connection pooling
   - Monitor slow queries

## 🔄 Maintenance

### Regular Tasks
- Delete old notifications (> 30 days)
- Deactivate old matches
- Archive collected items
- Monitor database size

### Backup
```bash
mysqldump -u root -p campus_lost_found8 > backup.sql
```

### Restore
```bash
mysql -u root -p campus_lost_found8 < backup.sql
```

## 📚 Technology Stack

### Frontend
- HTML5
- CSS3 (with CSS Variables)
- Vanilla JavaScript (ES6+)

### Backend
- Node.js with Express.js
- MySQL database
- JWT authentication
- bcryptjs for password hashing

### Algorithms
- Levenshtein distance for fuzzy matching
- Weighted scoring for match ranking

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check browser/server console for errors

---

**Happy item hunting! 🎉**
