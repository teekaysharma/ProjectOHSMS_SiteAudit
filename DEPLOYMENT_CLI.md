# Render Deployment - CLI Quick Reference

```bash
# ═══════════════════════════════════════════════════════════════
# 🚀 OHS MANAGEMENT SYSTEM - RENDER DEPLOYMENT
# ═══════════════════════════════════════════════════════════════

# ─────────────────────────────────────────────────────────────
# STEP 1: PREPARE LOCAL REPOSITORY
# ─────────────────────────────────────────────────────────────

# Test build locally
npm install
npm run build
npm run start

# Verify it works at http://localhost:3000
# Then stop with Ctrl+C

# ─────────────────────────────────────────────────────────────
# STEP 2: PUSH TO GITHUB
# ─────────────────────────────────────────────────────────────

git add .
git commit -m "Ready for Render deployment"
git push origin main

# ─────────────────────────────────────────────────────────────
# STEP 3: DEPLOY TO RENDER (WEB UI)
# ─────────────────────────────────────────────────────────────

# 1. Go to https://render.com
# 2. Sign up with GitHub (Free tier)
# 3. Click "New +" → "Blueprint" (or "Web Service")
# 4. Connect your GitHub repository
# 5. Click "Apply" (Blueprint) or configure manually

# ─────────────────────────────────────────────────────────────
# STEP 4: CONFIGURE ENVIRONMENT VARIABLES
# ─────────────────────────────────────────────────────────────

# Generate JWT_SECRET
openssl rand -base64 64

# In Render Dashboard → Your Service → Environment:
# Add these variables:
#   NODE_ENV = production
#   PORT = 3000
#   JWT_SECRET = <output from above command>

# ─────────────────────────────────────────────────────────────
# STEP 5: WAIT FOR DEPLOYMENT
# ─────────────────────────────────────────────────────────────

# Wait 2-3 minutes
# Watch logs in Render Dashboard
# Your URL will be: https://ohs-audit-tool.onrender.com

# ─────────────────────────────────────────────────────────────
# STEP 6: INITIAL SETUP
# ─────────────────────────────────────────────────────────────

# Visit your URL
# Register first account (becomes Admin automatically)
# Create a test project
# Run a test audit

# ─────────────────────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════
# ✅ DEPLOYED!
# ═══════════════════════════════════════════════════════════════
```

---

## 📋 Complete Commands Copy-Paste

```bash
# === COMPLETE DEPLOYMENT SEQUENCE ===

# 1. Install and test
npm install && npm run build && npm run start &

# 2. Test locally (Ctrl+C when done)
# Visit http://localhost:3000
# Then: pkill -f "node server.js"

# 3. Push to GitHub
git add .
git commit -m "Deploy to Render"
git push origin main

# 4. Generate JWT_SECRET (save this!)
JWT_SECRET=$(openssl rand -base64 64)
echo "Your JWT_SECRET: $JWT_SECRET"

# 5. Now go to https://render.com and deploy!
```

---

## 🔍 Health Check Command

```bash
# Test your deployed application
curl https://ohs-audit-tool.onrender.com/api/health

# Expected output:
# {"ok":true,"service":"ohs-mvp-api"}
```

---

## 🐛 Quick Troubleshooting

```bash
# Problem: Build fails
# Solution: Check package.json has "start" script
cat package.json | grep -A5 '"scripts"'

# Problem: Can't login
# Solution: Regenerate JWT_SECRET
openssl rand -base64 64
# Update in Render Dashboard → Environment

# Problem: 502 errors
# Solution: Wait 30 seconds (cold start)
sleep 30
curl https://ohs-audit-tool.onrender.com/api/health

# Problem: Data lost after redeploy
# Solution: Normal on free tier. Consider upgrading or adding Render Disk.
```

---

## 📊 Deploy New Changes

```bash
# Make changes locally
# Test with: npm run build && npm run start

# Push changes
git add .
git commit -m "Update features"
git push origin main

# Render auto-deploys on push!
# Watch logs in dashboard
```

---

## 📝 Environment Variables Reference

```bash
# Required Variables:
NODE_ENV=production
PORT=3000
JWT_SECRET=<generate with: openssl rand -base64 64>

# Optional Variables:
DATA_DIR=/opt/render/project/server-data  # For persistent storage
```

---

## 🔧 render.yaml (Already Included)

```yaml
# Your project already has render.yaml configured
# Just push to GitHub and deploy via Blueprint!

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

---

## 📚 Need More Help?

| Need | Go To |
|------|-------|
| Quick Deploy | `QUICK_DEPLOY_RENDER.md` |
| Complete Guide | `RENDER_DEPLOYMENT.md` |
| Visual Process | `DEPLOYMENT_FLOW.md` |
| All Platforms | `DEPLOYMENT_GUIDE.md` |
| Documentation Index | `DEPLOYMENT_INDEX.md` |

---

## ⚡ One-Line Commands

```bash
# Deploy everything
npm run build && git add . && git commit -m "Deploy" && git push origin main

# Generate and show JWT_SECRET
openssl rand -base64 64 | tee jwt-secret.txt

# Health check loop
while true; do curl -s https://ohs-audit-tool.onrender.com/api/health; sleep 5; done
```

---

**🎉 You're ready to deploy!**

Start with: `npm run build && git push origin main`
Then visit: https://render.com → New Blueprint → Connect → Apply
