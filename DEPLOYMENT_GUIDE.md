# OHS Management System - Deployment Guide

## 📋 Overview

This guide provides complete deployment instructions for the OHS Management System with full-stack capabilities (authentication, server persistence, report generation).

---

## 🎯 Recommended Deployment Options (FREE)

### Option 1: Render.com (Recommended - Best Free Tier)
**✅ Fully Free** | **✅ No Code Changes** | **✅ Full Backend Support**

| Feature | Details |
|---------|---------|
| **Cost** | FREE (forever) |
| **Backend** | Full Express.js support |
| **Database** | File-based storage included |
| **SSL** | Automatic HTTPS |
| **Limitations** | Spins down after 15min inactivity (cold starts ~30s) |
| **Best For** | Testing, demos, low-traffic production |

---

### Option 2: Railway.app (Easiest Setup)
**⚠️ Free Trial Only** | **✅ No Code Changes** | **✅ Full Backend Support**

| Feature | Details |
|---------|---------|
| **Cost** | $5 one-time credit, then $5/month |
| **Backend** | Full Express.js support |
| **Database** | File-based storage included |
| **SSL** | Automatic HTTPS |
| **Limitations** | Only 30 days free, then paid |
| **Best For** | Quick testing, evaluation period |

---

### Option 3: Vercel (Requires Code Changes)
**✅ Fully Free** | **❌ Requires Restructuring** | **⚠️ Backend Limited**

| Feature | Details |
|---------|---------|
| **Cost** | FREE (forever) |
| **Backend** | Serverless functions only (requires code conversion) |
| **Database** | Need external database (PostgreSQL/Redis) |
| **SSL** | Automatic HTTPS |
| **Limitations** | Must convert Express.js to Vercel API routes |
| **Best For** | If you're already using Vercel ecosystem |

---

## 🚀 Step-by-Step Deployment

---

## OPTION 1: Render.com (Recommended)

### Prerequisites
- GitHub account
- Render.com account (free)
- Repository pushed to GitHub

### Steps

#### 1. Prepare GitHub Repository
```bash
# Make sure .env is NOT committed (already in .gitignore)
# But .env.example should be committed

git add .
git commit -m "Ready for deployment"
git push origin <your-branch>
```

#### 2. Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Select "Individual" plan (Free)

#### 3. Deploy Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure settings:

**Build Settings:**
```
Build Command: npm install
Start Command: npm run start
Publish Directory: . (root)
```

**Environment Variables:**
```
NODE_ENV = production
PORT = 3000
JWT_SECRET = <generate-strong-secret>
```

**Generate JWT_SECRET:**
```bash
# Use this command to generate a secure secret
openssl rand -base64 64
# Or use: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

4. Click **"Create Web Service"**

5. Wait for deployment (2-3 minutes)

#### 4. Access Your Application
- Render will provide a URL like: `https://ohs-audit-tool.onrender.com`
- First user registration automatically becomes **Admin**

#### 5. Configure Environment Variables in Render Dashboard
1. Go to your Web Service in Render
2. Click **"Environment"** tab
3. Add the following:

```
NODE_ENV = production
PORT = 3000
JWT_SECRET = your-very-long-random-secret-here
```

#### 6. Handle File Persistence (Important!)
The `server-data/` folder is **ephemeral** on Render (data lost on redeploy).

**For testing:** This is acceptable
**For production:** Add a Render Disk or use external database

---

## OPTION 2: Railway.app (Easiest)

### Prerequisites
- GitHub account
- Railway.app account
- Repository pushed to GitHub

### Steps

#### 1. Prepare GitHub Repository
```bash
git add .
git commit -m "Ready for deployment"
git push origin <your-branch>
```

#### 2. Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Get $5 free credit

#### 3. Deploy Service
1. Click **"New Project"** → **"Deploy from GitHub repo"**
2. Select your repository
3. Railway will auto-detect Node.js

#### 4. Configure Environment Variables
Click **"Variables"** tab and add:
```
NODE_ENV = production
PORT = 3000
JWT_SECRET = your-very-long-random-secret-here
```

#### 5. Deploy
Click **"Deploy"** and wait 1-2 minutes

#### 6. Access Your Application
- Railway provides a URL like: `https://ohs-audit-tool.up.railway.app`
- First user registration becomes **Admin**

---

## OPTION 3: Vercel (Code Changes Required)

### Why This is Complicated
Vercel is designed for static sites and serverless functions. Your Express.js server needs conversion.

### Conversion Required
You would need to restructure:
```
server.js → api/index.js (Vercel serverless)
/api/auth/* → api/auth/*.js
/api/state/* → api/state/*.js
```

### Not Recommended
For this project, I **strongly recommend** Render or Railway instead.

---

## 🔧 Docker Deployment (Alternative)

### For Self-Hosting or Cloud Providers

#### Build and Run Locally
```bash
docker build -t ohs-audit-tool .
docker run -p 3000:3000 -e JWT_SECRET=your-secret ohs-audit-tool
```

#### Deploy to Cloud Providers
The Docker image can be deployed to:
- **Google Cloud Run** (Free tier: 2M requests/month)
- **AWS ECS** (Free tier: 750 hours/month)
- **Azure Container Instances** (Free trial)
- **DigitalOcean App Platform** ($5/month, free trial available)

---

## 📊 Comparison Table

| Platform | Free Tier | Cold Starts | Setup Difficulty | Full Backend | Data Persistence |
|----------|-----------|--------------|------------------|--------------|------------------|
| **Render** | ✅ Forever | ⚠️ 15min idle | ⭐ Easy | ✅ Yes | ⚠️ Ephemeral |
| **Railway** | ⚠️ 30 days | ✅ None | ⭐ Very Easy | ✅ Yes | ⚠️ Ephemeral |
| **Vercel** | ✅ Forever | ✅ None | ⚠️ Hard (needs code change) | ⚠️ Limited | ❌ Need external DB |
| **Docker** | Cloud-dependent | ✅ None | ⭐ Easy | ✅ Yes | ✅ With volume mount |

---

## 🎯 My Recommendation

### For Testing & Demo:
**Use Render.com** - It's free forever, supports Express.js without code changes, and has automatic HTTPS.

### For Long-Term Production:
**Use Railway** - Better performance (no cold starts), but costs $5/month after trial.

### For Enterprise:
**Self-host Docker** - Full control, no recurring costs, can use your own infrastructure.

---

## 🔐 Security Best Practices

### 1. Generate Strong JWT_SECRET
```bash
# Use any of these methods:
openssl rand -base64 64
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

### 2. Environment Variables
NEVER commit `.env` file. Use `.env.example` as template.

### 3. First User
First user registration automatically becomes **Admin**. Register your admin account first.

---

## 🐛 Troubleshooting

### Render Deployment Issues

**Problem:** Build fails
```
Solution: Check that start command is "npm run start" not "node server.js"
```

**Problem:** Application starts but can't access
```
Solution: Check PORT environment variable (must be 3000)
```

**Problem:** Data lost after redeploy
```
Solution: Normal behavior on Render free tier. Add Render Disk for persistent storage.
```

### Railway Deployment Issues

**Problem:** Build fails
```
Solution: Make sure package.json has "start": "node server.js"
```

**Problem:** Can't login
```
Solution: Check JWT_SECRET is set in environment variables
```

---

## 📝 Post-Deployment Checklist

- [ ] Application accessible at deployed URL
- [ ] First user registered as Admin
- [ ] JWT_SECRET set in environment variables
- [ ] Test creating a project
- [ ] Test audit scoring
- [ ] Test report generation (HTML export)
- [ ] Test login/logout functionality
- [ ] Test data persistence (recreate after login)

---

## 🆘 Support

For deployment issues:
1. Check Render/Railway logs
2. Check environment variables
3. Verify .env.example is committed
4. Ensure .env is NOT committed
5. Check server.js has proper PORT configuration

---

## 📞 Quick Start Commands

```bash
# Test locally first
npm run build && npm run start

# Deploy to Render
# 1. Push to GitHub
# 2. Connect repo to Render
# 3. Set environment variables
# 4. Deploy

# Deploy to Railway
# 1. Push to GitHub
# 2. Connect repo to Railway
# 3. Set environment variables
# 4. Deploy
```

---

**🎉 Your OHS Management System is ready for deployment!**

Choose **Render** for free testing or **Railway** for production-ready performance.
