# Complete Guide: Deploy OHS Management System on Render.com

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [Pre-Deployment Preparation](#pre-deployment-preparation)
4. [Deploying via Render Dashboard](#deploying-via-render-dashboard)
5. [Deploying via render.yaml (Recommended)](#deploying-via-renderyaml-recommended)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Environment Variables Explained](#environment-variables-explained)
8. [Data Persistence on Render](#data-persistence-on-render)
9. [Monitoring and Logs](#monitoring-and-logs)
10. [Troubleshooting](#troubleshooting)
11. [Custom Domain Setup](#custom-domain-setup)
12. [Scaling and Performance](#scaling-and-performance)

---

## 🎯 Prerequisites

### Required Accounts
- ✅ **GitHub Account** - For hosting your repository
- ✅ **Render Account** - Free tier available at https://render.com

### Required Tools (Local Development)
```bash
# Check if you have these installed:
node --version    # Should be >= 18.0.0
npm --version     # Should be >= 9.0.0
git --version     # Should be >= 2.0.0
```

---

## 📂 Project Overview

### Application Architecture
- **Frontend**: Vite 7.3.1 (Builds to `dist/` directory)
- **Backend**: Express.js 4.21.2 (Serves API and static files)
- **Authentication**: JWT-based with bcryptjs password hashing
- **Data Storage**: JSON files in `server-data/` directory
- **Port**: 3000 (configurable via PORT environment variable)

### Key Files
```
├── server.js              # Express.js server application
├── vite.config.js         # Vite build configuration
├── package.json           # Dependencies and scripts
├── render.yaml            # Render deployment configuration
├── .env.example           # Environment variable template
└── public/                # Frontend assets
    └── js/               # JavaScript modules
```

---

## 🚀 Pre-Deployment Preparation

### Step 1: Verify Local Build

Test that your application builds and runs correctly locally:

```bash
# Install dependencies
npm install

# Build the frontend
npm run build

# Start the server
npm run start

# Test the application
# Visit http://localhost:3000 in your browser
# Create a test account
# Create a project
# Run an audit
```

### Step 2: Prepare .env.example

Ensure `.env.example` exists in your repository (this is safe to commit):

```bash
# .env.example
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key-will-be-set-in-render
```

**❌ NEVER commit `.env` file** - it should already be in `.gitignore`

### Step 3: Push to GitHub

```bash
# Stage all files
git add .

# Commit changes
git commit -m "Prepare for Render deployment"

# Push to GitHub
git push origin main
```

**Verify:** Check that your repository is publicly accessible or accessible to your GitHub account.

---

## 🖥️ Deploying via Render Dashboard

### Step 1: Create Render Account

1. Go to https://render.com
2. Click **Sign Up**
3. Choose **Sign up with GitHub** (recommended)
4. Authorize Render to access your repositories
5. Select **Individual** plan (Free tier is sufficient)

### Step 2: Create New Web Service

1. After signing in, click **New +** (top right)
2. Select **Web Service**

### Step 3: Connect GitHub Repository

1. Under **"Connect a repository"**, search for your repository
2. Click **Connect** next to your repository
3. If you see a popup, authorize Render to access the repo

### Step 4: Configure Web Service

#### Basic Settings

| Setting | Value | Notes |
|---------|-------|-------|
| **Name** | `ohs-audit-tool` | Will become your subdomain |
| **Region** | `Oregon (US West)` | Choose closest to your users |
| **Branch** | `main` | Your deployment branch |
| **Runtime** | `Node` | Auto-detected |
| **Build Command** | `npm install && npm run build` | Installs deps and builds frontend |
| **Start Command** | `npm run start` | Starts the Express server |

#### Environment Variables

Add these environment variables in the **"Environment"** section:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `3000` | Render default port |
| `JWT_SECRET` | `<generate-unique-secret>` | See below |

**Generate JWT_SECRET:**

```bash
# Option 1: Using OpenSSL
openssl rand -base64 64

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 3: Using Python
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

**Copy the output** and paste it as the JWT_SECRET value.

### Step 5: Instance Type

Choose **Free** tier:
- ✅ 512 MB RAM
- ✅ 0.1 CPU
- ✅ 750 hours/month
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ Cold start ~30 seconds

### Step 6: Deploy

1. Click **Create Web Service** at the bottom
2. Wait for deployment to complete (2-5 minutes)
3. You'll see logs during the build process

### Step 7: Access Your Application

Once deployed, Render will provide a URL like:
```
https://ohs-audit-tool.onrender.com
```

**First Steps:**
1. Visit your deployed URL
2. Register your first account (automatically becomes **Admin**)
3. Test all functionality

---

## ⚡ Deploying via render.yaml (Recommended)

Using `render.yaml` is faster and more reproducible.

### Step 1: Verify render.yaml

Your project already includes `render.yaml`. Verify it looks like this:

```yaml
services:
  - type: web
    name: ohs-audit-tool
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: JWT_SECRET
        generateValue: true
        sync: false
```

### Step 2: Deploy via Dashboard

1. Go to Render Dashboard
2. Click **New +** → **Blueprint**
3. Click **"Existing repository"**
4. Select your repository
5. Select the branch containing `render.yaml`
6. Click **Apply**

Render will read the `render.yaml` and automatically create the web service with all configurations!

### Step 3: Set JWT_SECRET (Important!)

Even with `render.yaml`, you should set a specific JWT_SECRET:

1. Go to your new web service
2. Click **Environment** tab
3. Find `JWT_SECRET` (should be auto-generated)
4. **Copy this value** and save it securely
5. For production, replace with your own generated secret:

```bash
# Generate a strong secret
openssl rand -base64 64
```

---

## 🔧 Post-Deployment Configuration

### Step 1: Verify Health Check

Test that your API is responding:

```bash
curl https://ohs-audit-tool.onrender.com/api/health
```

**Expected response:**
```json
{"ok":true,"service":"ohs-mvp-api"}
```

### Step 2: Register Admin Account

1. Open your application URL in a browser
2. Click **Register**
3. Enter email and password (minimum 8 characters)
4. First user becomes **Admin** automatically

### Step 3: Create Test Project

1. Login with your admin account
2. Click **New Project**
3. Enter project details
4. Create a site
5. Run an audit to verify all functionality

### Step 4: Test Report Generation

1. Complete an audit
2. Click **Generate Report**
3. Verify HTML report downloads correctly

---

## 🔐 Environment Variables Explained

### Required Variables

| Variable | Purpose | Default | Required |
|----------|---------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | ✅ Yes |
| `PORT` | Server port | `3000` | ✅ Yes |
| `JWT_SECRET` | JWT signing key | `change-me-in-production` | ✅ Yes |

### Optional Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `DATA_DIR` | Custom data directory | `./server-data` |

### Setting Variables in Render

**Via Dashboard:**
1. Go to your web service
2. Click **Environment** tab
3. Click **Add Environment Variable**
4. Enter Key and Value
5. Click **Save**
6. **Important:** Click **Manual Deploy** → **Clear build cache & deploy** to apply changes

**Via render.yaml:**
```yaml
envVars:
  - key: YOUR_KEY
    value: your-value
    sync: false  # Don't sync to other services
```

---

## 💾 Data Persistence on Render

### Understanding Ephemeral Storage

**⚠️ Critical Warning:**

Render's free tier has **ephemeral file system**:
- Data in `server-data/` folder is **lost** when:
  - Service restarts
  - New deployment is pushed
  - Service spins down (after 15min inactivity)

### Current Behavior

The application uses file-based storage:
```
server-data/
├── users.json      # User accounts
├── state.json      # Application state
└── audit.log.json  # Audit logs
```

**This means:** All data will be reset on each deployment.

### Solutions

#### Option 1: Accept Ephemeral Storage (For Testing/Demo)

If you're just testing or doing demos, ephemeral storage is acceptable:
- ✅ No configuration needed
- ✅ Zero cost
- ⚠️ Data lost on redeploy
- ⚠️ Not suitable for production

#### Option 2: Add Render Disk (For Production)

Render offers persistent disk storage for paid plans:

1. Go to your web service in Render
2. Click **Advanced** tab
3. Scroll to **Disks**
4. Click **Add Disk**
5. Configure:
   - **Name:** `data-disk`
   - **Mount path:** `/opt/render/project/server-data`
   - **Size:** 1 GB (minimum)
   - **Plan:** $5/month
6. Save changes

**Update server.js** to use the mounted path (if needed):

```javascript
// In server.js
const DATA_DIR = process.env.DATA_DIR || 
                 path.join(__dirname, 'server-data');
```

**Add environment variable:**
```
DATA_DIR = /opt/render/project/server-data
```

**Cost:** $5/month for 1 GB disk

#### Option 3: Use External Database (Recommended for Production)

For production, migrate to a proper database:

- **PostgreSQL:** Render provides managed PostgreSQL ($7/month)
- **MongoDB:** MongoDB Atlas (free tier available)
- **Redis:** Render managed Redis (free tier available)

**Migration Steps:**
1. Set up external database
2. Modify `server.js` to use database client
3. Create database tables/collections
4. Migrate existing data
5. Update deployment

#### Option 4: Use Render's PostgreSQL

**Best for production:**

1. Create a PostgreSQL database:
   - Go to **New +** → **PostgreSQL**
   - Choose Free tier ($0/month)
   - Create database

2. Get connection details:
   - External Database URL
   - Internal Database URL

3. Update `server.js` to use PostgreSQL:
   ```javascript
   import pg from 'pg';
   const { Pool } = pg;
   
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL
   });
   ```

4. Add environment variable:
   ```
   DATABASE_URL = postgres://user:pass@host:port/dbname
   ```

---

## 📊 Monitoring and Logs

### Viewing Logs

**Real-time Logs:**
1. Go to your web service in Render
2. Click **Logs** tab
3. Watch live logs as requests come in

**Log Levels:**
- `INFO`: Normal operations
- `ERROR`: Application errors
- `WARN`: Warnings that don't stop execution

### Monitoring Health

**Built-in Health Check:**
```bash
curl https://ohs-audit-tool.onrender.com/api/health
```

**Expected response:**
```json
{"ok":true,"service":"ohs-mvp-api"}
```

### Analytics

Render provides basic metrics:
- Response time
- Request count
- Error rate
- CPU/memory usage

View in **Metrics** tab of your web service.

---

## 🐛 Troubleshooting

### Common Issues

#### Issue 1: Build Fails

**Symptoms:**
```
Build failed: npm ERR! missing script: start
```

**Solution:**
1. Check `package.json` has start script:
   ```json
   "scripts": {
     "start": "node server.js"
   }
   ```

2. Verify build command: `npm install && npm run build`

#### Issue 2: Application Won't Start

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
Ensure PORT environment variable is set to `3000`:
```
PORT = 3000
```

#### Issue 3: Can't Login/Register

**Symptoms:**
- Login always fails
- Registration returns error

**Solution:**
1. Check JWT_SECRET is set in environment variables
2. Verify JWT_SECRET is not the default value
3. Generate a new strong secret:
   ```bash
   openssl rand -base64 64
   ```
4. Clear build cache and redeploy

#### Issue 4: Static Files Not Loading

**Symptoms:**
- HTML loads but CSS/JS returns 404

**Solution:**
1. Verify `npm run build` completed successfully
2. Check `dist/` directory exists in build logs
3. Verify `vite.config.js` has correct output:
   ```javascript
   export default {
     build: {
       outDir: 'dist'
     }
   }
   ```

#### Issue 5: Cold Start Delays

**Symptoms:**
- First request takes 30+ seconds
- After inactivity, slow again

**Solution:**
This is normal on Render free tier. Options:
- Accept it (recommended for testing)
- Upgrade to paid plan (~$7/month)
- Use a cron job to keep it warm:
  ```yaml
  # In render.yaml
  cronJobs:
    - name: keep-warm
      schedule: "*/10 * * * *"
      command: "curl https://ohs-audit-tool.onrender.com/api/health"
  ```

#### Issue 6: Data Lost After Redeploy

**Symptoms:**
- All projects/users disappear after pushing new code

**Solution:**
This is expected on free tier. Solutions:
- **For testing:** Accept it (recreate data)
- **For production:** Add Render Disk ($5/month)
- **For production:** Use external database

### Debug Mode

To enable debug logging, add environment variable:
```
DEBUG = express:*
```

View detailed logs in Render dashboard.

---

## 🌐 Custom Domain Setup

### Option 1: Use Render Subdomain

Default: `https://ohs-audit-tool.onrender.com`

**Change subdomain:**
1. Go to web service settings
2. Scroll to **Custom Domains**
3. Click **Edit** next to default domain
4. Enter new subdomain name
5. Save

### Option 2: Use Custom Domain

**Prerequisites:**
- Custom domain (e.g., `audit.yourcompany.com`)
- Access to DNS settings

**Steps:**

1. **Add Custom Domain:**
   - Go to your web service
   - Click **Settings** → **Custom Domains**
   - Click **Add Domain**
   - Enter your domain: `audit.yourcompany.com`
   - Click **Continue**

2. **Update DNS Records:**
   - Render will show you DNS records to add
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add these records:
   
   **For root domain:**
   ```
   Type: A
   Name: @
   Value: 216.24.57.11
   TTL: 3600
   ```
   
   **For subdomain:**
   ```
   Type: CNAME
   Name: audit
   Value: ohs-audit-tool.onrender.com
   TTL: 3600
   ```

3. **Wait for Propagation:**
   - DNS changes take 5-60 minutes
   - Render will automatically detect when ready
   - SSL certificate provisioned automatically

4. **Verify:**
   ```bash
   curl https://audit.yourcompany.com/api/health
   ```

**Cost:** Custom domains are free on Render!

---

## ⚡ Scaling and Performance

### Free Tier Limitations

| Resource | Limit |
|----------|-------|
| RAM | 512 MB |
| CPU | 0.1 CPU |
| Bandwidth | 100 GB/month |
| Build minutes | 750/month |
| Cold starts | 30 seconds |
| Spin-down time | 15 minutes |

### When to Upgrade

**Signs you need to upgrade:**
- Slow response times
- Frequent timeouts
- Cold starts becoming problematic
- Need for persistent storage
- High traffic

### Upgrade Options

#### Standard Plan (~$7/month)
- 512 MB RAM
- 0.5 CPU
- No cold starts
- Better performance

#### Starter Plan (~$25/month)
- 2 GB RAM
- 1 CPU
- No cold starts
- Good for production

#### Production Plan (~$70/month)
- 8 GB RAM
- 4 CPU
- Best performance
- For high traffic

### Performance Optimization

**1. Enable Gzip Compression** (already in Express):
```javascript
// Already configured in server.js via helmet
app.use(helmet());
```

**2. Use CDN for Static Assets**
Consider using Cloudflare CDN:
- Faster global delivery
- DDoS protection
- Free tier available

**3. Implement Caching**
Add Redis caching:
```bash
# Add to package.json
npm install redis connect-redis express-session
```

**4. Optimize Build**
In `vite.config.js`:
```javascript
export default {
  build: {
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['chart.js']
        }
      }
    }
  }
}
```

---

## ✅ Deployment Checklist

Use this checklist to ensure successful deployment:

### Pre-Deployment
- [ ] Application builds locally: `npm run build`
- [ ] Application runs locally: `npm run start`
- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` is committed
- [ ] `render.yaml` is committed
- [ ] Repository pushed to GitHub

### Render Configuration
- [ ] Render account created
- [ ] GitHub repository connected
- [ ] Web service created
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm run start`
- [ ] Port: `3000`
- [ ] NODE_ENV: `production`
- [ ] JWT_SECRET set (strong random value)

### Post-Deployment
- [ ] Application accessible at URL
- [ ] Health check returns OK: `/api/health`
- [ ] Admin account registered
- [ ] Can create projects
- [ ] Can run audits
- [ ] Reports generate correctly
- [ ] Login/logout works
- [ ] SSL certificate active (HTTPS)

### Monitoring
- [ ] Logs visible in dashboard
- [ ] Health check configured
- [ ] Error monitoring set up
- [ ] Backup strategy defined

---

## 📞 Support and Resources

### Render Documentation
- Official Docs: https://render.com/docs
- Deploy Guides: https://render.com/docs/deploy-node-express-app
- Troubleshooting: https://render.com/docs/troubleshooting

### Project Documentation
- README.md: Project overview
- DEPLOYMENT_GUIDE.md: General deployment options
- MVP_GAP_SECURITY_PLAN.md: Security considerations

### Useful Links
- Render Status: https://status.render.com
- Render Community: https://community.render.com
- Render Pricing: https://render.com/pricing

---

## 🎉 Conclusion

You now have everything you need to deploy the OHS Management System on Render.com!

### Quick Recap

**For Testing/Demo:**
1. Push code to GitHub
2. Connect to Render (dashboard or render.yaml)
3. Deploy with free tier
4. Accept ephemeral storage
5. Test functionality

**For Production:**
1. Use render.yaml for reproducible deployment
2. Add Render Disk or external database
3. Upgrade to Standard plan ($7/month)
4. Set up custom domain
5. Monitor logs and metrics
6. Implement backups

### Next Steps

1. **Deploy now** - Follow the steps above
2. **Test thoroughly** - Verify all features work
3. **Monitor performance** - Check logs and metrics
4. **Plan upgrades** - Determine when to move to paid tier
5. **Secure application** - Use strong JWT_SECRET, HTTPS

---

**🚀 Happy Deploying!**

Your OHS Management System is ready for production on Render.com!
