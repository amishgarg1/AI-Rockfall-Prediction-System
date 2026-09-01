# Deployment

Frontend on Vercel, Flask service and PostgreSQL on Render.

```
Vercel  ──►  React build (static)
              │  VITE_API_URL
              ▼
Render  ──►  Flask service  ──►  Render PostgreSQL
             /predict            users, uploads
             /api/*
```

---

## 1. Create the database

Render dashboard → **New** → **PostgreSQL**.

| Field | Value |
|---|---|
| Name | `minesafe-db` |
| Database | `minesafe` |
| Region | pick one and use the **same region** for the web service |
| Plan | free is fine to start |

When it finishes provisioning, open the database page and copy both:

- **Internal Database URL** — used by the Flask service (same-region traffic, faster, not billed as egress)
- **External Database URL** — used from your laptop

The schema is created automatically on first boot. There is no migration step
to run: `db.init_schema()` issues `CREATE TABLE IF NOT EXISTS` for `users` and
`uploads` every time the service starts.

---

## 2. Deploy the Flask service

Render dashboard → **New** → **Web Service** → connect the GitHub repo.

| Setting | Value |
|---|---|
| Language | Python 3 |
| Region | **same as the database** |
| Root Directory | `ml_service` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn app:app --bind 0.0.0.0:$PORT` |
| Health Check Path | `/api/health` |

`Root Directory` must be `ml_service`. The service imports `db` as a top-level
module, so that folder has to be the working directory. Model files are loaded
relative to the source file itself, so they resolve either way.

### Environment variables

| Key | Value |
|---|---|
| `DATABASE_URL` | the **Internal** Database URL from step 1 |
| `ALLOWED_ORIGINS` | your Vercel URL, e.g. `https://minesafe.vercel.app` |
| `PYTHON_VERSION` | `3.11.9` |
| `MAX_UPLOAD_MB` | `10` (optional) |

The `.joblib` pipelines are pickles, so `requirements.txt` pins both
scikit-learn and numpy to the versions they were written with. If `/api/health`
reports `models_loaded: false`, that pinning is the first thing to check.

`ALLOWED_ORIGINS` accepts a comma-separated list. Add your preview domain too if
you want previews to work:

```
https://minesafe.vercel.app,https://minesafe-git-main-you.vercel.app
```

Do not set `FLASK_DEBUG`. It defaults to on for local runs and gunicorn ignores
the block that reads it, but leaving it unset avoids any chance of debug mode
reaching a public host.

### Verify

```bash
curl https://your-service.onrender.com/api/health
```

Expected:

```json
{ "status": "ok", "database": "connected", "models_loaded": true }
```

If `database` says anything else, `DATABASE_URL` is wrong or the database is in
a different region. If `models_loaded` is `false`, check the build log — the
`.joblib` files must be committed to the repo.

---

## 3. Deploy the frontend

Vercel dashboard → **Add New** → **Project** → import the same repo.

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Root Directory | `./` (repo root) |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### Environment variable

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://your-service.onrender.com` |

This one matters more than it looks. Vite **inlines** environment variables at
build time, so `VITE_API_URL` has to exist in Vercel's build environment.
Adding it after a deploy does nothing until you redeploy.

Once the Vercel URL exists, go back and put it in Render's `ALLOWED_ORIGINS`,
then redeploy the Render service. Until you do, the browser blocks every API
call as a CORS error.

---

## 4. Local development

Run the frontend and Flask as before. With no `VITE_API_URL` set, the frontend
falls back to `http://127.0.0.1:5000`.

Point Flask at a database — the simplest option is the Render one:

```bash
# PowerShell
$env:DATABASE_URL = "<External Database URL>"
python ml_service/app.py
```

```bash
# bash
export DATABASE_URL="<External Database URL>"
python ml_service/app.py
```

The external URL needs TLS; `db.py` adds `sslmode=require` automatically if the
URL does not already specify one, so pasting Render's URL as-is works.

To keep local data separate, run Postgres in Docker instead:

```bash
docker run -d --name minesafe-db -e POSTGRES_PASSWORD=devpw -e POSTGRES_DB=minesafe -p 5432:5432 postgres:16-alpine
```

```
DATABASE_URL=postgresql://postgres:devpw@localhost:5432/minesafe?sslmode=disable
```

---

## 5. Things that will bite you

**Free Render services sleep.** After about 15 minutes of no traffic the
service spins down, and the next request takes roughly 50 seconds to wake it.
Open the health check URL a few minutes before any demo.

**The frontend and the service deploy separately.** Pushing to `main` triggers
both, but they finish at different times. A frontend built against an API shape
the backend has not deployed yet will fail until the service catches up.

**Old accounts were not migrated.** Authentication previously used an Excel
workbook, which has been removed along with the accounts in it. Anyone who had
signed up before the move needs to sign up again.

**Vercel's per-deployment URLs are not stable.** Every deploy gets its own
`project-<hash>-scope.vercel.app` address. Put the *production* domain in
`ALLOWED_ORIGINS`, not one of those — a hash URL works until the next deploy
and then silently breaks CORS.

**Deployment Protection makes the site private.** Vercel can require a login to
view a deployment, which turns the public link into a Vercel sign-in page for
everyone but the owner. Settings > Deployment Protection > Vercel Authentication
> Disabled.

---

## API reference

| Method | Path | Body | Purpose |
|---|---|---|---|
| GET | `/api/health` | — | Liveness plus database and model status |
| POST | `/api/signup` | JSON | Create an account |
| POST | `/api/login` | JSON | Sign in, returns the user profile |
| POST | `/api/uploads` | multipart (`email`, `file`) | Store a file |
| GET | `/api/uploads?email=` | — | List a user's files (metadata only) |
| GET | `/api/uploads/<id>?email=` | — | Download one file |
| POST | `/predict` | JSON | Run inference |

Signup requires `fullName`, `email`, `password`, `userRole`, `mineLocation` and
`phoneNumber`; passwords must be at least 8 characters. Emails are unique
case-insensitively.

### Current limitation

Login returns the user profile but no session token, and the frontend keeps the
profile in `localStorage`. That is enough to gate the UI, but it is not
authentication: the upload endpoints trust the `email` value the caller sends,
so anyone who knows an address can read that account's files. Before this holds
real data, issue a signed token on login and verify it on every `/api/uploads`
request.
