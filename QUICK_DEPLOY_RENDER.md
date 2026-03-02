# Quick Start: Deploy to Render in 5 Minutes

## 🚀 Fastest Way to Deploy

### Option 1: Using render.yaml (Recommended)

**1. Push to GitHub**
```bash
git add .
git commit -m "Ready for Render"
git push origin main
```

**2. Go to Render.com**
- Sign up with GitHub
- Click **New +** → **Blueprint**
- Connect your repository
- Click **Apply**

**3. Set Environment Variables**
- Go to your web service → **Environment** tab
- Add `JWT_SECRET`:
  ```bash
  openssl rand -base64 64
  # Copy output to JWT_SECRET
  ```

**4. Wait 2-3 minutes**
- Watch build logs
- Visit your URL when ready
- Register (first user = Admin)

**Done!** 🎉

---

### Option 2: Manual Setup (Dashboard)

**1. Create Web Service**
- Go to Render.com → **New +** → **Web Service**
- Connect your GitHub repository

**2. Configure:**
```
Name: ohs-audit-tool
Build Command: npm install && npm run build
Start Command: npm run start
```

**3. Environment Variables:**
```
NODE_ENV = production
PORT = 3000
JWT_SECRET = <generate with: openssl rand -base64 64>
```

**4. Create & Wait**

**Done!** 🎉

---

## ⚡ Post-Deploy Checklist

- [ ] Visit your URL
- [ ] Register admin account
- [ ] Create a project
- [ ] Run an audit
- [ ] Generate a report

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Check `package.json` has "start" script |
| Can't login | Verify JWT_SECRET is set |
| 502 errors | Wait for cold start (~30s) |
| Data lost | Expected on free tier - upgrade for persistence |

---

## 📚 Need More Details?

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for complete documentation.
