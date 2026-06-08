# Running Backend & Frontend Together

This guide shows you how to start both the backend API and frontend web server simultaneously.

---

## 🚀 Quick Start (Recommended)

### Option 1: Using npm script (All Platforms)

```bash
cd /path/to/Campus_lost_found
npm install
npm start
```

This will:
- Install dependencies
- Start backend on `http://localhost:5000`
- Start frontend on `http://localhost:3000`
- Both run simultaneously in your terminal

---

## 📋 Running Individual Services

### Start Only Backend
```bash
cd /path/to/Campus_lost_found/backend
npm install
npm start
```
**Access:** `http://localhost:5000/api`

### Start Only Frontend
```bash
cd /path/to/Campus_lost_found
npm install
node frontend-server.js
```
**Access:** `http://localhost:3000`

---

## 🔧 Advanced: Individual Terminal Windows

If you prefer to run them in separate terminal windows:

### Terminal 1 - Backend
```bash
cd /path/to/Campus_lost_found/backend
npm install
npm start
```

### Terminal 2 - Frontend
```bash
cd /path/to/Campus_lost_found
npm install
node frontend-server.js
```

Both services will run independently and you can see logs from each.

---

## 🐧 Linux/Mac Quick Start Script

Run both services with a shell script:

```bash
cd /path/to/Campus_lost_found
chmod +x start.sh
./start.sh
```

Or use bash directly:
```bash
bash start.sh
```

---

## 🪟 Windows Quick Start Script

Run both services with a batch script:

```cmd
cd C:\path\to\Campus_lost_found
start.bat
```

---

## 📊 What Gets Started

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Backend API | 5000 | `http://localhost:5000` | Node.js + Express server |
| Frontend Web | 3000 | `http://localhost:3000` | Static HTML/CSS/JS server |

---

## ✅ Verification

Once both services are running:

### Check Backend Health
```bash
curl http://localhost:5000/
```
**Expected Response:**
```json
{
  "message": "Campus Lost & Found API Running",
  "status": "success"
}
```

### Check Frontend
Open `http://localhost:3000` in your browser

You should see the Campus Lost & Found dashboard.

---

## 📌 Available npm Scripts

```bash
npm start              # Run both backend and frontend (default)
npm run start-all      # Same as npm start
npm run backend        # Run only backend
npm run frontend       # Run only frontend
npm run dev            # Run both with auto-reload (if nodemon is installed)
npm run backend-dev    # Backend only with auto-reload
npm run frontend-dev   # Frontend only with auto-reload
```

---

## 🔌 How They Connect

1. **Frontend starts on port 3000** and serves static files
2. **Backend starts on port 5000** and exposes API endpoints
3. **Frontend automatically detects backend**:
   - Dev: Uses `http://localhost:5000`
   - Prod: Uses same domain as frontend
4. **All API calls** go from frontend (port 3000) to backend (port 5000)

---

## 🛑 Stopping Services

Press `Ctrl+C` in the terminal to stop both services.

---

## 📁 Project Structure

```
Campus_lost_found/
├── package.json              ← Root package.json (scripts defined here)
├── start.sh                  ← Linux/Mac startup script
├── start.bat                 ← Windows startup script
├── frontend-server.js        ← Frontend server (port 3000)
│
├── backend/                  ← Backend API
│   ├── package.json         ← Backend dependencies
│   ├── server.js            ← Express server (port 5000)
│   ├── config/db.js         ← Database config
│   ├── routes/              ← API routes
│   ├── controllers/         ← Business logic
│   ├── models/              ← Data models
│   └── middleware/          ← Express middleware
│
└── frontend/                 ← Frontend static files
    ├── index.html
    ├── dashboard.html
    ├── login.html
    ├── js/
    │   ├── config.js        ← API URL configuration
    │   ├── auth.js          ← Authentication logic
    │   └── ...
    └── css/style.css
```

---

## 🐛 Troubleshooting

### Port Already in Use
If you get "port 5000 already in use" or "port 3000 already in use":

**Find and kill process:**
```bash
# Kill port 5000 (backend)
lsof -i :5000 -t | xargs kill -9

# Kill port 3000 (frontend)
lsof -i :3000 -t | xargs kill -9
```

Then try again.

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules backend/node_modules
npm install
cd backend && npm install && cd ..
npm start
```

### Frontend Can't Connect to Backend
1. Verify backend is running: `curl http://localhost:5000/`
2. Check browser console for errors (F12)
3. Verify `frontend/js/config.js` has correct API URL
4. Check CORS is enabled in backend

### concurrently Not Found
If you get "command not found: concurrently":

```bash
npm install concurrently --save-dev
npm start
```

---

## 🚀 Deployment vs Development

| Aspect | Development | Deployment (Render) |
|--------|------------|-----|
| Backend Port | 5000 | 5000 |
| Frontend Port | 3000 | 3000 |
| Database | `backend/database.sqlite` | `/var/data/database.sqlite` |
| Uploads | `backend/uploads/` | `/var/data/uploads/` |
| API URL | `http://localhost:5000` | Same domain (auto-detected) |

---

## 📚 Next Steps

1. ✅ Start both services: `npm start`
2. ✅ Open browser: `http://localhost:3000`
3. ✅ Register a new account
4. ✅ Report lost/found items
5. ✅ Test search functionality
6. ✅ Deploy to Render when ready

---

**Happy coding! 🎉**
