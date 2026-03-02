# Render Deployment Flowchart

```
┌─────────────────────────────────────────────────────────────────┐
│                    RENDER DEPLOYMENT FLOW                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   LOCAL      │
│  DEVELOPMENT │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────────────────────────────┐
│  Test Local  │────▶│  npm run build && npm run start      │
│  Application │     │  Verify all features work correctly   │
└──────┬───────┘     └──────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│  Push to     │     git add .
│  GitHub      │     git commit -m "Ready for Render"
└──────┬───────┘     git push origin main
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RENDER.COM                                   │
└─────────────────────────────────────────────────────────────────┘
       │
       ├─────────────────┬─────────────────────────────────────┐
       │                 │                                     │
       ▼                 ▼                                     ▼
┌──────────────┐ ┌──────────────┐                   ┌──────────────┐
│   OPTION 1   │ │   OPTION 2   │                   │   OPTION 3   │
│   Dashboard  │ │ render.yaml  │                   │   Manual     │
│   (Manual)   │ │ (Blueprint)  │                   │   Setup      │
└──────┬───────┘ └──────┬───────┘                   └──────┬───────┘
       │                │                                   │
       │                │                                   │
       ▼                ▼                                   ▼
┌──────────────┐ ┌──────────────┐                   ┌──────────────┐
│  New Web     │ │  New Blueprint│                   │  New Web    │
│  Service     │ │              │                   │  Service    │
└──────┬───────┘ └──────┬───────┘                   └──────┬───────┘
       │                │                                   │
       │                │                                   │
       ▼                ▼                                   ▼
┌──────────────┐ ┌──────────────┐                   ┌──────────────┐
│  Connect     │ │  Connect     │                   │  Connect    │
│  GitHub Repo │ │  GitHub Repo │                   │  GitHub Repo│
└──────┬───────┘ └──────┬───────┘                   └──────┬───────┘
       │                │                                   │
       └────────────────┼───────────────────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │   CONFIGURE SETTINGS         │
         ├──────────────────────────────┤
         │ Name: ohs-audit-tool         │
         │ Build: npm install &&        │
         │        npm run build         │
         │ Start: npm run start         │
         │ Port: 3000                   │
         │ Plan: Free                   │
         └──────────────┬───────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │   SET ENVIRONMENT VARS       │
         ├──────────────────────────────┤
         │ NODE_ENV = production        │
         │ PORT = 3000                  │
         │ JWT_SECRET = <generate>       │
         │                              │
         │ Generate with:               │
         │ openssl rand -base64 64      │
         └──────────────┬───────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │   DEPLOY TO RENDER           │
         ├──────────────────────────────┤
         │ • Clone repository           │
         │ • Install dependencies        │
         │ • Build frontend (Vite)      │
         │ • Start Express server        │
         │ • Run health checks          │
         └──────────────┬───────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │   WAIT 2-3 MINUTES           │
         ├──────────────────────────────┤
         │ Watch build logs in dashboard│
         │ Monitor for any errors       │
         └──────────────┬───────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │   DEPLOYMENT COMPLETE ✓      │
         ├──────────────────────────────┤
         │ URL: https://ohs-audit-tool   │
         │      .onrender.com            │
         └──────────────┬───────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │   INITIAL SETUP              │
         ├──────────────────────────────┤
         │ 1. Visit your URL            │
         │ 2. Register first user        │
         │ 3. First user = Admin ✓      │
         │ 4. Create project            │
         │ 5. Run test audit            │
         └──────────────┬───────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │   LIVE AND RUNNING! 🎉       │
         ├──────────────────────────────┤
         │ • Ready for use              │
         │ • HTTPS enabled              │
         │ • Monitor logs in dashboard  │
         │ • Add custom domain (opt)    │
         └──────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                     DATA FLOW DIAGRAM                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   BROWSER    │────▶│  RENDER APP  │────▶│  FILE STORAGE│
│  (Client)    │     │  (Express)   │     │ (Ephemeral) │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                            │
                            ├───────────┬────────────┬───────────┐
                            │           │            │           │
                            ▼           ▼            ▼           ▼
                    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
                    │  users.  │ │ state.   │ │ audit.   │ │  dist/   │
                    │  json    │ │ json     │ │ log.json │ │  static  │
                    └──────────┘ └──────────┘ └──────────┘ └──────────┘
                            │
                            ▼
                    ┌──────────────────────┐
                    │   WARNING:           │
                    │   Data lost on       │
                    │   redeploy!          │
                    │                      │
                    │   Production:        │
                    │   • Add Render Disk  │
                    │   • Use Database     │
                    └──────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    TROUBLESHOOTING FLOW                          │
└─────────────────────────────────────────────────────────────────┘

PROBLEM ──▶ CHECK ──▶ SOLUTION ──▶ TEST

Build fails ──▶ package.json scripts ──▶ Add "start" script ──▶ Redeploy

Can't login  ──▶ JWT_SECRET env var ──▶ Generate new secret ──▶ Clear cache

502 errors  ──▶ Cold starting? ──▶ Wait 30 seconds ──▶ Try again

Data lost   ──▶ Free tier limits ──▶ Add Render Disk ──▶ Migrate data

Slow load   ──▶ Cold start/traffic ──▶ Upgrade plan ──▶ Monitor logs


┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION UPGRADE PATH                       │
└─────────────────────────────────────────────────────────────────┘

Free Tier                    Standard                   Production
   │                            │                            │
   ▼                            ▼                            ▼
┌──────────┐              ┌──────────┐               ┌──────────┐
│  Free    │              │  $7/mo   │               │  $70/mo  │
│  Plan    │─────────────▶│  Plan    │───────────────▶│  Plan    │
└──────────┘              └──────────┘               └──────────┘
   │                            │                            │
   ├─ 512MB RAM                 ├─ 512MB RAM                 ├─ 8GB RAM
   ├─ 0.1 CPU                   ├─ 0.5 CPU                   ├─ 4 CPU
   ├─ Cold starts              ├─ No cold starts           ├─ No cold starts
   ├─ Ephemeral storage         ├─ Ephemeral storage         ├─ Persistent
   └─ Spins down                └─ Always on                └─ Always on
   │                            │                            │
   ▼                            ▼                            ▼
  Testing                 Small Production               High Traffic
  /Demos                  /Low Volume                  /Enterprise


┌─────────────────────────────────────────────────────────────────┐
│                    QUICK REFERENCE                              │
└─────────────────────────────────────────────────────────────────┘

Deploy Commands:
┌─────────────────────────────────────────────────────────────────┐
│  git push origin main                                          │
│  # Go to render.com → New Blueprint → Connect → Apply           │
│  # Set JWT_SECRET in Environment tab                           │
│  # Wait 2-3 minutes                                             │
│  # Visit your URL!                                             │
└─────────────────────────────────────────────────────────────────┘

Generate JWT_SECRET:
┌─────────────────────────────────────────────────────────────────┐
│  openssl rand -base64 64                                       │
│  # OR                                                          │
│  node -e "console.log(require('crypto').randomBytes(64)..."    │
└─────────────────────────────────────────────────────────────────┘

Health Check:
┌─────────────────────────────────────────────────────────────────┐
│  curl https://ohs-audit-tool.onrender.com/api/health           │
│  # Expected: {"ok":true,"service":"ohs-mvp-api"}               │
└─────────────────────────────────────────────────────────────────┘

View Logs:
┌─────────────────────────────────────────────────────────────────┐
│  # Render Dashboard → Your Service → Logs tab                  │
│  # Watch real-time logs                                        │
│  # Search for errors or warnings                               │
└─────────────────────────────────────────────────────────────────┘

Deploy New Changes:
┌─────────────────────────────────────────────────────────────────┐
│  git add .                                                     │
│  git commit -m "Update"                                        │
│  git push origin main                                          │
│  # Render auto-deploys on push                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

**📚 For detailed instructions, see:**

- **[RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)** - Complete deployment guide
- **[QUICK_DEPLOY_RENDER.md](./QUICK_DEPLOY_RENDER.md)** - Quick 5-minute guide
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - All deployment options
