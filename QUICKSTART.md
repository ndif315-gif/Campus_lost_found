# ⚡ Campus Lost & Found - Quick Start Guide

Get your application running in 5 minutes!

## 📋 Prerequisites

- Node.js installed
- MySQL installed
- A code editor (VS Code recommended)

---

## 🚀 5-Minute Setup

### Step 1: Create Database (1 minute)

Open MySQL command line:
```bash
mysql -u root -p
```

Then run:
```sql
-- Paste contents of backend/database.sql
```

Or use command line:
```bash
mysql -u root -p < backend/database.sql
```

### Step 2: Setup Backend (2 minutes)

```bash
cd backend
npm install
```

Create `backend/.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campus_lost_found8
JWT_SECRET=change-this-to-something-secret
PORT=5000
```

### Step 3: Start Backend Server (1 minute)

```bash
npm start
```

You should see:
```
Server running on port 5000
Connected to database
```

### Step 4: Start Frontend (1 minute)

Open new terminal:
```bash
# Navigate to project root
cd campus-lost-found8

# Option 1: Using Python
python -m http.server 8000

# Option 2: Using Node
npx http-server

# Option 3: Use VS Code Live Server extension
```

### Step 5: Test It Out

1. Open browser: `http://localhost:8000/frontend/login.html`
2. Click "Sign Up" to create account
3. Enter details and register
4. Login with your credentials
5. Start reporting lost/found items!

---

## ✅ Verify Everything Works

### Test Checklist

- [ ] Can open login page
- [ ] Can register new account
- [ ] Can login with account
- [ ] Dashboard loads with no errors
- [ ] Can create lost item
- [ ] Can create found item
- [ ] Items appear on dashboard

### Common Issues

**Port 5000 already in use?**
```bash
# Change PORT in .env to 5001
# Or kill process: lsof -i :5000
```

**Database connection error?**
- Check MySQL is running
- Verify credentials in .env
- Ensure database created

**CORS error in console?**
- Make sure backend is running on 5000
- Check API_URL in frontend JS files

**Pages won't load?**
- Clear browser cache (Ctrl+Shift+Delete)
- Check console (F12) for errors

---

## 🎨 Quick Customization

### Change Colors

Edit `frontend/css/style.css`:
```css
:root {
    --primary-color: #2563eb;  /* Change this color */
}
```

Save and refresh browser (Ctrl+Shift+R)

### Change Language

Select language dropdown in top-right corner of any page.

---

## 📱 Test on Mobile

### Option 1: Android Phone
1. Get your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. On phone browser: `http://YOUR_IP:8000/frontend/login.html`

### Option 2: Browser DevTools
Press F12 → Click phone icon → Select device → Refresh

---

## 📚 Next Steps

1. **Explore the code**
   - Check `IMPLEMENTATION_GUIDE.md` for detailed guide
   - Read code comments (heavily documented)

2. **Customize the app**
   - Change colors and fonts in `style.css`
   - Add more languages in `js/i18n.js`
   - Modify matching algorithm in `backend/utils/matchEngine.js`

3. **Add more features**
   - Image upload functionality
   - User messaging system
   - Email notifications
   - Admin dashboard

4. **Deploy to production**
   - Choose hosting (Heroku, AWS, DigitalOcean)
   - Update CORS settings
   - Set environment variables
   - Use HTTPS

---

## 🐛 Troubleshooting Commands

```bash
# Check if Node is installed
node --version

# Check if MySQL is running
mysql -u root -p -e "SELECT 1"

# Kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Check if backend is responding
curl http://localhost:5000/api/auth/verify

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 💡 Pro Tips

1. **Keep console open** (F12) while developing
2. **Use Postman** for testing API endpoints
3. **Check browser Network tab** to debug API calls
4. **Use browser DevTools Storage** to see localStorage

---

## 📖 Full Documentation

- **IMPLEMENTATION_GUIDE.md** - Complete setup and customization
- **COMPLETION_SUMMARY.md** - What's implemented
- **API_REFERENCE.md** - All API endpoints

---

## 🎉 You're Ready!

Your application is now running. Start by:

1. Creating a test account
2. Reporting a lost item
3. Reporting a found item
4. Check if matches are found automatically
5. View match notifications

**Enjoy your Campus Lost & Found system!** 🎓

---

## 📞 Quick Reference

| Action | Command |
|--------|---------|
| Start backend | `cd backend && npm start` |
| Start frontend | `python -m http.server 8000` |
| Access app | `http://localhost:8000/frontend/login.html` |
| View logs | Open browser console (F12) |
| Test API | Use Postman or cURL |

---

**Last Updated: January 2024**
