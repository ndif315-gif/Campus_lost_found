# Deployment Guide - Render

This guide provides step-by-step instructions to deploy the Campus Lost & Found application to Render.

## Prerequisites

- A [Render account](https://render.com) (free tier available)
- Git repository with this code pushed to GitHub/GitLab
- Node.js 16+ (for local testing)

---

## Option 1: Deploy Using render.yaml (Recommended)

The `render.yaml` file defines infrastructure-as-code for automatic deployment.

### Step 1: Push Your Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Campus Lost & Found application"
git remote add origin https://github.com/YOUR-USERNAME/campus-lost-found.git
git push -u origin main
```

### Step 2: Create a Render Account and Connect GitHub

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Select **Build and deploy from a Git repository**
4. Connect your GitHub account and authorize Render
5. Select your `campus-lost-found` repository

### Step 3: Use render.yaml for Auto-Deployment

1. In the Render dashboard, select **Web Service**
2. Render should detect the `render.yaml` file
3. Click **Deploy** 
4. Render will automatically:
   - Create two services (API backend and static frontend)
   - Set up environment variables
   - Configure persistent storage for database and uploads
   - Deploy and start both services

---

## Option 2: Manual Deployment (Backend Only)

If you prefer to deploy just the backend and host the frontend separately:

### Backend Deployment

1. **Create a new Web Service on Render**
   - Click **New +** → **Web Service**
   - Connect your GitHub repository
   - Set the following:
     - **Build Command**: `cd backend && npm install`
     - **Start Command**: `cd backend && npm start`
     - **Environment**:
       - `NODE_ENV=production`
       - `PORT=5000`
       - `DATABASE_URL=/var/data/database.sqlite`
       - `UPLOAD_DIR=/var/data/uploads`
       - `CORS_ORIGIN=*`

2. **Add Persistent Disk**
   - Click **Disks** → **Add Persistent Disk**
   - Mount path: `/var/data`
   - Size: 1 GB
   - This persists your database and uploads across deployments

3. **Deploy**
   - Click **Deploy**
   - Wait for deployment to complete (2-3 minutes)
   - Note the URL (e.g., `https://campus-lost-found-api.onrender.com`)

### Frontend Deployment

**Option A: Deploy to Netlify (Recommended)**

1. Push `frontend/` folder to a separate GitHub repository
2. Go to [Netlify](https://netlify.com) and sign in with GitHub
3. Click **New site from Git**
4. Select your frontend repository
5. Deploy settings:
   - **Build command**: Leave empty (no build step needed)
   - **Publish directory**: `.`
6. In **Site Settings** → **Build & Deploy** → **Environment**, add:
   - `VITE_API_URL=https://campus-lost-found-api.onrender.com/api`
7. Trigger a redeploy

**Option B: Deploy to Render (Static)**

1. In Render dashboard, click **New +** → **Static Site**
2. Select your frontend repository
3. Set:
   - **Build Command**: Leave empty
   - **Publish directory**: `frontend`
4. Deploy

---

## Environment Variables Setup

### For Backend (.env.production)

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=/var/data/database.sqlite
UPLOAD_DIR=/var/data/uploads
CORS_ORIGIN=*
SESSION_SECRET=your-secret-key-change-in-production
JWT_SECRET=your-jwt-secret-change-in-production
```

In **Render Dashboard**, these are set in the **Environment** section of your service.

### Important Security Notes

- ⚠️ **Never commit `.env` files with real secrets**
- Use strong random values for `SESSION_SECRET` and `JWT_SECRET`
- Change these values in production:
  ```bash
  # Generate random strings
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

---

## Testing the Deployment

### 1. Check Backend Health

```bash
curl https://your-backend-url.onrender.com/
```

Expected response:
```json
{
  "message": "Campus Lost & Found API Running",
  "status": "success"
}
```

### 2. Check Database Connection

```bash
curl https://your-backend-url.onrender.com/api/test-db
```

Expected response:
```json
{
  "success": true,
  "database": "Connected"
}
```

### 3. Test Authentication

```bash
curl -X POST https://your-backend-url.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

### 4. Access Frontend

Visit your frontend URL in a browser and:
- Create an account
- Report a lost item
- Report a found item
- Search for items

---

## Database & File Management

### Database Persistence

- SQLite database is stored at `/var/data/database.sqlite`
- Persistent disk ensures data survives deployments
- **Initial setup**: Database schema is created automatically on first run

### File Uploads

- Uploaded images stored at `/var/data/uploads`
- Accessible via `https://your-backend-url.onrender.com/uploads/filename`
- Size limit: 5MB per file
- Allowed formats: JPEG, PNG, WebP

### Database Backups

To backup your production database:

```bash
# Download database file via Render dashboard
# Disks → Select service → Download backup
```

---

## Troubleshooting

### Deployment Fails

1. **Check logs in Render dashboard**
   - Click service → **Logs**
   - Look for error messages

2. **Common issues**:
   - Missing `package.json` → Run `npm init` in backend/
   - Port binding error → Check `PORT` environment variable
   - Database access error → Verify persistent disk is mounted

### API Returns 404

1. Check backend service is running
2. Verify `CORS_ORIGIN` environment variable
3. Test with `curl https://your-backend-url.onrender.com/api/test-db`

### Frontend Can't Connect to Backend

1. Update frontend `API_URL` in `config.js` with your backend URL
2. Ensure backend `CORS_ORIGIN=*` or includes frontend domain
3. Check browser console for CORS errors

### Uploads Not Working

1. Verify persistent disk is mounted at `/var/data`
2. Check `UPLOAD_DIR` environment variable is set
3. Ensure disk has available space: `du -sh /var/data/`

---

## Manual Deployment Commands (Advanced)

If you need to deploy from command line using Render CLI:

```bash
# Install Render CLI
npm install -g render-cli

# Authenticate
render login

# Create services from render.yaml
render services create-from-yaml render.yaml

# Deploy
render deploy
```

---

## Cost Considerations

- **Free Tier (Render)**:
  - 1 free web service (750 hours/month)
  - 1 free static site
  - 1 GB persistent disk included
  - ✅ Sufficient for small projects

- **Estimated Free Tier Usage**:
  - ~1 service running 24/7 = 720 hours/month
  - Leaves ~30 hours for additional service
  - Disk: Database (~10MB) + uploads (varies)

---

## Next Steps

1. **Monitor your deployment**
   - Check Render dashboard regularly
   - Review logs for errors

2. **Set up custom domain** (optional)
   - Render Settings → Custom Domain
   - Point your domain to Render

3. **Enable auto-deployments**
   - Push to GitHub → Render automatically redeploys
   - Configure in **Service Settings** → **Autodeployment**

4. **Database maintenance**
   - Schedule regular backups
   - Monitor disk usage

---

## Support & Resources

- [Render Documentation](https://render.com/docs)
- [SQLite Best Practices](https://www.sqlite.org/bestpractice.html)
- [Express.js Deployment Guide](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Last Updated**: June 2026  
**App Version**: 1.0.0
