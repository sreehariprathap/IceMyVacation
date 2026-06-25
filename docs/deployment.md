# Deployment Guide — IceMyVacation

Frontend → **Vercel** | Backend → **Render**

---

## Prerequisites

- GitHub repo is pushed and public (or you have Vercel/Render connected to it)
- You have accounts on [vercel.com](https://vercel.com) and [render.com](https://render.com)
- Vercel CLI installed locally: `npm i -g vercel`

---

## Part 1 — Deploy Backend to Render

### Step 1 — Create the Render service

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**
2. Connect your GitHub repo (`IceMyVacation`)
3. Fill in:
   | Field | Value |
   |---|---|
   | Name | `icemyvacation-api` |
   | Root Directory | *(leave blank — render.yaml handles this)* |
   | Environment | `Python 3` |
   | Build Command | `pip install -r backend/requirements.txt` |
   | Start Command | `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT` |
   | Instance Type | Free (or Starter for always-on) |

   > **Tip:** Render will auto-detect `render.yaml` at the repo root and pre-fill most of this.

4. Click **Create Web Service** — do NOT add env vars yet, do that next.

### Step 2 — Set environment variables on Render

In your service dashboard → **Environment** tab, add:

| Key | Value |
|---|---|
| `DEEPSEEK_API_KEY` | Your DeepSeek API key |
| `GOOGLE_MAPS_API_KEY` | Your Google Maps key (optional) |
| `FRONTEND_URL` | Your Vercel URL once deployed, e.g. `https://icemyvacation.vercel.app` |

> Add these **before** the first deploy completes. If you add them after, trigger a manual redeploy.

### Step 3 — Get your Render API credentials (for GitHub Actions)

1. Go to [dashboard.render.com/u/settings](https://dashboard.render.com/u/settings) → **API Keys** → **Create API Key**
2. Copy the key — you won't see it again
3. Go to your service → copy the **Service ID** from the URL:
   `https://dashboard.render.com/web/srv-XXXXXXXXXX` → ID is `srv-XXXXXXXXXX`

### Step 4 — Verify the backend is live

```bash
curl https://icemyvacation-api.onrender.com/health
# Expected: {"status":"ok","service":"IceMyVacation API"}
```

> **Note:** Free tier Render services spin down after 15 min of inactivity. First request after sleep takes ~30s. Upgrade to Starter ($7/mo) for always-on.

---

## Part 2 — Deploy Frontend to Vercel

### Step 5 — Link the project to Vercel

From inside the repo root:

```bash
cd /path/to/IceMyVacation
vercel link
```

Follow the prompts:
- Set up and deploy: **Y**
- Which scope: select your account
- Link to existing project: **N** (first time) or **Y** if already created
- Project name: `icemyvacation`
- In which directory is your code: `.` (root, vercel.json handles the rest)

### Step 6 — Set the environment variable on Vercel

```bash
vercel env add VITE_API_URL production
# paste: https://icemyvacation-api.onrender.com
```

Or in the Vercel dashboard: **Project → Settings → Environment Variables**

| Key | Value | Environment |
|---|---|---|
| `VITE_API_URL` | `https://icemyvacation-api.onrender.com` | Production |

### Step 7 — Deploy to production

```bash
vercel --prod
```

Your frontend is live at `https://icemyvacation.vercel.app` (or your custom domain).

### Step 8 — Update Render's FRONTEND_URL

Now that you have the Vercel URL, go back to Render → **Environment** and update:

```
FRONTEND_URL = https://icemyvacation.vercel.app
```

Trigger a manual redeploy on Render so CORS picks it up.

### Step 9 — Get Vercel credentials (for GitHub Actions)

```bash
# Get your token
vercel whoami   # confirms login
# Token is created at vercel.com/account/tokens → Create Token → name it "github-actions"

# Get org and project IDs — shown after `vercel link`, also in .vercel/project.json
cat .vercel/project.json
# {"orgId":"team_XXXX","projectId":"prj_XXXX"}
```

---

## Part 3 — Add GitHub Actions Secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

Add all of these:

| Secret name | Where to find it |
|---|---|
| `VERCEL_TOKEN` | vercel.com/account/tokens |
| `VERCEL_ORG_ID` | `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` |
| `VITE_API_URL` | Your Render backend URL |
| `RENDER_API_KEY` | Render dashboard → Account Settings → API Keys |
| `RENDER_SERVICE_ID` | Render service URL → `srv-XXXXXXXXXX` |

---

## Part 4 — GitHub Actions Workflows

Three workflows live in `.github/workflows/`:

### Auto-deploy on push

| Workflow | Trigger | What it does |
|---|---|---|
| `deploy-frontend.yml` | Push to `main` touching `frontend/**` | Builds + deploys to Vercel production |
| `deploy-backend.yml` | Push to `main` touching `backend/**` | Triggers Render deploy + polls until live |

### Manual dispatch (for cowork / automation)

**`deploy-all.yml`** — the primary dispatch workflow. Supports:

```
target:       all | frontend-only | backend-only
environment:  production | preview   (frontend)
clear_cache:  true | false           (backend)
```

To trigger from the GitHub UI:
1. Go to **Actions → Deploy All (Frontend + Backend)**
2. Click **Run workflow**
3. Choose options → **Run workflow**

To trigger via API (for cowork dispatch):

```bash
curl -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/YOUR_USERNAME/IceMyVacation/actions/workflows/deploy-all.yml/dispatches \
  -d '{
    "ref": "main",
    "inputs": {
      "target": "all",
      "environment": "production",
      "clear_cache": "false"
    }
  }'
```

To deploy only the frontend:

```bash
-d '{"ref":"main","inputs":{"target":"frontend-only","environment":"production"}}'
```

To deploy only the backend with cache clear:

```bash
-d '{"ref":"main","inputs":{"target":"backend-only","clear_cache":"true"}}'
```

---

## Environment Variables Summary

### Backend (set on Render)

| Variable | Required | Description |
|---|---|---|
| `DEEPSEEK_API_KEY` | Yes | DeepSeek API key for itinerary generation |
| `GOOGLE_MAPS_API_KEY` | No | Google Maps (currently unused by backend) |
| `FRONTEND_URL` | Yes | Vercel URL for CORS allow-list |

### Frontend (set on Vercel + GitHub Secret)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Full URL of the Render backend, no trailing slash |

---

## Checklist — First Deploy

- [ ] Render service created and build command verified
- [ ] Render env vars set (DEEPSEEK_API_KEY, FRONTEND_URL)
- [ ] Backend health check returns `{"status":"ok"}`
- [ ] Vercel project linked (`vercel link`)
- [ ] `VITE_API_URL` set on Vercel
- [ ] Frontend deployed (`vercel --prod`) and loads in browser
- [ ] Form submits and returns itinerary (end-to-end test)
- [ ] Render `FRONTEND_URL` updated to Vercel URL and redeployed
- [ ] All 6 GitHub Actions secrets added
- [ ] Manual workflow dispatch tested from GitHub Actions tab
