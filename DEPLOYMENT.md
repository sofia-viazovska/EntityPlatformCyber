# Deployment

This project should use a hosted PostgreSQL database for production. Firebase is possible, but it would require rewriting the backend data layer because the current app is built around SQLAlchemy relational tables.

## Recommended Setup

- Database: managed PostgreSQL from Supabase, Neon, Railway, Render, or a VPS Postgres instance.
- Backend: Docker container running FastAPI.
- Frontend: Docker container running Nginx and the built React app.
- Domain: point the domain to the server or hosting provider, then put HTTPS in front of the frontend.

## Create The Database

Create a hosted PostgreSQL database and copy its connection string. It should look like:

```text
postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require
```

The backend creates the required tables on startup and, while `SEED_DEMO_DATA=true`, seeds the demo levels.

## Supabase

Your Supabase project URL, for example `https://poqujxkigjryqdigsnaf.supabase.co`, is not the Postgres connection string. It is the public Supabase API URL.

For this FastAPI app, use the Postgres connection string from the Supabase dashboard:

1. Open the Supabase project.
2. Click **Connect** in the top bar.
3. Choose **Connection string**.
4. For app hosting, prefer the **Transaction pooler** connection string on port `6543` because it is IPv4-compatible and connection-pooled.
5. Replace `[YOUR-PASSWORD]` with the database password you set when creating the project.

For this project, the pooled Supabase URL should be similar to:

```text
postgresql://postgres.poqujxkigjryqdigsnaf:YOUR_DATABASE_PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require
```

If you deploy to a server with reliable IPv6 support, the direct connection can also work:

```text
postgresql://postgres:YOUR_DATABASE_PASSWORD@db.poqujxkigjryqdigsnaf.supabase.co:5432/postgres?sslmode=require
```

Supabase documents that direct connections are IPv6-oriented by default, while the pooler is the safer choice for many app hosting environments.

## Production Environment

Copy the example file:

```bash
cp .env.production.example .env.production
```

Then edit `.env.production`:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require
SECRET_KEY=a-long-random-secret
CORS_ORIGINS=https://your-domain.com
VITE_API_URL=/api
SEED_DEMO_DATA=true
WEB_CONCURRENCY=2
```

Keep `.env.production` private. Do not commit it.

## Deploy With Docker Compose

On the server:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
```

Check the API:

```bash
curl http://localhost:8000/
curl "http://localhost:8000/leaderboard?page=1&page_size=10"
```

The frontend is served on port `80`.

## Deploy On Render

If the repository is connected to Render, use **New > Blueprint** and select this repo. Render reads `render.yaml` and creates:

- `entity-platform-api`: Docker FastAPI backend.
- `entity-platform`: static React frontend.

When Render asks for `DATABASE_URL`, paste the Supabase pooler connection string:

```text
postgresql://postgres.poqujxkigjryqdigsnaf:YOUR_DATABASE_PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require
```

The frontend is configured to call:

```text
https://entity-platform-api.onrender.com
```

If Render changes the backend service URL because the name is already taken, update the frontend service environment variable `VITE_API_URL` to the real backend URL and redeploy the static site.

## Before The Real Competition

- Replace `SECRET_KEY`.
- Use HTTPS.
- Keep `DATABASE_URL` private.
- Confirm `CORS_ORIGINS` matches the real domain.
- Confirm all real assignments and hashes are in the seed file or database.
- After final tasks are loaded, set `SEED_DEMO_DATA=false` if you do not want restarts to rewrite seeded level content.
- Take a database backup before opening registration.
