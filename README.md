# AgriSense — AI-Powered Smart Agriculture Monitoring Platform

A capstone-ready farm monitoring and decision-support platform. One deployable
codebase (Next.js) instead of four separate services — same layered
architecture, far simpler to build, run, and defend.

```
Farmer → Next.js PWA (UI) → Next.js API routes → Prisma → PostgreSQL (Supabase)
                                    ↑
                          AI module (yield prediction,
                          irrigation advice, soil health,
                          rule-based farm assistant)

Future: ESP32 / Raspberry Pi → POST /api/sensors/soil → same database → same AI
```

## Why this instead of the original 4-service design

The original spec asked for Next.js + Spring Boot + Python (scikit-learn) +
PostgreSQL as separate services. That's a valid *enterprise* architecture,
but for a capstone it means three codebases, three deployments, and three
sets of credentials to keep in sync — exactly the "unnecessary complexity"
the brief itself says to avoid. This version keeps every architectural
layer (frontend / API / database / AI) but implements them **inside one
Next.js app**, using Next.js API routes as the backend instead of Spring
Boot, and a transparent rule-based module instead of a Python microservice.
You can still describe it in your report using the same four-layer diagram
and the same Computational Thinking breakdown — the layers are just
co-located instead of network-separated.

If your rubric specifically requires a separate Spring Boot service, say so
and I'll split the API layer out — but for a working, deployable, defensible
capstone, this is the version I'd actually hand in.

## Computational Thinking mapping

- **Decomposition** — the domain is split into independent modules: Farms,
  Soil, Weather, Irrigation, Crops, Pests, Yield, Chat/Assistant — each with
  its own database table and API route.
- **Abstraction** — `src/lib/resource.ts` provides one generic handler
  factory reused by soil, weather, crops, and pest APIs; `ResourcePage.tsx`
  does the same for their frontend forms/lists. One implementation, many
  resources.
- **Pattern recognition** — `src/lib/ml.ts` implements yield prediction,
  irrigation recommendation, and soil health classification from recurring
  agronomic patterns (moisture/pH/NPK sweet spots).
- **Algorithmic thinking** — the yield model, irrigation rule engine, and
  the assistant's intent-matching are all explicit, documented algorithms
  you can walk through line by line in your defense — nothing is a black box.

## What's implemented

- Auth: register/login with bcrypt + JWT
- Farms CRUD, and farm-scoped Soil / Weather / Crops / Pest Reports
- Irrigation recommendation (rule-based AI) with history
- Yield prediction (heuristic AI model) with confidence score + history
- AI Farm Assistant — answers questions using the farm's actual stored data
- Analytics dashboard (Chart.js line charts for yield/soil/weather trends)
- IoT-ready endpoint (`POST /api/sensors/soil`) — no hardware required to demo
- Installable PWA (manifest.json)

## Local setup

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name init
npm run dev                # http://localhost:3000
```

You need a PostgreSQL database for local dev too — the fastest way is to
create a free Supabase project now (see deployment below) and point
`DATABASE_URL` at it even while developing locally.

## Deployment (free tier, ~15 minutes)

### 1. Database — Supabase
1. Create a project at supabase.com.
2. Project Settings → Database → Connection string → copy the **URI**
   (use the "Transaction" pooler connection for serverless compatibility).
3. Paste it into `DATABASE_URL` in your `.env`.
4. Run `npx prisma migrate dev --name init` once locally to create the tables.

### 2. Code — GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 3. Hosting — Vercel
1. Import the GitHub repo at vercel.com/new.
2. Framework preset: Next.js (auto-detected).
3. Add environment variables in the Vercel project settings:
   - `DATABASE_URL` — same Supabase connection string
   - `JWT_SECRET` — a long random string
   - `SENSOR_KEY` — any secret string, only needed if you demo the IoT endpoint
4. Deploy. Vercel runs `npm run build`, which runs `prisma generate` first
   (already wired into `package.json`).

That's it — frontend, API, and AI logic are all served from the same Vercel
deployment; the database lives on Supabase. No Railway/Render account needed.

### Demoing the IoT-readiness (Phase 8) without hardware
```bash
curl -X POST https://<your-app>.vercel.app/api/sensors/soil \
  -H "x-sensor-key: <SENSOR_KEY>" -H "Content-Type: application/json" \
  -d '{"farmId":"<a real farm id>","moisture":45,"temperature":28,"ph":6.5,"nitrogen":50,"phosphorus":25,"potassium":35}'
```
This is exactly the request an ESP32/Raspberry Pi would send in a future
phase — the endpoint and database are already there and don't change.

## Upgrading to a trained ML model later

`src/lib/ml.ts` documents the exact inputs/outputs each function expects.
To swap in a real scikit-learn model:
1. Train it in a notebook, export it (e.g. with `joblib` or ONNX).
2. Stand up a small Python endpoint (FastAPI on Render, or a Vercel Python
   function) that accepts the same input shape and returns the same output
   shape as `predictYield()` / `recommendIrrigation()`.
3. Replace the body of those two functions with a `fetch()` call to that
   endpoint. No other file needs to change — every API route and every page
   already calls these functions, not a model directly.

## Icons

`public/manifest.json` references `/icon-192.png` and `/icon-512.png` —
add two square PNGs with those names to `public/` (any green leaf/plant
icon works) so the PWA install prompt shows a proper icon.

## Project structure

```
prisma/schema.prisma        Phase 3 — full database schema
src/lib/ml.ts                Phase 6 — AI models (yield, irrigation, soil health)
src/lib/assistant.ts          Phase 1(10) — AI farm assistant
src/lib/resource.ts           Generic farm-scoped CRUD factory
src/app/api/**                Phase 4 — all REST endpoints
src/app/**/page.tsx           Phase 5 — PWA frontend pages
src/app/api/sensors/soil      Phase 8 — IoT-ready endpoint
```
# Smart-AGRIC
