# SQLite Database Configuration for Render Deployment

## ✅ Configuration Verified

Your Campus Lost & Found app uses **SQLite** in both development and production. Here's how it's configured for Render:

---

## Production Database Path

### Development (Local)
```
backend/database.sqlite  (in project folder)
```

### Production (Render)
```
/var/data/database.sqlite  (persistent disk)
```

---

## How It Works

### 1. **backend/config/db.js** (Database Initialization)
```javascript
const dbPath = process.env.DATABASE_URL || path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);
```

**Logic:**
- Reads `DATABASE_URL` environment variable (set by Render)
- Falls back to `database.sqlite` in local development
- Automatically creates the directory if it doesn't exist
- Initializes schema from `database.sql`

### 2. **render.yaml** (Render Configuration)
```yaml
envVars:
  - key: DATABASE_URL
    value: /var/data/database.sqlite

disk:
  name: api_storage
  mountPath: /var/data
  sizeGB: 1
```

**What this does:**
- Sets `DATABASE_URL=/var/data/database.sqlite` environment variable
- Creates a persistent disk at `/var/data` with 1GB storage
- Data survives server restarts and redeployments

### 3. **backend/.env.production** (Fallback Configuration)
```env
DATABASE_URL=/var/data/database.sqlite
```

---

## Database Features

✅ **SQLite Advantages for Render**
- Single file database (no external service needed)
- Automatic backup via persistent disk
- No additional setup or credentials required
- Perfect for free tier deployment
- Zero cost

✅ **Persistent Storage**
- Render persistent disk mounted at `/var/data`
- Database file: `/var/data/database.sqlite`
- Upload directory: `/var/data/uploads`
- 1GB total storage included
- Data persists across:
  - Server restarts
  - Deployments
  - Updates to code

✅ **Schema Management**
- `backend/database.sql` contains pure SQLite syntax
- Automatically executed on first run
- Schema includes:
  - Users table (authentication)
  - Lost items table
  - Found items table
  - Matches tracking
  - Notifications
  - Messages
  - Audit logs

---

## Deployment Workflow

### Step 1: Code Push
```bash
git push origin main
```

### Step 2: Render Auto-Deployment
When code is pushed:
1. Render pulls latest code
2. Creates `/var/data` directory (persistent)
3. Starts Node.js process
4. `db.js` reads `DATABASE_URL=/var/data/database.sqlite`
5. Creates SQLite database file
6. Loads schema from `database.sql`
7. ✅ App ready with database

### Step 3: Data Persistence
- All user data stored in `/var/data/database.sqlite`
- All uploads stored in `/var/data/uploads`
- Both survive deployments

---

## Verification Commands

After deployment to Render, verify SQLite is working:

```bash
# 1. Check backend is running
curl https://your-api-service-name.onrender.com/

# 2. Test database connection
curl https://your-api-service-name.onrender.com/api/test-db

# 3. Expected response
{
  "success": true,
  "database": "Connected"
}
```

---

## Database Backup

Your data is automatically persisted, but you can download manual backups:

1. Go to **Render Dashboard**
2. Select your backend service
3. Go to **Disks** tab
4. Click the persistent disk
5. **Download backup** (if available)
6. This downloads the entire `/var/data/` directory including database

---

## Troubleshooting

### Database File Not Created
**Problem**: Deployment logs show database initialization error
**Solution**:
1. Check logs: `Render Dashboard → Logs`
2. Verify `DATABASE_URL` is set to `/var/data/database.sqlite`
3. Verify persistent disk is mounted at `/var/data`
4. Check that `backend/database.sql` exists and is valid

### Data Lost After Restart
**Problem**: Database file disappeared
**Solution**:
- This shouldn't happen with persistent disk
- Verify disk is mounted: `Render Dashboard → Disks`
- Check disk has available space: `du -sh /var/data/`
- If disk full, upgrade to paid plan with more space

### Can't Write to Database
**Problem**: 502 error when trying to create items
**Solution**:
1. Check file permissions on `/var/data/`
2. Verify disk has write access
3. Check server logs for SQLite errors
4. Ensure no other process is locking the database

---

## Database Maintenance

### Checking Database Size
In Render logs, check:
```bash
ls -lh /var/data/database.sqlite
du -sh /var/data/
```

### Manual Cleanup (if needed)
To reset database in production:
1. Connect to Render shell (via dashboard)
2. Remove database: `rm /var/data/database.sqlite`
3. Restart service
4. Schema auto-initializes on restart

### Regular Backups
Recommended approach:
1. Monthly: Download backup from Render
2. Store locally or in cloud storage
3. Keep rotation of last 3-6 backups

---

## Configuration Summary

| Setting | Local Dev | Render Production |
|---------|-----------|-------------------|
| Database Type | SQLite | SQLite |
| Database File | `backend/database.sqlite` | `/var/data/database.sqlite` |
| Storage Type | Local filesystem | Persistent disk (1GB) |
| Auto-Persist | Yes | Yes (survives restarts) |
| Initialization | Automatic | Automatic |
| Backup Method | Manual copy | Render disk download |
| Reset Database | Delete `.sqlite` file | Delete via Render shell |

---

## Why SQLite is Perfect for This Deployment

✅ **No Database Service Needed**
- Unlike MySQL/PostgreSQL which need separate hosting
- SQLite is built into Node.js via better-sqlite3

✅ **Fits Free Tier**
- Render free tier: 1 free web service (750 hrs/month)
- SQLite uses that 1 service, no additional database service
- 1GB persistent disk included

✅ **Production Ready**
- SQLite is reliable for production use
- Used by millions of apps
- Proper WAL mode configured in db.js

✅ **Easy Migration**
- If you outgrow SQLite later, easily migrate to PostgreSQL
- Same `database.sql` structure works with PostgreSQL

---

## Next Steps

1. ✅ Verify setup in this document
2. ✅ Deploy to Render (see `RENDER_DEPLOYMENT_QUICK_START.md`)
3. ✅ Test database: `curl https://your-api.onrender.com/api/test-db`
4. ✅ Create a test user and post a lost/found item
5. ✅ Verify data persists after server restart

---

**Status**: 🟢 SQLite configuration verified for Render deployment  
**Database Type**: SQLite via better-sqlite3  
**Production Path**: `/var/data/database.sqlite`  
**Persistence**: ✅ Enabled via Render persistent disk
