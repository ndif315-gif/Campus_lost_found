# Pre-Deployment Checklist

Complete this checklist before deploying to Render.

## Code Preparation
- [ ] All changes committed to Git
- [ ] No uncommitted files or stray debugging code
- [ ] `.gitignore` includes sensitive files (`.env`, `node_modules/`, database files)
- [ ] `package.json` exists in backend/ with all dependencies
- [ ] No hardcoded URLs or localhost references (except in dev check)

## Configuration
- [ ] `.env.production` created with:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5000`
  - [ ] `DATABASE_URL=/var/data/database.sqlite`
  - [ ] `UPLOAD_DIR=/var/data/uploads`
  - [ ] Strong `SESSION_SECRET` and `JWT_SECRET` values
- [ ] Frontend `config.js` properly detects production API URL
- [ ] CORS properly configured for your domain

## Database & Files
- [ ] `backend/database.sql` is valid SQLite schema
- [ ] Database initialization runs automatically on startup
- [ ] Upload directory path is configurable
- [ ] File upload limits are reasonable (5MB default)

## Backend Tests (Local)
```bash
cd backend
npm install
npm start
```

Then test:
- [ ] Server starts: `curl http://localhost:5000/`
- [ ] Database connected: `curl http://localhost:5000/api/test-db`
- [ ] Can register: `curl -X POST http://localhost:5000/api/auth/register`
- [ ] Can login: `curl -X POST http://localhost:5000/api/auth/login`
- [ ] Can search: `curl http://localhost:5000/api/lost/search?q=test`

## Frontend Tests (Local)
- [ ] Open `frontend/dashboard.html` in browser
- [ ] Can login with test credentials
- [ ] Can report lost item
- [ ] Can report found item
- [ ] Search functionality works
- [ ] API calls succeed (check browser console for CORS errors)

## GitHub Setup
- [ ] Repository created and code pushed
- [ ] No sensitive data in Git history
- [ ] Repository is public (for free Render tier)
- [ ] Have GitHub personal access token ready (optional)

## Render Account
- [ ] Render account created and verified
- [ ] GitHub connected to Render account
- [ ] Ready to deploy

## Deployment Steps
1. [ ] Push code to GitHub (if not already done)
2. [ ] Go to Render dashboard
3. [ ] Create new Web Service
4. [ ] Connect GitHub repository
5. [ ] Set build and start commands
6. [ ] Add environment variables (see .env.production)
7. [ ] Add persistent disk (/var/data, 1GB)
8. [ ] Click Deploy
9. [ ] Wait for deployment (2-3 minutes)
10. [ ] Note the service URL

## Post-Deployment Verification
- [ ] Access backend health check: `https://your-service.onrender.com/`
- [ ] Test database: `https://your-service.onrender.com/api/test-db`
- [ ] Test authentication endpoints
- [ ] Test file uploads and search
- [ ] Check logs for errors: Render Dashboard → Logs
- [ ] Verify database file created: Check persistent disk usage

## Common Issues Checklist
- [ ] Ensure persistent disk is mounted at `/var/data`
- [ ] Verify environment variables are set correctly
- [ ] Check that `.env.production` is NOT committed to Git
- [ ] Ensure database initialization script runs on startup
- [ ] Verify CORS headers allow frontend requests

## Final Notes
- Backend logs: `Render Dashboard → Service → Logs`
- Database location: `/var/data/database.sqlite`
- Uploads location: `/var/data/uploads`
- For troubleshooting: See `DEPLOYMENT.md` troubleshooting section

---

**Ready to Deploy?** ✅ All items checked above means you're good to go!

Next Step: Follow instructions in `DEPLOYMENT.md` to deploy to Render.
